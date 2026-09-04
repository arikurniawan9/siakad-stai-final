<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Tampilkan Visual Audit Log Viewer & Activity Security Tracker
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $actionFilter = $request->input('action');
        $dateFilter = $request->input('date');

        $logsQuery = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
            ->select(
                'audit_logs.*',
                'users.name as actor_name',
                'users.role as actor_role',
                'users.identity_number as actor_nim_nidn'
            );

        if ($actionFilter) {
            $logsQuery->where('audit_logs.action', $actionFilter);
        }

        if ($dateFilter) {
            $logsQuery->whereDate('audit_logs.created_at', $dateFilter);
        }

        if ($search) {
            $logsQuery->where(function ($q) use ($search) {
                $q->where('audit_logs.action', 'ilike', "%{$search}%")
                  ->orWhere('users.name', 'ilike', "%{$search}%")
                  ->orWhere('audit_logs.ip_address', 'ilike', "%{$search}%")
                  ->orWhere('audit_logs.target_entity', 'ilike', "%{$search}%")
                  ->orWhere('audit_logs.details::text', 'ilike', "%{$search}%");
            });
        }

        $logs = $logsQuery->orderBy('audit_logs.id', 'desc')->paginate(20)->withQueryString();

        // Statistik
        $totalLogs = DB::table('audit_logs')->count();
        $impersonateLogs = DB::table('audit_logs')->where('action', 'like', 'IMPERSONATE%')->count();
        $gradeLogs = DB::table('audit_logs')->where('action', 'like', 'GRADE%')->count();
        $paymentLogs = DB::table('audit_logs')->where('action', 'like', '%PAYMENT%')->count();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'stats' => [
                'total' => $totalLogs,
                'impersonate' => $impersonateLogs,
                'grade' => $gradeLogs,
                'payment' => $paymentLogs,
            ],
            'filters' => [
                'search' => $search,
                'action' => $actionFilter,
                'date' => $dateFilter,
            ],
        ]);
    }

    /**
     * Ekspor Audit Log ke CSV Berdasarkan Filter
     */
    public function exportCsv(Request $request)
    {
        $search = $request->input('search');
        $actionFilter = $request->input('action');
        $dateFilter = $request->input('date');

        $logsQuery = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
            ->select(
                'audit_logs.*',
                'users.name as actor_name',
                'users.role as actor_role',
                'users.identity_number as actor_nim_nidn'
            );

        if ($actionFilter) {
            $logsQuery->where('audit_logs.action', $actionFilter);
        }

        if ($dateFilter) {
            $logsQuery->whereDate('audit_logs.created_at', $dateFilter);
        }

        if ($search) {
            $logsQuery->where(function ($q) use ($search) {
                $q->where('audit_logs.action', 'ilike', "%{$search}%")
                  ->orWhere('users.name', 'ilike', "%{$search}%")
                  ->orWhere('audit_logs.ip_address', 'ilike', "%{$search}%")
                  ->orWhere('audit_logs.target_entity', 'ilike', "%{$search}%")
                  ->orWhere('audit_logs.details::text', 'ilike', "%{$search}%");
            });
        }

        $logs = $logsQuery->orderBy('audit_logs.id', 'desc')->limit(5000)->get();

        $filename = 'audit_logs_' . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['ID', 'Waktu', 'Aktor', 'Peran', 'NIM/NIDN', 'Aksi Event', 'Target Entitas', 'Target ID', 'IP Address', 'User Agent', 'Detail Payload']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at,
                    $log->actor_name ?? 'System',
                    $log->actor_role ?? 'system',
                    $log->actor_nim_nidn ?? '-',
                    $log->action,
                    $log->target_entity ?? '-',
                    $log->target_id ?? '-',
                    $log->ip_address,
                    $log->user_agent,
                    is_string($log->details) ? $log->details : json_encode($log->details),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Pembersihan (Prune) Log Lawas untuk Menghemat Ruang Database
     */
    public function pruneLogs(Request $request)
    {
        $days = (int) $request->input('days', 90);
        if ($days < 7) $days = 7;

        $cutoffDate = now()->subDays($days);
        $deleted = DB::table('audit_logs')
            ->where('created_at', '<', $cutoffDate)
            ->delete();

        // Rekam aksi audit
        DB::table('audit_logs')->insert([
            'user_id' => auth()->id(),
            'action' => 'AUDIT_LOG_PRUNE',
            'target_entity' => 'audit_logs',
            'details' => json_encode(['deleted_records' => $deleted, 'days_threshold' => $days, 'cutoff' => $cutoffDate->toDateTimeString()]),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Berhasil membersihkan {$deleted} rekaman audit log yang lebih tua dari {$days} hari.");
    }
}

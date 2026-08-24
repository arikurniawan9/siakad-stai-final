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
}

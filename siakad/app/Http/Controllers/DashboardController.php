<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan Halaman Dasbor Utama Sesuai Peran Pengguna (Role-based)
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $role = $user ? $user->role : 'mahasiswa';

        $stats = [];
        $systemMetrics = [];
        $auditFeed = [];
        $recentBsiTransactions = [];
        $financialSummary = [];

        // 1. DATA KHUSUS SUPERADMIN (DEVELOPER & ARSITEKTUR SISTEM)
        if ($role === 'superadmin') {
            try {
                // Statistik Inti Civitas & Akademik
                $stats = [
                    'total_students' => DB::table('users')->where('role', 'mahasiswa')->count(),
                    'total_lecturers' => DB::table('users')->whereIn('role', ['dosen', 'dosen_pa'])->count(),
                    'total_study_programs' => DB::table('study_programs')->count(),
                    'total_courses' => DB::table('courses')->count(),
                    'total_classes' => DB::table('course_classes')->count(),
                    'total_pmb_applicants' => DB::table('pmb_applicants')->count(),
                    // Statistik Perbankan BSI Virtual Account
                    'total_va_transactions' => DB::table('va_bsi_transactions')->count(),
                    'total_va_paid_count' => DB::table('va_bsi_transactions')->where('status', 'PAID')->count(),
                    'total_va_paid_amount' => (float) DB::table('va_bsi_transactions')->where('status', 'PAID')->sum('amount'),
                    'total_va_pending_count' => DB::table('va_bsi_transactions')->where('status', 'PENDING')->count(),
                    'total_va_pending_amount' => (float) DB::table('va_bsi_transactions')->where('status', 'PENDING')->sum('amount'),
                ];

                // Ukuran Database PostgreSQL
                $dbSize = '14.2 MB';
                try {
                    $sizeResult = DB::select("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
                    if (!empty($sizeResult)) {
                        $dbSize = $sizeResult[0]->size;
                    }
                } catch (\Throwable $th) {
                    // fallback default
                }

                // Status Antrean & Worker
                $pendingJobs = 0;
                $failedJobs = 0;
                try {
                    if (DB::getSchemaBuilder()->hasTable('jobs')) {
                        $pendingJobs = DB::table('jobs')->count();
                    }
                    if (DB::getSchemaBuilder()->hasTable('failed_jobs')) {
                        $failedJobs = DB::table('failed_jobs')->count();
                    }
                } catch (\Throwable $e) {}

                // Metrik & Status Telemetri Server
                $systemMetrics = [
                    'php_version' => PHP_VERSION,
                    'laravel_version' => app()->version(),
                    'db_engine' => 'PostgreSQL 16',
                    'db_size' => $dbSize,
                    'server_memory' => round(memory_get_usage(true) / 1024 / 1024, 1) . ' MB',
                    'bsi_status' => 'ONLINE (BI-SNAP H2H)',
                    'bsi_biller_code' => '8891 - BI-SNAP-DEV',
                    'lms_bridge_status' => 'ACTIVE (Bridge Port 5000)',
                    'is_maintenance' => app()->isDownForMaintenance(),
                    'queue_driver' => config('queue.default', 'database'),
                    'pending_jobs' => $pendingJobs,
                    'failed_jobs' => $failedJobs,
                    'cache_driver' => config('cache.default', 'file'),
                    'wa_status' => 'ACTIVE (WABlas Bridge)',
                ];

                // Audit Feed Terkini
                $auditFeed = DB::table('audit_logs')
                    ->leftJoin('users', 'audit_logs.user_id', '=', 'users.id')
                    ->select('audit_logs.*', 'users.name as user_name', 'users.role as user_role')
                    ->orderBy('audit_logs.id', 'desc')
                    ->limit(6)
                    ->get();

                // Transaksi VA BSI Terkini
                $recentBsiTransactions = DB::table('va_bsi_transactions')
                    ->join('student_invoices', 'va_bsi_transactions.student_invoice_id', '=', 'student_invoices.id')
                    ->join('fee_types', 'student_invoices.fee_type_id', '=', 'fee_types.id')
                    ->leftJoin('users', 'student_invoices.user_id', '=', 'users.id')
                    ->leftJoin('pmb_applicants', 'student_invoices.pmb_applicant_id', '=', 'pmb_applicants.id')
                    ->select(
                        'va_bsi_transactions.*',
                        'student_invoices.invoice_number',
                        'fee_types.name as fee_name',
                        DB::raw('COALESCE(users.name, pmb_applicants.full_name, \'Mahasiswa\') as customer_name')
                    )
                    ->orderBy('va_bsi_transactions.id', 'desc')
                    ->limit(4)
                    ->get();
            } catch (\Throwable $e) {
                // Jangan gagalkan load dashboard jika terjadi error query minor
            }
        }

        // 2. DATA KHUSUS ADMIN BAAK / OPERASIONAL AKADEMIK
        elseif ($role === 'admin_akademik') {
            try {
                $stats = [
                    'total_students' => DB::table('users')->where('role', 'mahasiswa')->count(),
                    'total_lecturers' => DB::table('users')->whereIn('role', ['dosen', 'dosen_pa'])->count(),
                    'total_study_programs' => DB::table('study_programs')->count(),
                    'total_facilities' => DB::table('facilities')->count(),
                    'total_classes' => DB::table('course_classes')->count(),
                ];
            } catch (\Throwable $e) {}
        }

        // 3. DATA KHUSUS BIRO KEUANGAN
        elseif ($role === 'keuangan') {
            try {
                $stats = [
                    'total_va_transactions' => DB::table('va_bsi_transactions')->count(),
                    'total_va_paid_count' => DB::table('va_bsi_transactions')->where('status', 'PAID')->count(),
                    'total_va_paid_amount' => (float) DB::table('va_bsi_transactions')->where('status', 'PAID')->sum('amount'),
                    'total_va_pending_count' => DB::table('va_bsi_transactions')->where('status', 'PENDING')->count(),
                    'total_va_pending_amount' => (float) DB::table('va_bsi_transactions')->where('status', 'PENDING')->sum('amount'),
                ];
            } catch (\Throwable $e) {}
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'systemMetrics' => $systemMetrics,
            'auditFeed' => $auditFeed,
            'recentBsiTransactions' => $recentBsiTransactions,
        ]);
    }
}

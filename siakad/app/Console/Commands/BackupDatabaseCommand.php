<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BackupDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'siakad:backup-database {--retention=14 : Number of most recent backups to keep}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Otomatisasi Backup Seluruh Database SIAKAD ke JSON dan Pembersihan Arsip Lawas';

    /**
     * Daftar tabel yang dicakup dalam Backup & Restore (Diurutkan sesuai relasi)
     */
    private function getTablesToBackup(): array
    {
        return [
            'users',
            'campus_officials',
            'document_signatories',
            'faculties',
            'study_programs',
            'grading_scales',
            'sks_limits',
            'graduation_predicates',
            'academic_degrees',
            'curricula',
            'courses',
            'course_prerequisites',
            'academic_years',
            'academic_periods',
            'structural_positions',
            'lecturer_positions',
            'buildings',
            'rooms',
            'pmb_periods',
            'pmb_applicants',
            'pmb_documents',
            'fee_types',
            'fee_tariffs',
            'student_invoices',
            'va_bsi_transactions',
            'winpay_transactions',
            'fee_dispensations',
            'course_classes',
            'class_schedules',
            'exam_schedules',
            'class_meetings',
            'attendances',
            'class_lecturers',
            'class_enrollments',
            'krs_submissions',
            'krs_items',
            'edom_questionnaires',
            'edom_questions',
            'edom_responses',
            'student_edom_completions',
            'course_grades',
            'khs_records',
            'transcripts',
            'transfer_grade_conversions',
            'thesis_submissions',
            'student_activities',
            'student_leave_requests',
            'yudisium_periods',
            'yudisium_applicants',
            'system_settings',
            'announcements',
            'audit_logs',
        ];
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai pencadangan database SIAKAD...');

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $tables = $this->getTablesToBackup();
        $exportData = [];
        $totalRows = 0;

        foreach ($tables as $t) {
            if (DB::getSchemaBuilder()->hasTable($t)) {
                $rows = DB::table($t)->get()->map(fn($r) => (array) $r)->toArray();
                $exportData[$t] = $rows;
                $totalRows += count($rows);
            }
        }

        $backupPayload = [
            'app_name' => config('app.name', 'SIAKAD STAI Al-Ittihad'),
            'app_env' => config('app.env'),
            'created_at' => now()->toIso8601String(),
            'created_by' => 'System Scheduler (Cron)',
            'created_by_id' => null,
            'total_tables' => count($exportData),
            'total_rows' => $totalRows,
            'data' => $exportData,
        ];

        $filename = 'backup_siakad_' . date('Y-m-d_His') . '.json';
        $filePath = $backupDir . '/' . $filename;

        File::put($filePath, json_encode($backupPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $fileSizeKb = round(filesize($filePath) / 1024, 2);

        $this->info("✅ Berhasil membuat cadangan database: {$filename} ({$fileSizeKb} KB, {$totalRows} baris)");

        // Rekam aksi ke audit log
        try {
            DB::table('audit_logs')->insert([
                'user_id' => null,
                'action' => 'DATABASE_AUTO_BACKUP',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Artisan Scheduler / CLI',
                'target_entity' => 'Database',
                'target_id' => $filename,
                'details' => json_encode([
                    'filename' => $filename,
                    'total_tables' => count($exportData),
                    'total_rows' => $totalRows,
                    'size_kb' => $fileSizeKb,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal mencatat audit log auto backup: ' . $e->getMessage());
        }

        // Jalankan retensi backup (hapus file lama jika melebihi limit)
        $retention = (int) $this->option('retention');
        if ($retention > 0) {
            $files = File::glob($backupDir . '/*.json');
            if (count($files) > $retention) {
                // Urutkan dari terlama ke terbaru
                usort($files, fn($a, $b) => filemtime($a) <=> filemtime($b));
                $toDelete = count($files) - $retention;
                for ($i = 0; $i < $toDelete; $i++) {
                    File::delete($files[$i]);
                    $this->warn("🗑️ Menghapus arsip backup usang: " . basename($files[$i]));
                }
            }
        }

        return Command::SUCCESS;
    }
}

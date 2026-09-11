<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FixPostgresSequencesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'siakad:fix-sequences 
                            {--table= : Sinkronisasi hanya tabel tertentu (contoh: --table=class_lecturers)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi seluruh sequence PostgreSQL auto-increment ke MAX(id) untuk mencegah Unique Violation Error (23505)';

    /**
     * Alternative aliases.
     *
     * @var array<string>
     */
    protected $aliases = ['db:fix-sequences'];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔧 Memeriksa konfigurasi sequence PostgreSQL SIAKAD STAI Al-Ittihad...');

        if (DB::getDriverName() !== 'pgsql') {
            $this->warn('⚠️  Koneksi basis data saat ini bukan PostgreSQL (' . DB::getDriverName() . '). Perintah ini hanya diperlukan untuk PostgreSQL.');
            return Command::SUCCESS;
        }

        $specificTable = $this->option('table');

        if ($specificTable) {
            return $this->syncSingleTable($specificTable);
        }

        return $this->syncAllSequences();
    }

    /**
     * Sinkronisasi tabel spesifik
     */
    private function syncSingleTable(string $tableName): int
    {
        if (!DB::getSchemaBuilder()->hasTable($tableName)) {
            $this->error("❌ Tabel '{$tableName}' tidak ditemukan dalam basis data.");
            return Command::FAILURE;
        }

        try {
            $maxId = DB::table($tableName)->max('id');
            $maxIdVal = (int) ($maxId ?? 0);
            
            if ($maxIdVal > 0) {
                DB::statement("SELECT setval(pg_get_serial_sequence('{$tableName}', 'id'), {$maxIdVal}, true)");
                $nextVal = $maxIdVal + 1;
            } else {
                DB::statement("SELECT setval(pg_get_serial_sequence('{$tableName}', 'id'), 1, false)");
                $nextVal = 1;
            }

            $this->info("✅ Berhasil menyinkronkan sequence tabel [{$tableName}]: Max ID = {$maxIdVal}, Next ID = {$nextVal}.");
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("❌ Gagal menyinkronkan sequence tabel [{$tableName}]: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Sinkronisasi seluruh sequence di basis data
     */
    private function syncAllSequences(): int
    {
        try {
            $sequences = DB::select("
                SELECT 
                    c.relname AS seq_name, 
                    t.relname AS table_name, 
                    a.attname AS col_name
                FROM pg_class c
                JOIN pg_depend d ON d.objid = c.oid
                JOIN pg_class t ON t.oid = d.refobjid
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relkind = 'S' 
                  AND t.relkind = 'r'
                  AND n.nspname = 'public'
                ORDER BY t.relname ASC
            ");

            if (empty($sequences)) {
                $this->warn('ℹ️ Tidak ada sequence serial yang terdeteksi via katalog pg_class.');
            }

            $rows = [];
            $successCount = 0;
            $syncedTables = [];

            foreach ($sequences as $seq) {
                try {
                    $maxVal = DB::table($seq->table_name)->max($seq->col_name);
                    $maxValInt = (int) ($maxVal ?? 0);

                    if ($maxValInt > 0) {
                        DB::statement("SELECT setval('{$seq->seq_name}', {$maxValInt}, true)");
                        $nextVal = $maxValInt + 1;
                    } else {
                        DB::statement("SELECT setval('{$seq->seq_name}', 1, false)");
                        $nextVal = 1;
                    }

                    $rows[] = [
                        $seq->table_name,
                        $seq->col_name,
                        $seq->seq_name,
                        $maxValInt,
                        $nextVal,
                        'OK'
                    ];
                    $syncedTables[] = $seq->table_name;
                    $successCount++;
                } catch (\Throwable $e) {
                    $rows[] = [
                        $seq->table_name,
                        $seq->col_name,
                        $seq->seq_name,
                        '-',
                        '-',
                        'ERROR: ' . Str::limit($e->getMessage(), 30)
                    ];
                }
            }

            // Fallback untuk tabel-tabel utama yang mungkin sequence-nya belum masuk katalog di atas
            $explicitTables = [
                'class_lecturers', 'course_classes', 'class_schedules', 'class_enrollments',
                'courses', 'users', 'academic_periods', 'academic_years', 'study_programs',
                'faculties', 'curricula', 'krs_items', 'krs_submissions', 'course_grades',
                'khs_records', 'student_invoices', 'va_bsi_transactions', 'fee_tariffs'
            ];

            foreach ($explicitTables as $tbl) {
                if (!in_array($tbl, $syncedTables) && DB::getSchemaBuilder()->hasTable($tbl)) {
                    try {
                        $maxVal = DB::table($tbl)->max('id');
                        $maxValInt = (int) ($maxVal ?? 0);
                        if ($maxValInt > 0) {
                            DB::statement("SELECT setval(pg_get_serial_sequence('{$tbl}', 'id'), {$maxValInt}, true)");
                            $nextVal = $maxValInt + 1;
                        } else {
                            DB::statement("SELECT setval(pg_get_serial_sequence('{$tbl}', 'id'), 1, false)");
                            $nextVal = 1;
                        }
                        $rows[] = [
                            $tbl,
                            'id',
                            pg_get_serial_sequence($tbl, 'id') ?: 'auto',
                            $maxValInt,
                            $nextVal,
                            'OK (Explicit)'
                        ];
                        $successCount++;
                    } catch (\Throwable $e) {}
                }
            }

            $this->table(
                ['Tabel', 'Kolom', 'Sequence', 'Max ID', 'Next Val', 'Status'],
                $rows
            );

            $this->info("🎉 Selesai! Sebanyak {$successCount} sequence PostgreSQL berhasil disinkronkan ke MAX(id).");
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('❌ Terjadi kesalahan saat sinkronisasi sequence: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}

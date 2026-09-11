<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Sinkronisasi seluruh sequence auto-increment PostgreSQL ke MAX(id)
     * untuk mencegah error SQLSTATE[23505] Unique Violation pada pkey
     * akibat data seeder / import berkas / SQL dump dengan ID eksplisit.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        try {
            // 1. Sinkronisasi dinamis berdasarkan katalog sistem PostgreSQL
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
            ");

            $syncedTables = [];

            foreach ($sequences as $seq) {
                try {
                    $maxVal = DB::table($seq->table_name)->max($seq->col_name);
                    if ($maxVal !== null && $maxVal > 0) {
                        DB::statement("SELECT setval('{$seq->seq_name}', {$maxVal}, true)");
                    } else {
                        DB::statement("SELECT setval('{$seq->seq_name}', 1, false)");
                    }
                    $syncedTables[] = $seq->table_name;
                } catch (\Throwable $e) {
                    Log::warning("Migration sequence sync warning on table {$seq->table_name}: " . $e->getMessage());
                }
            }

            // 2. Fallback eksplisit untuk tabel-tabel utama SIAKAD
            $explicitTables = [
                'class_lecturers',
                'course_classes',
                'class_schedules',
                'class_enrollments',
                'courses',
                'users',
                'academic_periods',
                'academic_years',
                'study_programs',
                'faculties',
                'curricula',
                'krs_items',
                'krs_submissions',
                'course_grades',
                'khs_records',
                'student_invoices',
                'va_bsi_transactions',
                'fee_tariffs',
                'pmb_applicants',
            ];

            foreach ($explicitTables as $tbl) {
                if (!in_array($tbl, $syncedTables) && DB::getSchemaBuilder()->hasTable($tbl)) {
                    try {
                        DB::statement("SELECT setval(pg_get_serial_sequence('{$tbl}', 'id'), COALESCE((SELECT MAX(id) FROM \"{$tbl}\"), 1), (SELECT MAX(id) FROM \"{$tbl}\") IS NOT NULL)");
                    } catch (\Throwable $e) {
                        // ignore if table doesn't use serial sequence on id
                    }
                }
            }

            Log::info('Migration sync_all_postgresql_sequences successfully executed for all PostgreSQL tables.');
        } catch (\Throwable $e) {
            Log::error('Migration sync_all_postgresql_sequences error: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op: nilai sequence tidak perlu di-rollback
    }
};

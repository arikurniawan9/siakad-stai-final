<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\CurriculumEnhancementSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DatabaseController extends Controller
{
    /**
     * Daftar tabel yang dicakup dalam Backup & Restore (Diurutkan sesuai relasi)
     */
    private function getTablesToBackup(): array
    {
        return [
            'users',
            'faculties',
            'study_programs',
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
            'yudisium_periods',
            'yudisium_applicants',
            'system_settings',
            'announcements',
            'audit_logs',
        ];
    }

    /**
     * Helper: Resync all PostgreSQL Sequences
     */
    private function resyncSequences(): void
    {
        try {
            $sequences = DB::select("
                SELECT c.relname AS seq_name, t.relname AS table_name, a.attname AS col_name
                FROM pg_class c
                JOIN pg_depend d ON d.objid = c.oid
                JOIN pg_class t ON t.oid = d.refobjid
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
                WHERE c.relkind = 'S' AND t.relkind = 'r'
            ");

            foreach ($sequences as $seq) {
                try {
                    $maxVal = DB::table($seq->table_name)->max($seq->col_name) ?? 0;
                    $nextVal = max($maxVal, 1);
                    DB::statement("SELECT setval('{$seq->seq_name}', {$nextVal})");
                } catch (\Exception $e) {}
            }
        } catch (\Exception $e) {
            Log::warning('Sequence resync warning: ' . $e->getMessage());
        }
    }

    /**
     * Tampilan Halaman Backup, Restore, dan Seeder Database (Khusus Superadmin)
     */
    public function index(): Response
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak. Fitur Database Management hanya dapat diakses oleh Super Administrator.');
        }

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        // Ambil daftar file backup
        $files = File::glob($backupDir . '/*.json');
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            $sizeBytes = filesize($file);
            $createdAt = filemtime($file);

            // Baca metadata ringkas jika file valid JSON
            $meta = [];
            try {
                $raw = File::get($file);
                $json = json_decode($raw, true);
                if (is_array($json)) {
                    $meta = [
                        'app_name' => $json['app_name'] ?? 'SIAKAD',
                        'total_tables' => $json['total_tables'] ?? count($json['data'] ?? []),
                        'total_rows' => $json['total_rows'] ?? 0,
                        'created_by' => $json['created_by'] ?? 'System',
                        'timestamp' => $json['created_at'] ?? date('c', $createdAt),
                    ];
                }
            } catch (\Exception $e) {}

            $backups[] = [
                'filename' => $filename,
                'size_kb' => round($sizeBytes / 1024, 2),
                'size_mb' => round($sizeBytes / (1024 * 1024), 2),
                'created_at' => date('d M Y H:i:s', $createdAt),
                'timestamp' => $createdAt,
                'meta' => $meta,
            ];
        }

        // Urutkan backup terbaru di paling atas
        usort($backups, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        // Statistik Tabel Database
        $tables = $this->getTablesToBackup();
        $tableStats = [];
        $totalDatabaseRows = 0;

        foreach ($tables as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $count = DB::table($table)->count();
                $tableStats[] = [
                    'name' => $table,
                    'rows' => $count,
                ];
                $totalDatabaseRows += $count;
            }
        }

        // Ukuran Database PostgreSQL
        $dbSize = '0 MB';
        try {
            $sizeResult = DB::select("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
            if (!empty($sizeResult)) {
                $dbSize = $sizeResult[0]->size;
            }
        } catch (\Exception $e) {}

        return Inertia::render('Admin/Database/Index', [
            'backups' => $backups,
            'tableStats' => $tableStats,
            'dbInfo' => [
                'driver' => config('database.default'),
                'database' => config('database.connections.pgsql.database'),
                'host' => config('database.connections.pgsql.host'),
                'port' => config('database.connections.pgsql.port'),
                'size' => $dbSize,
                'total_tables' => count($tableStats),
                'total_rows' => $totalDatabaseRows,
            ],
        ]);
    }

    /**
     * Buat Backup Database Baru (.json)
     */
    public function createBackup(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

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
            'created_by' => Auth::user()?->name ?? 'Superadmin',
            'created_by_id' => Auth::id(),
            'total_tables' => count($exportData),
            'total_rows' => $totalRows,
            'data' => $exportData,
        ];

        $filename = 'backup_siakad_' . date('Y-m-d_His') . '.json';
        $filePath = $backupDir . '/' . $filename;

        File::put($filePath, json_encode($backupPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Catat Audit Log
        DB::table('audit_logs')->insert([
            'user_id' => Auth::id(),
            'action' => 'DATABASE_BACKUP_CREATE',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_entity' => 'Database',
            'target_id' => $filename,
            'details' => json_encode([
                'filename' => $filename,
                'total_tables' => count($exportData),
                'total_rows' => $totalRows,
                'size_kb' => round(filesize($filePath) / 1024, 2),
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Backup database '{$filename}' berhasil dibuat! ({$totalRows} baris data dari " . count($exportData) . " tabel tersimpan).");
    }

    /**
     * Unduh File Backup
     */
    public function downloadBackup(string $filename): BinaryFileResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $filename = basename($filename);
        $filePath = storage_path('app/backups/' . $filename);

        if (!File::exists($filePath)) {
            abort(404, 'File backup tidak ditemukan.');
        }

        return response()->download($filePath, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * Hapus File Backup
     */
    public function deleteBackup(Request $request, string $filename): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $filename = basename($filename);
        $filePath = storage_path('app/backups/' . $filename);

        if (File::exists($filePath)) {
            File::delete($filePath);

            // Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_BACKUP_DELETE',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'DatabaseBackup',
                'target_id' => $filename,
                'details' => json_encode(['filename' => $filename]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "File backup '{$filename}' telah berhasil dihapus dari server.");
        }

        return back()->with('error', "File backup '{$filename}' tidak ditemukan.");
    }

    /**
     * Restore Database dari File Backup Server / Upload File
     */
    public function restoreBackup(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $filename = $request->input('filename');
        $uploadedFile = $request->file('backup_file');
        $jsonContent = null;
        $sourceName = '';

        if ($uploadedFile) {
            $request->validate([
                'backup_file' => 'required|file|mimes:json,txt|max:51200', // max 50MB
            ]);
            $sourceName = $uploadedFile->getClientOriginalName();
            $jsonContent = json_decode(File::get($uploadedFile->getRealPath()), true);
        } elseif ($filename) {
            $safeName = basename($filename);
            $filePath = storage_path('app/backups/' . $safeName);
            if (!File::exists($filePath)) {
                return back()->with('error', "File backup '{$safeName}' tidak ditemukan.");
            }
            $sourceName = $safeName;
            $jsonContent = json_decode(File::get($filePath), true);
        } else {
            return back()->with('error', 'Silakan pilih file backup yang ingin di-restore.');
        }

        if (!is_array($jsonContent) || !isset($jsonContent['data']) || !is_array($jsonContent['data'])) {
            return back()->with('error', 'Format file backup tidak valid. Pastikan file JSON hasil backup SIAKAD STAI Al-Ittihad.');
        }

        $data = $jsonContent['data'];
        $restoredTables = 0;
        $restoredRows = 0;

        try {
            DB::transaction(function () use ($data, &$restoredTables, &$restoredRows) {
                // 1. Truncate tabel dalam urutan terbalik
                foreach (array_reverse(array_keys($data)) as $table) {
                    if (DB::getSchemaBuilder()->hasTable($table)) {
                        DB::statement("TRUNCATE TABLE {$table} CASCADE");
                    }
                }

                // 2. Masukkan data per tabel dalam batch
                foreach ($data as $table => $rows) {
                    if (DB::getSchemaBuilder()->hasTable($table) && !empty($rows)) {
                        foreach (array_chunk($rows, 50) as $chunk) {
                            DB::table($table)->insert($chunk);
                        }
                        $restoredTables++;
                        $restoredRows += count($rows);
                    }
                }

                // 3. Sinkronkan semua sequence PostgreSQL
                $this->resyncSequences();
            });

            // Catat ke Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_RESTORE',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'Database',
                'target_id' => $sourceName,
                'details' => json_encode([
                    'source' => $sourceName,
                    'restored_tables' => $restoredTables,
                    'restored_rows' => $restoredRows,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "✅ Database BERHASIL DI-RESTORE dari '{$sourceName}'! Sebanyak {$restoredRows} baris data pada {$restoredTables} tabel berhasil dipulihkan.");
        } catch (\Exception $e) {
            Log::error('Restore Database Error: ' . $e->getMessage());
            return back()->with('error', 'Gagal memulihkan database: ' . $e->getMessage());
        }
    }

    /**
     * Eksekusi Database Seeder untuk Pengembangan (Development Seeder)
     */
    public function runSeeder(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $type = $request->input('type', 'full'); // full | pmb | finance | curriculum

        try {
            $msg = '';

            if ($type === 'full') {
                // Jalankan DatabaseSeeder
                $seeder = new DatabaseSeeder();
                $seeder->run();
                $this->resyncSequences();
                $msg = 'Full Master & Dummy Seeder berhasil dieksekusi! Data Civitas, Prodi, Kurikulum, dan Tagihan telah diperbarui.';
            } elseif ($type === 'pmb') {
                // Generate 5 Pendaftar PMB Baru
                $pmbPeriod = DB::table('pmb_periods')->where('is_active', true)->first();
                $prodis = DB::table('study_programs')->where('is_active', true)->get();

                $names = [
                    'Faisal Akbar Ramadhan', 'Zaskia Nur Fatimah', 'Rizky Alamsyah Pratama',
                    'Annisa Salsabila Putri', 'M. Ilham Wahyudi'
                ];

                $countCreated = 0;
                foreach ($names as $idx => $name) {
                    $prodi = $prodis[$idx % count($prodis)];
                    $countToday = DB::table('pmb_applicants')->count() + 1;
                    $regNumber = 'PMB-' . date('Y') . '-' . str_pad($countToday, 4, '0', STR_PAD_LEFT);

                    $appId = DB::table('pmb_applicants')->insertGetId([
                        'pmb_period_id' => $pmbPeriod?->id ?? 1,
                        'registration_number' => $regNumber,
                        'full_name' => $name,
                        'nik' => '320301' . rand(1000000000, 9999999999),
                        'phone_number' => '0812' . rand(10000000, 99999999),
                        'email' => strtolower(str_replace(' ', '.', $name)) . '@gmail.com',
                        'gender' => $idx % 2 === 0 ? 'L' : 'P',
                        'birth_place' => 'Cianjur',
                        'birth_date' => '2005-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                        'address' => 'Jl. K.H. Abdullah Bin Nuh No. ' . rand(1, 100) . ', Cianjur',
                        'previous_school' => 'MAN ' . rand(1, 3) . ' Cianjur',
                        'first_choice_program_id' => $prodi->id,
                        'pathway' => 'REGULER',
                        'status' => $idx === 0 ? 'TERVERIFIKASI_BAYAR' : 'MENUNGGU_PEMBAYARAN',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $invId = DB::table('student_invoices')->insertGetId([
                        'invoice_number' => 'INV-PMB-' . date('Ymd') . '-' . str_pad($appId, 4, '0', STR_PAD_LEFT),
                        'pmb_applicant_id' => $appId,
                        'fee_type_id' => 1,
                        'amount' => 250000.00,
                        'final_amount' => 250000.00,
                        'due_date' => now()->addDays(7),
                        'status' => $idx === 0 ? 'LUNAS' : 'BELUM_BAYAR',
                        'paid_at' => $idx === 0 ? now() : null,
                        'payment_method' => $idx === 0 ? 'VA_BSI' : null,
                        'notes' => "Biaya Pendaftaran PMB Online - {$name}",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $vaNumber = '992801' . date('y') . str_pad($appId, 4, '0', STR_PAD_LEFT);
                    DB::table('va_bsi_transactions')->insert([
                        'student_invoice_id' => $invId,
                        'va_number' => $vaNumber,
                        'channel' => 'BSI_MOBILE',
                        'amount' => 250000.00,
                        'status' => $idx === 0 ? 'PAID' : 'PENDING',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $countCreated++;
                }

                $this->resyncSequences();
                $msg = "Seeder PMB Berhasil! Sebanyak {$countCreated} calon mahasiswa baru + Invoice & VA BSI telah dibuat.";
            } elseif ($type === 'finance') {
                // Generate Tagihan SPP Kuliah Mahasiswa
                $students = DB::table('users')->where('role', 'mahasiswa')->get();
                $feeType = DB::table('fee_types')->where('code', 'SPP')->first() ?? DB::table('fee_types')->first();

                $invCreated = 0;
                foreach ($students as $stu) {
                    $invNumber = 'INV-SPP-' . date('Ym') . '-' . str_pad($stu->id, 4, '0', STR_PAD_LEFT);
                    $invId = DB::table('student_invoices')->insertGetId([
                        'invoice_number' => $invNumber,
                        'user_id' => $stu->id,
                        'fee_type_id' => $feeType->id,
                        'amount' => 1500000.00,
                        'final_amount' => 1500000.00,
                        'due_date' => now()->addDays(30),
                        'status' => 'BELUM_BAYAR',
                        'notes' => 'Tagihan SPP Semester Ganjil 2026/2027',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $vaNumber = '992802' . date('y') . str_pad($stu->id, 4, '0', STR_PAD_LEFT);
                    DB::table('va_bsi_transactions')->insert([
                        'student_invoice_id' => $invId,
                        'va_number' => $vaNumber,
                        'channel' => 'BSI_MOBILE',
                        'amount' => 1500000.00,
                        'status' => 'PENDING',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $invCreated++;
                }

                $this->resyncSequences();
                $msg = "Seeder Keuangan Berhasil! Sebanyak {$invCreated} tagihan SPP & VA BSI mahasiswa telah digenerate.";
            } elseif ($type === 'curriculum') {
                $seeder = new CurriculumEnhancementSeeder();
                $seeder->run();
                $this->resyncSequences();
                $msg = 'Seeder Kurikulum OBE & Matakuliah Berhasil Diperbarui!';
            }

            // Catat ke Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_SEEDER_RUN',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'Database',
                'target_id' => strtoupper($type),
                'details' => json_encode(['type' => $type, 'message' => $msg]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "🌱 {$msg}");
        } catch (\Exception $e) {
            Log::error('Seeder Execution Error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menjalankan seeder: ' . $e->getMessage());
        }
    }
}

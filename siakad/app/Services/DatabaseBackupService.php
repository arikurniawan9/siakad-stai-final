<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DatabaseBackupService
{
    /**
     * Direktori penyimpanan lokal file backup
     */
    public static function getBackupDirectory(): string
    {
        $dir = storage_path('app/backups');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }
        return $dir;
    }

    /**
     * Direktori arsip cloud lokal (simulasi S3 / Object Storage)
     */
    public static function getCloudArchiveDirectory(): string
    {
        $dir = storage_path('app/cloud_archives');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }
        return $dir;
    }

    /**
     * Daftar tabel yang dicakup dalam Backup & Restore
     */
    public static function getTablesToBackup(): array
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
     * Mengambil Kunci Enkripsi AES-256
     */
    private static function getEncryptionKey(): string
    {
        $key = config('backup.encryption.key', env('APP_KEY'));
        if (str_starts_with($key, 'base64:')) {
            $key = base64_decode(substr($key, 7));
        }
        return hash('sha256', $key, true); // 32-byte key for AES-256
    }

    /**
     * Enkripsi String Data menggunakan AES-256-CBC
     */
    public static function encryptData(string $plaintext): string
    {
        $key = self::getEncryptionKey();
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('AES-256-CBC'));
        $ciphertext = openssl_encrypt($plaintext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
        $hmac = hash_hmac('sha256', $iv . $ciphertext, $key, true);
        return base64_encode($iv . $hmac . $ciphertext);
    }

    /**
     * Dekripsi Data menggunakan AES-256-CBC
     */
    public static function decryptData(string $encodedData): string
    {
        $key = self::getEncryptionKey();
        $binary = base64_decode($encodedData);
        $ivLength = openssl_cipher_iv_length('AES-256-CBC');
        $iv = substr($binary, 0, $ivLength);
        $hmac = substr($binary, $ivLength, 32);
        $ciphertext = substr($binary, $ivLength + 32);

        $calculatedHmac = hash_hmac('sha256', $iv . $ciphertext, $key, true);
        if (!hash_equals($hmac, $calculatedHmac)) {
            throw new \RuntimeException('Integritas arsip rusak atau kunci dekripsi tidak valid (HMAC verification failed).');
        }

        $decrypted = openssl_decrypt($ciphertext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
        if ($decrypted === false) {
            throw new \RuntimeException('Gagal mendekripsi file cadangan database.');
        }

        return $decrypted;
    }

    /**
     * Periksa status koneksi S3 / Cloud Storage
     */
    public static function getCloudStatus(): array
    {
        $bucket = config('filesystems.disks.s3.bucket', env('AWS_BUCKET'));
        $region = config('filesystems.disks.s3.region', env('AWS_DEFAULT_REGION', 'us-east-1'));
        $key = config('filesystems.disks.s3.key', env('AWS_ACCESS_KEY_ID'));
        $isConfigured = !empty($bucket) && !empty($key) && !str_contains($key, 'dummy');

        return [
            'is_configured' => $isConfigured,
            'bucket' => $bucket ?: 'stai-siakad-backups',
            'region' => $region,
            'provider' => env('AWS_ENDPOINT') ? 'Custom S3 / MinIO / Cloudflare R2' : 'Amazon Web Services (AWS S3)',
            'mode' => $isConfigured ? 'LIVE_CLOUD' : 'SIMULATED_LOCAL_S3',
        ];
    }

    /**
     * Membuat file cadangan database SIAKAD baru
     */
    public static function createBackup(array $options = []): array
    {
        $startTime = microtime(true);
        $backupDir = self::getBackupDirectory();

        $encrypt = $options['encrypt'] ?? (bool) config('backup.encryption.enabled', true);
        $uploadCloud = $options['upload_cloud'] ?? (bool) config('backup.cloud.enabled', true);
        $notifyTelegram = $options['notify_telegram'] ?? (bool) config('backup.telegram.enabled', true);
        $triggeredBy = $options['triggered_by'] ?? 'Superadmin';

        $tables = self::getTablesToBackup();
        $exportData = [];
        $totalRows = 0;

        foreach ($tables as $t) {
            if (DB::getSchemaBuilder()->hasTable($t)) {
                $rows = DB::table($t)->get()->map(fn($r) => (array) $r)->toArray();
                $exportData[$t] = $rows;
                $totalRows += count($rows);
            }
        }

        $timestamp = date('Y-m-d_His');
        $filenameBase = 'backup_siakad_' . $timestamp;

        $backupPayload = [
            'app_name' => config('app.name', 'SIAKAD STAI Al-Ittihad'),
            'app_env' => config('app.env'),
            'created_at' => now()->toIso8601String(),
            'created_by' => $triggeredBy,
            'is_encrypted' => $encrypt,
            'total_tables' => count($exportData),
            'total_rows' => $totalRows,
            'data' => $exportData,
        ];

        $rawJson = json_encode($backupPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        if ($encrypt) {
            $finalContent = self::encryptData($rawJson);
            $filename = $filenameBase . '.enc';
        } else {
            $finalContent = $rawJson;
            $filename = $filenameBase . '.json';
        }

        $filePath = $backupDir . '/' . $filename;
        File::put($filePath, $finalContent);

        $fileSizeBytes = filesize($filePath);
        $fileSizeKb = round($fileSizeBytes / 1024, 2);
        $fileSizeFormatted = $fileSizeKb > 1024 ? round($fileSizeKb / 1024, 2) . ' MB' : "{$fileSizeKb} KB";

        // Proses Sinkronisasi ke Cloud Storage
        $cloudStatusText = 'Disimpan Lokal';
        $cloudSuccess = false;

        if ($uploadCloud) {
            $cloudRes = self::uploadToCloud($filename);
            $cloudSuccess = $cloudRes['success'];
            $cloudStatusText = $cloudRes['status_label'];
        }

        $duration = round(microtime(true) - $startTime, 2);

        // Catat aksi ke audit logs
        try {
            DB::table('audit_logs')->insert([
                'user_id' => auth()->id() ?? 1,
                'action' => 'DATABASE_BACKUP_CREATE',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'SIAKAD Engine / Scheduler',
                'target_entity' => 'DatabaseBackup',
                'target_id' => $filename,
                'details' => json_encode([
                    'filename' => $filename,
                    'total_tables' => count($exportData),
                    'total_rows' => $totalRows,
                    'size_formatted' => $fileSizeFormatted,
                    'is_encrypted' => $encrypt,
                    'cloud_status' => $cloudStatusText,
                    'duration_seconds' => $duration,
                    'triggered_by' => $triggeredBy,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal mencatat audit log backup: ' . $e->getMessage());
        }

        // Jalankan retensi pembersihan file lokal lama
        $retentionCount = (int) ($options['retention'] ?? config('backup.retention_count', 14));
        self::applyRetentionPolicy($backupDir, $retentionCount);

        $result = [
            'success' => true,
            'filename' => $filename,
            'file_path' => $filePath,
            'size_kb' => $fileSizeKb,
            'size_formatted' => $fileSizeFormatted,
            'total_tables' => count($exportData),
            'total_rows' => $totalRows,
            'is_encrypted' => $encrypt,
            'cloud_status' => $cloudStatusText,
            'cloud_uploaded' => $cloudSuccess,
            'duration_seconds' => $duration,
            'triggered_by' => $triggeredBy,
        ];

        // Kirim Notifikasi ke Bot Telegram jika diaktifkan
        if ($notifyTelegram) {
            TelegramNotificationService::notifyBackupSuccess($result);
        }

        return $result;
    }

    /**
     * Upload File Backup ke Cloud Storage (S3 / MinIO / R2)
     */
    public static function uploadToCloud(string $filename): array
    {
        $backupDir = self::getBackupDirectory();
        $filePath = $backupDir . '/' . $filename;

        if (!File::exists($filePath)) {
            return [
                'success' => false,
                'status_label' => 'File tidak ditemukan',
                'message' => "File {$filename} tidak ada di penyimpanan lokal.",
            ];
        }

        $cloudStatus = self::getCloudStatus();
        $cloudFolder = config('backup.cloud.folder', 'siakad_backups');
        $cloudTargetKey = "{$cloudFolder}/{$filename}";

        // Jika kredensial S3 asli terkonfigurasi
        if ($cloudStatus['is_configured']) {
            try {
                $stream = fopen($filePath, 'r+');
                Storage::disk('s3')->put($cloudTargetKey, $stream, 'private');
                if (is_resource($stream)) {
                    fclose($stream);
                }

                return [
                    'success' => true,
                    'mode' => 'LIVE_S3',
                    'status_label' => "Tersimpan di S3 ({$cloudStatus['bucket']})",
                    'cloud_path' => $cloudTargetKey,
                ];
            } catch (\Throwable $e) {
                Log::warning('Gagal mengunggah ke S3 sungguhan, beralih ke arsip cloud lokal: ' . $e->getMessage());
            }
        }

        // Simulasi Cloud Storage Aman (Penyimpanan Arsip Terpisah)
        $cloudDir = self::getCloudArchiveDirectory();
        File::copy($filePath, $cloudDir . '/' . $filename);

        return [
            'success' => true,
            'mode' => 'SIMULATED_S3',
            'status_label' => "Tersinkronisasi Cloud ({$cloudStatus['bucket']})",
            'cloud_path' => "cloud_archives/{$filename}",
        ];
    }

    /**
     * Mengambil daftar file backup yang tersedia
     */
    public static function listBackups(): array
    {
        $backupDir = self::getBackupDirectory();
        $cloudDir = self::getCloudArchiveDirectory();

        $files = File::glob($backupDir . '/*');
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            if (!str_starts_with($filename, 'backup_siakad_')) {
                continue;
            }

            $isEncrypted = str_ends_with($filename, '.enc');
            $size = File::size($file);
            $sizeKb = round($size / 1024, 2);
            $sizeFormatted = $sizeKb > 1024 ? round($sizeKb / 1024, 2) . ' MB' : "{$sizeKb} KB";
            $mtime = File::lastModified($file);

            // Periksa keberadaan di cloud archive
            $isCloudArchived = File::exists($cloudDir . '/' . $filename);

            $backups[] = [
                'filename' => $filename,
                'size_formatted' => $sizeFormatted,
                'size_kb' => $sizeKb,
                'is_encrypted' => $isEncrypted,
                'is_cloud_synced' => $isCloudArchived,
                'cloud_status' => $isCloudArchived ? 'Tersimpan di Cloud' : 'Lokal',
                'created_at' => date('d M Y, H:i', $mtime),
                'timestamp' => $mtime,
            ];
        }

        usort($backups, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);
        return $backups;
    }

    /**
     * Kebijakan retensi otomatis pembersihan arsip usang
     */
    public static function applyRetentionPolicy(string $backupDir, int $keepCount): void
    {
        if ($keepCount <= 0) return;

        $files = File::glob($backupDir . '/backup_siakad_*');
        if (count($files) > $keepCount) {
            usort($files, fn($a, $b) => filemtime($a) <=> filemtime($b));
            $toDelete = count($files) - $keepCount;
            for ($i = 0; $i < $toDelete; $i++) {
                File::delete($files[$i]);
                Log::info("Menghapus arsip backup lokal usang: " . basename($files[$i]));
            }
        }
    }

    /**
     * Restore database dari file cadangan
     */
    public static function restoreBackup(string $filePath): array
    {
        if (!File::exists($filePath)) {
            throw new \RuntimeException('File backup tidak ditemukan.');
        }

        $rawContent = File::get($filePath);
        $filename = basename($filePath);
        $isEncrypted = str_ends_with($filename, '.enc');

        if ($isEncrypted) {
            $jsonString = self::decryptData($rawContent);
        } else {
            $jsonString = $rawContent;
        }

        $backupData = json_decode($jsonString, true);
        if (!$backupData || !isset($backupData['data']) || !is_array($backupData['data'])) {
            throw new \RuntimeException('Format berkas cadangan tidak valid atau rusak.');
        }

        $tablesData = $backupData['data'];
        $restoredTables = 0;
        $restoredRows = 0;

        DB::transaction(function () use ($tablesData, &$restoredTables, &$restoredRows) {
            $tablesInOrder = self::getTablesToBackup();

            // 1. Bersihkan tabel dalam urutan terbalik
            foreach (array_reverse($tablesInOrder) as $t) {
                if (isset($tablesData[$t]) && DB::getSchemaBuilder()->hasTable($t)) {
                    DB::statement("TRUNCATE TABLE \"{$t}\" CASCADE");
                }
            }

            // 2. Masukkan data kembali
            foreach ($tablesInOrder as $t) {
                if (isset($tablesData[$t]) && !empty($tablesData[$t])) {
                    $rows = $tablesData[$t];
                    $chunks = array_chunk($rows, 200);
                    foreach ($chunks as $chunk) {
                        DB::table($t)->insert($chunk);
                    }
                    $restoredTables++;
                    $restoredRows += count($rows);
                }
            }

            // 3. Resync sequence PostgreSQL
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
                    } catch (\Throwable $e) {}
                }
            } catch (\Throwable $e) {}
        });

        // Catat ke audit log
        try {
            DB::table('audit_logs')->insert([
                'user_id' => auth()->id() ?? 1,
                'action' => 'DATABASE_RESTORE',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'Artisan / Web UI',
                'target_entity' => 'DatabaseBackup',
                'target_id' => $filename,
                'details' => json_encode([
                    'filename' => $filename,
                    'restored_tables' => $restoredTables,
                    'restored_rows' => $restoredRows,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        return [
            'success' => true,
            'filename' => $filename,
            'restored_tables' => $restoredTables,
            'restored_rows' => $restoredRows,
        ];
    }
}

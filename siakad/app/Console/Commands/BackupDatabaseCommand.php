<?php

namespace App\Console\Commands;

use App\Services\DatabaseBackupService;
use App\Services\TelegramNotificationService;
use Illuminate\Console\Command;

class BackupDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'siakad:backup-database 
                            {--retention=14 : Jumlah arsip backup terbaru yang disimpan}
                            {--encrypt : Enkripsi berkas cadangan dengan AES-256-CBC}
                            {--no-encrypt : Simpan berkas cadangan tanpa enkripsi (plain JSON)}
                            {--cloud : Unggah arsip ke Cloud Storage (S3 / Object Storage)}
                            {--no-cloud : Lewati pengunggahan ke Cloud Storage}
                            {--telegram : Kirim laporan ringkas ke Bot Telegram Sentinel}
                            {--no-telegram : Jangan kirim notifikasi ke Telegram}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pencadangan Otomatis Database SIAKAD, Enkripsi AES-256, Cloud Archiving, dan Notifikasi Telegram';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Memulai pencadangan basis data SIAKAD STAI Al-Ittihad...');

        // Tentukan konfigurasi enkripsi
        $encrypt = config('backup.encryption.enabled', true);
        if ($this->option('encrypt')) {
            $encrypt = true;
        } elseif ($this->option('no-encrypt')) {
            $encrypt = false;
        }

        // Tentukan konfigurasi cloud archiving
        $uploadCloud = config('backup.cloud.enabled', true);
        if ($this->option('cloud')) {
            $uploadCloud = true;
        } elseif ($this->option('no-cloud')) {
            $uploadCloud = false;
        }

        // Tentukan konfigurasi notifikasi Telegram
        $notifyTelegram = config('backup.telegram.enabled', true);
        if ($this->option('telegram')) {
            $notifyTelegram = true;
        } elseif ($this->option('no-telegram')) {
            $notifyTelegram = false;
        }

        $retention = (int) $this->option('retention');

        try {
            $result = DatabaseBackupService::createBackup([
                'encrypt' => $encrypt,
                'upload_cloud' => $uploadCloud,
                'notify_telegram' => $notifyTelegram,
                'retention' => $retention,
                'triggered_by' => 'Artisan Scheduler (Cron CLI)',
            ]);

            $this->info("✅ Berhasil membuat cadangan database!");
            $this->line("   📁 Berkas: {$result['filename']}");
            $this->line("   📊 Ukuran: {$result['size_formatted']}");
            $this->line("   🗄️ Cakupan: {$result['total_tables']} Tabel ({$result['total_rows']} Baris)");
            $this->line("   🔒 Enkripsi: " . ($result['is_encrypted'] ? 'AES-256-CBC' : 'Tidak (Plain)'));
            $this->line("   ☁️ Cloud: {$result['cloud_status']}");
            $this->line("   ⏱️ Durasi: {$result['duration_seconds']} detik");

            if ($notifyTelegram) {
                $this->comment("📢 Notifikasi telah diproses oleh Telegram Sentinel.");
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("❌ Gagal melakukan pencadangan database: " . $e->getMessage());

            if ($notifyTelegram) {
                TelegramNotificationService::notifyBackupFailed($e->getMessage(), [
                    'triggered_by' => 'Artisan Scheduler (Cron CLI)',
                ]);
            }

            return Command::FAILURE;
        }
    }
}

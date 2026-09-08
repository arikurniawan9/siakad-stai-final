<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class TelegramNotificationService
{
    /**
     * Mengambil Token Bot Telegram dari Konfigurasi / Env
     */
    private static function getBotToken(): string
    {
        return (string) config('backup.telegram.bot_token', env('TELEGRAM_BOT_TOKEN', ''));
    }

    /**
     * Mengambil Chat ID Telegram Tujuan
     */
    private static function getChatId(): string
    {
        return (string) config('backup.telegram.chat_id', env('TELEGRAM_CHAT_ID', ''));
    }

    /**
     * Memeriksa apakah Bot Telegram Aktif dan Memiliki Kredensial Valid
     */
    public static function isConfigured(): bool
    {
        $token = self::getBotToken();
        $chatId = self::getChatId();
        return !empty($token) && !empty($chatId) && !str_contains($token, 'dummy') && !str_contains($token, 'sandbox');
    }

    /**
     * Kirim Pesan Teks Telegram
     */
    public static function sendMessage(string $message, string $parseMode = 'HTML'): array
    {
        $token = self::getBotToken();
        $chatId = self::getChatId();

        if (empty($message)) {
            return [
                'success' => false,
                'message' => 'Isi pesan tidak boleh kosong.',
            ];
        }

        // Mode Simulasi jika Token belum diisi atau Environment lokal tanpa token aktif
        if (!self::isConfigured()) {
            Log::info("[TELEGRAM NOTIFICATION SIMULATION]\nTarget Chat: {$chatId}\nMessage:\n" . strip_tags($message));

            try {
                DB::table('audit_logs')->insert([
                    'user_id' => auth()->id() ?? 1,
                    'action' => 'TELEGRAM_NOTIFICATION_SIMULATED',
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                    'target_entity' => 'TelegramSentinel',
                    'target_id' => $chatId ?: 'SIMULATED_CHANNEL',
                    'details' => json_encode([
                        'chat_id' => $chatId,
                        'message_preview' => mb_substr(strip_tags($message), 0, 150) . '...',
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {
                // Ignore audit log error
            }

            return [
                'success' => true,
                'simulated' => true,
                'status' => 'SIMULATED_SUCCESS',
                'message' => 'Simulasi notifikasi Telegram Sentinel berhasil dicatat ke log audit.',
            ];
        }

        try {
            $url = "https://api.telegram.org/bot{$token}/sendMessage";
            $response = Http::timeout(10)->post($url, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true,
            ]);

            $resData = $response->json();

            // Catat log pengiriman di DB
            try {
                DB::table('audit_logs')->insert([
                    'user_id' => auth()->id() ?? 1,
                    'action' => 'TELEGRAM_NOTIFICATION_SENT',
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                    'target_entity' => 'TelegramSentinel',
                    'target_id' => $chatId,
                    'details' => json_encode([
                        'chat_id' => $chatId,
                        'status_code' => $response->status(),
                        'ok' => $resData['ok'] ?? false,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {
                // Ignore
            }

            if ($response->successful() && ($resData['ok'] ?? false)) {
                return [
                    'success' => true,
                    'simulated' => false,
                    'status' => 'SENT',
                    'message' => 'Pesan notifikasi Telegram berhasil dikirimkan.',
                    'response' => $resData,
                ];
            }

            return [
                'success' => false,
                'simulated' => false,
                'status' => 'FAILED',
                'message' => 'Telegram API Error: ' . ($resData['description'] ?? 'Unknown Error'),
                'response' => $resData,
            ];
        } catch (\Throwable $e) {
            Log::error("[TELEGRAM ERROR] Gagal mengirim pesan: " . $e->getMessage());
            return [
                'success' => false,
                'simulated' => false,
                'status' => 'EXCEPTION',
                'message' => 'Gagal menghubungi Telegram Server: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim Dokumen / Berkas File ke Telegram (Maks. 45 MB)
     */
    public static function sendDocument(string $filePath, string $caption = '', string $parseMode = 'HTML'): array
    {
        $token = self::getBotToken();
        $chatId = self::getChatId();

        if (!File::exists($filePath)) {
            return [
                'success' => false,
                'message' => 'File arsip yang akan dikirim tidak ditemukan di server.',
            ];
        }

        $fileSizeMb = round(filesize($filePath) / (1024 * 1024), 2);
        if ($fileSizeMb > 45) {
            return [
                'success' => false,
                'message' => "Ukuran file ({$fileSizeMb} MB) melebihi batas upload dokumen Telegram (45 MB).",
            ];
        }

        if (!self::isConfigured()) {
            Log::info("[TELEGRAM DOCUMENT SIMULATION] File: {$filePath} ({$fileSizeMb} MB) to Chat ID: {$chatId}");
            return [
                'success' => true,
                'simulated' => true,
                'message' => "Simulasi pengiriman dokumen Telegram ({$fileSizeMb} MB) berhasil.",
            ];
        }

        try {
            $url = "https://api.telegram.org/bot{$token}/sendDocument";
            $filename = basename($filePath);

            $response = Http::timeout(60)
                ->attach('document', file_get_contents($filePath), $filename)
                ->post($url, [
                    'chat_id' => $chatId,
                    'caption' => $caption,
                    'parse_mode' => $parseMode,
                ]);

            $resData = $response->json();
            return [
                'success' => $response->successful() && ($resData['ok'] ?? false),
                'simulated' => false,
                'message' => $resData['description'] ?? 'Dokumen berhasil dikirim ke Telegram.',
                'response' => $resData,
            ];
        } catch (\Throwable $e) {
            Log::error("[TELEGRAM DOCUMENT ERROR] " . $e->getMessage());
            return [
                'success' => false,
                'simulated' => false,
                'message' => 'Gagal mengirim dokumen ke Telegram: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Template: Laporan Keberhasilan Pencadangan Database SIAKAD
     */
    public static function notifyBackupSuccess(array $details): array
    {
        $appName = config('app.name', 'SIAKAD STAI Al-Ittihad');
        $env = strtoupper(config('app.env', 'production'));
        $time = now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') . ' WIB';

        $filename = $details['filename'] ?? 'backup_siakad.json';
        $fileSize = $details['size_formatted'] ?? ($details['size_kb'] ? round($details['size_kb'] / 1024, 2) . ' MB' : '-');
        $tablesCount = $details['total_tables'] ?? '-';
        $rowsCount = number_format((int) ($details['total_rows'] ?? 0), 0, ',', '.');
        $encrypted = !empty($details['is_encrypted']) ? '🔒 Ya (AES-256-CBC Enkripsi Aktif)' : '🔓 Tidak (Plain JSON/SQL)';
        $cloudStatus = $details['cloud_status'] ?? 'Lokal Server';
        $duration = isset($details['duration_seconds']) ? "{$details['duration_seconds']} detik" : '-';
        $triggeredBy = $details['triggered_by'] ?? 'Cron Scheduler';

        $msg = "🏛️ <b>{$appName}</b>\n";
        $msg .= "🛡️ <b>LAPORAN PENCADANGAN BASIS DATA</b>\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "✅ <b>Status:</b> BERHASIL (SUCCESS)\n";
        $msg .= "⏱️ <b>Waktu:</b> {$time}\n";
        $msg .= "📁 <b>File:</b> <code>{$filename}</code>\n";
        $msg .= "📊 <b>Ukuran:</b> {$fileSize}\n";
        $msg .= "🗄️ <b>Cakupan:</b> {$tablesCount} Tabel | {$rowsCount} Baris Data\n";
        $msg .= "🔐 <b>Enkripsi:</b> {$encrypted}\n";
        $msg .= "☁️ <b>Cloud Archiving:</b> {$cloudStatus}\n";
        $msg .= "⚡ <b>Durasi Proses:</b> {$duration}\n";
        $msg .= "👤 <b>Inisiator:</b> {$triggeredBy}\n";
        $msg .= "🖥️ <b>Lingkungan:</b> {$env} Server Node\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "<i>Sistem kepatuhan data otomatis sesuai standar audit akreditasi BAN-PT & ISO 27001.</i>";

        $res = self::sendMessage($msg);

        // Jika opsi send_document aktif dan file tersedia
        $sendDoc = config('backup.telegram.send_document', false);
        $filePath = $details['file_path'] ?? null;
        if ($sendDoc && $filePath && File::exists($filePath)) {
            self::sendDocument($filePath, "📦 Dokumen Arsip: {$filename}");
        }

        return $res;
    }

    /**
     * Template: Peringatan Kegagalan Pencadangan Database
     */
    public static function notifyBackupFailed(string $errorMessage, array $details = []): array
    {
        $appName = config('app.name', 'SIAKAD STAI Al-Ittihad');
        $time = now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') . ' WIB';
        $triggeredBy = $details['triggered_by'] ?? 'Cron Scheduler';

        $msg = "🏛️ <b>{$appName}</b>\n";
        $msg .= "🚨 <b>PERINGATAN: GAGAL CADANGKAN DATABASE</b>\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "❌ <b>Status:</b> CRITICAL FAILURE\n";
        $msg .= "⏱️ <b>Waktu:</b> {$time}\n";
        $msg .= "👤 <b>Inisiator:</b> {$triggeredBy}\n";
        $msg .= "⚠️ <b>Detail Kesalahan:</b>\n";
        $msg .= "<code>" . htmlspecialchars($errorMessage) . "</code>\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "<i>Harap Administrator / DevOps segera memeriksa kondisi disk dan storage server!</i>";

        return self::sendMessage($msg);
    }

    /**
     * Uji Koneksi Bot Telegram
     */
    public static function testConnection(): array
    {
        $appName = config('app.name', 'SIAKAD STAI Al-Ittihad');
        $time = now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') . ' WIB';
        $user = auth()->user();
        $userName = $user ? $user->name : 'Superadmin';

        $msg = "🏛️ <b>{$appName}</b>\n";
        $msg .= "🔔 <b>UJI KONEKSI TELEGRAM SENTINEL</b>\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "✅ Koneksi bot Telegram berhasil terhubung secara real-time!\n";
        $msg .= "⏱️ <b>Waktu Tes:</b> {$time}\n";
        $msg .= "👤 <b>Diuji oleh:</b> {$userName}\n";
        $msg .= "🛡️ <b>Status Sentinel:</b> AKTIF & SIAGA\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "<i>Notifikasi otomatis pencadangan basis data, integrasi cloud, dan peringatan integritas data akan dikirimkan ke channel/chat ini.</i>";

        return self::sendMessage($msg);
    }
}

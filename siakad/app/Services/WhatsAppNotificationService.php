<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WhatsAppNotificationService
{
    /**
     * Kirim Pesan WhatsApp Tunggal via Gateway Fonnte / Wablas
     */
    public static function sendMessage(string $targetPhone, string $message): array
    {
        $gatewayProvider = env('WA_GATEWAY_PROVIDER', 'fonnte'); // fonnte | wablas
        $apiKey = env('WA_GATEWAY_API_KEY', 'sandbox_fonnte_token_2026');
        $cleanPhone = preg_replace('/[^0-9]/', '', $targetPhone);

        // Standarisasi nomor ke format 62...
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62' . substr($cleanPhone, 1);
        }

        if (empty($cleanPhone) || empty($message)) {
            return [
                'success' => false,
                'message' => 'Nomor WhatsApp tujuan atau isi pesan tidak boleh kosong.',
            ];
        }

        // Mode Simulasi Sandbox jika API Key sandbox
        if (str_contains($apiKey, 'sandbox') || env('APP_ENV') === 'local') {
            Log::info("[WA NOTIFICATION SIMULATION] Sent to: {$cleanPhone} | Msg: {$message}");
            
            // Catat log pengiriman di DB
            try {
                DB::table('audit_logs')->insert([
                    'user_id' => auth()->id() ?? 1,
                    'action' => 'WA_NOTIFICATION_SENT',
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                    'details' => "WhatsApp terkirim ke {$cleanPhone}: " . mb_substr($message, 0, 80) . '...',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Ignore log error
            }

            return [
                'success' => true,
                'status' => 'SIMULATED_SUCCESS',
                'target' => $cleanPhone,
                'message' => 'Pesan WhatsApp berhasil disimulasikan dan dicatat ke log sistem.',
            ];
        }

        try {
            if ($gatewayProvider === 'wablas') {
                $response = Http::withHeaders([
                    'Authorization' => $apiKey,
                ])->post('https://api.wablas.com/api/send-message', [
                    'phone' => $cleanPhone,
                    'message' => $message,
                ]);
            } else {
                // Fonnte Gateway default
                $response = Http::withHeaders([
                    'Authorization' => $apiKey,
                ])->post('https://api.fonnte.com/send', [
                    'target' => $cleanPhone,
                    'message' => $message,
                    'countryCode' => '62',
                ]);
            }

            return [
                'success' => $response->successful(),
                'status' => $response->status(),
                'response' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error("[WA GATEWAY ERROR] {$e->getMessage()}");
            return [
                'success' => false,
                'message' => 'Gagal terhubung ke server WhatsApp Gateway: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Template: Pembukaan Sesi Presensi Kuliah Baru
     */
    public static function notifyAttendanceSessionOpened(string $phone, string $studentName, string $courseName, int $meetingNumber, string $passcode): array
    {
        $message = "🏛️ *STAI AL-ITTIHAD CIANJUR*\n";
        $message .= "Salam Sivitas Akademika,\n\n";
        $message .= "Halo *{$studentName}*,\n";
        $message .= "Sesi presensi perkuliahan telah dibuka oleh dosen pengampu:\n\n";
        $message .= "📚 Mata Kuliah: *{$courseName}*\n";
        $message .= "📌 Pertemuan ke: *{$meetingNumber}*\n";
        $message .= "🔑 Kode Darurat Presensi: *{$passcode}*\n\n";
        $message .= "Silakan masuk ke portal SALAM LMS untuk melakukan presensi mandiri (pindai QR atau input kode).\n";
        $message .= "🔗 _https://lms.staialittihad.ac.id_\n\n";
        $message .= "Terima kasih.";

        return self::sendMessage($phone, $message);
    }

    /**
     * Template: Pengingat Batas Waktu Pengumpulan Tugas (H-24 Jam)
     */
    public static function notifyAssignmentDeadline(string $phone, string $studentName, string $assignmentTitle, string $courseName, string $dueDate): array
    {
        $message = "⏰ *PENGINGAT PENGUMPULAN TUGAS — SALAM LMS*\n\n";
        $message .= "Halo *{$studentName}*,\n";
        $message .= "Tugas perkuliahan berikut akan mencapai batas tenggat waktu dalam waktu 24 jam:\n\n";
        $message .= "📝 Tugas: *{$assignmentTitle}*\n";
        $message .= "📚 Mata Kuliah: *{$courseName}*\n";
        $message .= "⏳ Batas Akhir: *{$dueDate}*\n\n";
        $message .= "Pastikan berkas tugas telah diunggah ke portal sebelum batas waktu berakhir untuk menghindari penalti keterlambatan.\n";
        $message .= "🔗 _https://lms.staialittihad.ac.id/tugas_\n";

        return self::sendMessage($phone, $message);
    }

    /**
     * Template: Pengumuman Nilai Ujian / KHS Rilis
     */
    public static function notifyGradesPublished(string $phone, string $studentName, string $courseName, string $gradeLetter, float $gradePoint): array
    {
        $message = "🎉 *PENGUMUMAN NILAI PERKULIAHAN — STAI AL-ITTIHAD*\n\n";
        $message .= "Halo *{$studentName}*,\n";
        $message .= "Nilai akhir semester untuk mata kuliah berikut telah disahkan oleh dosen pengampu dan BAAK:\n\n";
        $message .= "📚 Mata Kuliah: *{$courseName}*\n";
        $message .= "🎖️ Nilai Huruf: *{$gradeLetter}* (Bobot: *{$gradePoint}*)\n\n";
        $message .= "KHS Digital ber-QR Code resmi dapat diunduh langsung melalui portal SIAKAD.\n";
        $message .= "🔗 _https://siakad.staialittihad.ac.id/student/khs_\n";

        return self::sendMessage($phone, $message);
    }
}

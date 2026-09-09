<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WhatsAppNotificationService
{
    /**
     * Mengambil nilai konfigurasi dari system_settings dengan fallback ke env
     */
    public static function getSetting(string $key, $default = null)
    {
        try {
            $setting = DB::table('system_settings')->where('key', $key)->first();
            if ($setting && $setting->value !== null && $setting->value !== '') {
                return $setting->value;
            }
        } catch (\Throwable $e) {
            // Abaikan jika tabel belum siap
        }

        return env(strtoupper($key), $default);
    }

    /**
     * Kirim Pesan WhatsApp (Mendukung Nomor Personal & ID Grup WhatsApp)
     */
    public static function sendMessage(string $target, string $message): array
    {
        $gatewayProvider = self::getSetting('wa_gateway_provider', 'fonnte'); // fonnte | wablas
        $apiKey = self::getSetting('wa_gateway_api_key', 'sandbox_fonnte_token_2026');
        $target = trim($target);

        if (empty($target) || empty($message)) {
            return [
                'success' => false,
                'message' => 'Tujuan WhatsApp (nomor/grup) atau isi pesan tidak boleh kosong.',
            ];
        }

        // Deteksi apakah target merupakan ID Grup WhatsApp (misal: 120363028891000000@g.us)
        $isGroup = str_contains($target, '@g.us') || str_contains($target, '-');
        $cleanTarget = $target;

        if (!$isGroup) {
            $cleanTarget = preg_replace('/[^0-9]/', '', $target);
            // Standarisasi nomor ke format 62...
            if (str_starts_with($cleanTarget, '0')) {
                $cleanTarget = '62' . substr($cleanTarget, 1);
            }
        }

        // Mode Simulasi Sandbox jika API Key sandbox atau env lokal
        if (str_contains($apiKey, 'sandbox') || env('APP_ENV') === 'local' || empty($apiKey)) {
            $targetLabel = $isGroup ? "Grup WhatsApp ({$cleanTarget})" : "Personal ({$cleanTarget})";
            Log::info("[WA NOTIFICATION SIMULATION] Sent to: {$targetLabel} | Msg: " . mb_substr($message, 0, 100) . '...');

            try {
                DB::table('audit_logs')->insert([
                    'user_id' => auth()->id() ?? 1,
                    'action' => 'WA_NOTIFICATION_SIMULATED',
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                    'target_entity' => 'WhatsAppGateway',
                    'target_id' => $cleanTarget,
                    'details' => json_encode([
                        'target' => $cleanTarget,
                        'is_group' => $isGroup,
                        'provider' => $gatewayProvider,
                        'preview' => mb_substr($message, 0, 150) . '...',
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {
                // Ignore log error
            }

            return [
                'success' => true,
                'simulated' => true,
                'status' => 'SIMULATED_SUCCESS',
                'target' => $cleanTarget,
                'is_group' => $isGroup,
                'message' => "Pesan WhatsApp ke {$targetLabel} berhasil disimulasikan dan dicatat ke log sistem.",
            ];
        }

        try {
            if ($gatewayProvider === 'wablas') {
                $url = $isGroup ? 'https://api.wablas.com/api/send-group-message' : 'https://api.wablas.com/api/send-message';
                $payload = $isGroup 
                    ? ['group_id' => $cleanTarget, 'message' => $message]
                    : ['phone' => $cleanTarget, 'message' => $message];

                $response = Http::withHeaders([
                    'Authorization' => $apiKey,
                ])->post($url, $payload);
            } else {
                // Fonnte Gateway Default
                $response = Http::withHeaders([
                    'Authorization' => $apiKey,
                ])->post('https://api.fonnte.com/send', [
                    'target' => $cleanTarget,
                    'message' => $message,
                    'countryCode' => '62',
                ]);
            }

            $resData = $response->json();

            // Catat log pengiriman di DB
            try {
                DB::table('audit_logs')->insert([
                    'user_id' => auth()->id() ?? 1,
                    'action' => 'WA_NOTIFICATION_SENT',
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                    'target_entity' => 'WhatsAppGateway',
                    'target_id' => $cleanTarget,
                    'details' => json_encode([
                        'target' => $cleanTarget,
                        'is_group' => $isGroup,
                        'status_code' => $response->status(),
                        'provider' => $gatewayProvider,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (\Throwable $e) {}

            return [
                'success' => $response->successful(),
                'simulated' => false,
                'status' => $response->status(),
                'response' => $resData,
                'target' => $cleanTarget,
            ];
        } catch (\Throwable $e) {
            Log::error("[WA GATEWAY ERROR] Gagal mengirim pesan ke {$cleanTarget}: " . $e->getMessage());
            return [
                'success' => false,
                'simulated' => false,
                'message' => 'Gagal terhubung ke server WhatsApp Gateway: ' . $e->getMessage(),
                'target' => $cleanTarget,
            ];
        }
    }

    /**
     * Template: Tanda Terima Pembayaran Digital untuk Mahasiswa / Calon Mahasiswa (E-Receipt)
     */
    public static function notifyStudentPaymentReceipt(array $d): array
    {
        $phone = $d['phone'] ?? null;
        if (empty($phone)) {
            return [
                'success' => false,
                'message' => 'Nomor WhatsApp mahasiswa tidak terdaftar.',
            ];
        }

        $appName = config('app.name', 'STAI AL-ITTIHAD CIANJUR');
        $customerName = $d['customer_name'] ?? 'Mahasiswa';
        $customerNo = $d['customer_no'] ?? '-';
        $prodiName = $d['prodi_name'] ?? 'STAI Al-Ittihad';
        $feeName = $d['fee_name'] ?? 'Tagihan Akademik';
        $invoiceNo = $d['invoice_number'] ?? 'INV-' . date('Ymd');
        $amount = number_format((float) ($d['amount'] ?? 0), 0, ',', '.');
        $channel = $d['channel'] ?? 'Virtual Account BSI';
        $vaNumber = $d['va_number'] ?? '-';
        $refNo = $d['reference_no'] ?? 'REF-' . time();
        $time = now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i') . ' WIB';

        $msg = "🏛️ *{$appName}*\n";
        $msg .= "🧾 *BUKTI PEMBAYARAN ELEKTRONIK (E-RECEIPT)*\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "Alhamdulillah, pembayaran tagihan Anda telah *LUNAS & TERVERIFIKASI* oleh sistem keuangan kampus.\n\n";
        $msg .= "👤 *Nama:* {$customerName}\n";
        $msg .= "🎓 *NIM / No. Reg:* {$customerNo}\n";
        $msg .= "📚 *Program Studi:* {$prodiName}\n";
        $msg .= "💳 *Jenis Pembayaran:* {$feeName}\n";
        $msg .= "📋 *No. Invoice:* `{$invoiceNo}`\n";
        $msg .= "💰 *Nominal Dibayar:* *Rp {$amount}*\n";
        $msg .= "🏦 *Kanal Pembayaran:* {$channel}\n";
        $msg .= "🔢 *No. Virtual Account:* `{$vaNumber}`\n";
        $msg .= "🔖 *No. Referensi Bank:* `{$refNo}`\n";
        $msg .= "⏱️ *Waktu Pelunasan:* {$time}\n";
        $msg .= "✅ *Status:* *LUNAS (TERVERIFIKASI SISTEM)*\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "Hak akses akademik Anda (KRS Online, Kartu Ujian, dan LMS) telah aktif otomatis.\n\n";
        $msg .= "_Simpan pesan resmi ini sebagai bukti pembayaran yang sah._\n";
        $msg .= "🔗 Portal SIAKAD: _https://salam.stai-alittihad.ac.id_";

        return self::sendMessage($phone, $msg);
    }

    /**
     * Template: Laporan Transaksi Masuk untuk Grup Manajemen (Admin, Keuangan & Pimpinan)
     */
    public static function notifyManagementPaymentAlert(array $d, string $targetRecipient, string $targetRoleLabel = 'Grup Keuangan & Pimpinan'): array
    {
        $appName = config('app.name', 'STAI AL-ITTIHAD CIANJUR');
        $customerName = $d['customer_name'] ?? 'Mahasiswa';
        $customerNo = $d['customer_no'] ?? '-';
        $prodiName = $d['prodi_name'] ?? 'STAI Al-Ittihad';
        $feeName = $d['fee_name'] ?? 'Tagihan Akademik';
        $invoiceNo = $d['invoice_number'] ?? 'INV-' . date('Ymd');
        $amount = number_format((float) ($d['amount'] ?? 0), 0, ',', '.');
        $channel = $d['channel'] ?? 'Host-to-Host BSI Virtual Account';
        $vaNumber = $d['va_number'] ?? '-';
        $refNo = $d['reference_no'] ?? 'BSI-REF-' . time();
        $time = now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i:s') . ' WIB';

        $msg = "🏛️ *{$appName}*\n";
        $msg .= "💰 *NOTIFIKASI TRANSAKSI MASUK — KEUANGAN*\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "Telah diterima dana pelunasan baru melalui sistem perbankan:\n\n";
        $msg .= "💵 *Nominal:* *Rp {$amount}*\n";
        $msg .= "💳 *Jenis Tagihan:* {$feeName}\n";
        $msg .= "📋 *No. Invoice:* `{$invoiceNo}`\n";
        $msg .= "👤 *Pembayar:* {$customerName} ({$customerNo})\n";
        $msg .= "🎓 *Prodi:* {$prodiName}\n";
        $msg .= "🏦 *Kanal Pembayaran:* {$channel}\n";
        $msg .= "🔢 *No. VA:* `{$vaNumber}`\n";
        $msg .= "🔖 *Ref Bank:* `{$refNo}`\n";
        $msg .= "⏱️ *Waktu Masuk:* {$time}\n";
        $msg .= "📊 *Rekening Penampung:* BSI No. 7188919928 (STAI Al-Ittihad SPP)\n";
        $msg .= "━━━━━━━━━━━━━━━━━━━━━━\n";
        $msg .= "📌 *Status Sistem:* Tagihan disahkan LUNAS dan Financial Lock Guard telah dibuka otomatis.\n";
        $msg .= "👥 *Tujuan Notifikasi:* {$targetRoleLabel}";

        return self::sendMessage($targetRecipient, $msg);
    }

    /**
     * Dispatcher Utama: Mengirimkan Notifikasi ke Mahasiswa dan Seluruh Pihak Manajemen (Admin, Keuangan, Pimpinan)
     */
    public static function dispatchPaymentNotifications(
        $invoiceId,
        ?string $vaNumber = null,
        ?float $amount = null,
        ?string $referenceNo = null,
        string $channel = 'VA_BSI'
    ): array {
        // Ambil Data Tagihan
        $invoice = DB::table('student_invoices')->find($invoiceId);
        if (!$invoice) {
            return [
                'success' => false,
                'message' => "Invoice ID {$invoiceId} tidak ditemukan.",
            ];
        }

        $feeType = DB::table('fee_types')->find($invoice->fee_type_id);
        $feeName = $feeType ? $feeType->name : 'Biaya Perkuliahan / SPP';

        $customerName = 'Mahasiswa STAI';
        $customerNo = '-';
        $customerPhone = null;
        $prodiName = 'STAI Al-Ittihad Cianjur';

        // 1. Identifikasi Pembayar (Mahasiswa Aktif atau Pendaftar PMB)
        if ($invoice->user_id) {
            $user = DB::table('users')->find($invoice->user_id);
            if ($user) {
                $customerName = $user->name;
                $customerNo = $user->identity_number ?: $user->username;
                $customerPhone = $user->phone_number;
                $prodiName = $user->study_program ?: $prodiName;
            }
        } elseif ($invoice->pmb_applicant_id) {
            $applicant = DB::table('pmb_applicants')->find($invoice->pmb_applicant_id);
            if ($applicant) {
                $customerName = $applicant->full_name;
                $customerNo = $applicant->registration_number;
                $customerPhone = $applicant->phone_number;
                
                // Cari nama prodi pilihan
                $prodi = DB::table('study_programs')->find($applicant->first_choice_program_id);
                if ($prodi) {
                    $prodiName = $prodi->name;
                }
            }
        }

        // Cari nomor VA jika tidak dipassing
        if (empty($vaNumber)) {
            $vaTx = DB::table('va_bsi_transactions')
                ->where('student_invoice_id', $invoice->id)
                ->first();
            $vaNumber = $vaTx ? $vaTx->va_number : '9928' . ($customerNo !== '-' ? $customerNo : rand(1000, 9999));
        }

        $finalAmount = $amount ?? (float) $invoice->final_amount;
        $finalRef = $referenceNo ?? 'BSI-' . date('YmdHis') . '-' . rand(1000, 9999);

        $details = [
            'invoice_number' => $invoice->invoice_number,
            'customer_name' => $customerName,
            'customer_no' => $customerNo,
            'phone' => $customerPhone,
            'prodi_name' => $prodiName,
            'fee_name' => $feeName,
            'amount' => $finalAmount,
            'channel' => $channel,
            'va_number' => $vaNumber,
            'reference_no' => $finalRef,
        ];

        $results = [
            'student' => null,
            'management' => [],
        ];

        // 2. KIRIM KE MAHASISWA / CALON MAHASISWA
        $notifyStudent = filter_var(self::getSetting('wa_notify_student_on_payment', true), FILTER_VALIDATE_BOOLEAN);
        if ($notifyStudent && !empty($customerPhone)) {
            $results['student'] = self::notifyStudentPaymentReceipt($details);
        } else {
            $results['student'] = [
                'success' => false,
                'message' => empty($customerPhone) ? 'Nomor WA mahasiswa tidak tersedia.' : 'Notifikasi ke mahasiswa dinonaktifkan.',
            ];
        }

        // 3. KIRIM KE GRUP & PETUGAS MANAJEMEN (ADMIN, KEUANGAN, PIMPINAN)
        $notifyManagement = filter_var(self::getSetting('wa_notify_management_on_payment', true), FILTER_VALIDATE_BOOLEAN);

        if ($notifyManagement) {
            $recipients = [];

            // 3a. Grup WhatsApp Manajemen / Keuangan
            $groupId = self::getSetting('wa_management_group_id');
            if (!empty($groupId)) {
                $recipients[$groupId] = 'Grup WhatsApp Keuangan, Admin & Pimpinan';
            }

            // 3b. Nomor WhatsApp Petugas Keuangan
            $financePhone = self::getSetting('wa_finance_phone');
            if (empty($financePhone)) {
                $financeUser = DB::table('users')->where('role', 'keuangan')->whereNotNull('phone_number')->first();
                $financePhone = $financeUser?->phone_number;
            }
            if (!empty($financePhone)) {
                $recipients[$financePhone] = 'Bendahara / Bagian Keuangan';
            }

            // 3c. Nomor WhatsApp Administrator / Superadmin
            $adminPhone = self::getSetting('wa_admin_phone');
            if (empty($adminPhone)) {
                $adminUser = DB::table('users')->where('role', 'superadmin')->whereNotNull('phone_number')->first();
                $adminPhone = $adminUser?->phone_number;
            }
            if (!empty($adminPhone)) {
                $recipients[$adminPhone] = 'Administrator Sistem / BAAK';
            }

            // 3d. Nomor WhatsApp Pimpinan Kampus (Ketua STAI / Warek)
            $leadershipPhone = self::getSetting('wa_leadership_phone');
            if (empty($leadershipPhone)) {
                $leadUser = DB::table('users')->where('role', 'pimpinan')->whereNotNull('phone_number')->first();
                $leadershipPhone = $leadUser?->phone_number;
            }
            if (!empty($leadershipPhone)) {
                $recipients[$leadershipPhone] = 'Pimpinan Institusi (Ketua STAI)';
            }

            // Fallback jika belum ada yang diset sama sekali: masukkan default admin/finance
            if (empty($recipients)) {
                $recipients['081234567890'] = 'Grup Default Keuangan & Pimpinan (Simulasi)';
            }

            foreach ($recipients as $target => $label) {
                $res = self::notifyManagementPaymentAlert($details, $target, $label);
                $results['management'][] = [
                    'target' => $target,
                    'label' => $label,
                    'result' => $res,
                ];
            }
        }

        return [
            'success' => true,
            'details' => $details,
            'results' => $results,
        ];
    }

    /**
     * Uji Notifikasi Pembayaran WhatsApp (Simulasi / Real)
     */
    public static function testPaymentNotification(?string $customPhone = null): array
    {
        $testTarget = $customPhone ?: self::getSetting('wa_admin_phone', '081234567890');

        $sampleDetails = [
            'invoice_number' => 'INV-' . date('Ym') . '-TEST' . rand(100, 999),
            'customer_name' => 'Ahmad Fauzi Rahman',
            'customer_no' => '21010042',
            'phone' => $testTarget,
            'prodi_name' => 'Pendidikan Agama Islam (S1)',
            'fee_name' => 'SPP Semester Ganjil 2026/2027',
            'amount' => 2500000.00,
            'channel' => 'Virtual Account Bank Syariah Indonesia (BSI)',
            'va_number' => '99280121010042',
            'reference_no' => 'BSI-TEST-' . date('YmdHis'),
        ];

        // 1. Kirim Contoh E-Receipt Mahasiswa
        $studentRes = self::notifyStudentPaymentReceipt($sampleDetails);

        // 2. Kirim Contoh Notifikasi Manajemen
        $managementRes = self::notifyManagementPaymentAlert(
            $sampleDetails, 
            $testTarget, 
            'Grup Keuangan, Admin & Pimpinan (Tes)'
        );

        return [
            'success' => true,
            'test_target' => $testTarget,
            'student_receipt' => $studentRes,
            'management_alert' => $managementRes,
        ];
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
        $message .= "🔗 _https://lms.stai-alittihad.ac.id_\n\n";
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
        $message .= "🔗 _https://lms.stai-alittihad.ac.id/tugas_\n";

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
        $message .= "🔗 _https://salam.stai-alittihad.ac.id/student/khs_\n";

        return self::sendMessage($phone, $message);
    }
}

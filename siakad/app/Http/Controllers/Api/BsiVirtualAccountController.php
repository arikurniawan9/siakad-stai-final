<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BsiVirtualAccountController extends Controller
{
    /**
     * INQUIRY API: Bank BSI menanyakan detail tagihan berdasarkan Nomor VA
     * Endpoint: POST /api/v1/bsi/va/inquiry
     */
    public function inquiry(Request $request): JsonResponse
    {
        $vaNumber = $request->input('va_number') 
            ?? $request->input('vaNumber') 
            ?? $request->input('virtualAccountNo');

        if (!$vaNumber) {
            return response()->json([
                'responseCode' => '4002400',
                'responseMessage' => 'Nomor Virtual Account wajib dikirimkan.',
                'response_code' => '400',
                'response_message' => 'Nomor Virtual Account wajib dikirimkan.',
            ], 400);
        }

        $vaTx = DB::table('va_bsi_transactions')
            ->where('va_number', $vaNumber)
            ->first();

        if (!$vaTx) {
            return response()->json([
                'responseCode' => '4042412',
                'responseMessage' => 'Nomor Virtual Account tidak ditemukan.',
                'response_code' => '404',
                'response_message' => 'Nomor Virtual Account tidak ditemukan.',
            ], 404);
        }

        $invoice = DB::table('student_invoices')->find($vaTx->student_invoice_id);
        $feeType = DB::table('fee_types')->find($invoice->fee_type_id);
        
        $customerName = 'Mahasiswa STAI Al-Ittihad';
        $customerNo = '-';
        if ($invoice->user_id) {
            $user = DB::table('users')->find($invoice->user_id);
            $customerName = $user ? $user->name : $customerName;
            $customerNo = $user ? $user->identity_number : $customerNo;
        } elseif ($invoice->pmb_applicant_id) {
            $applicant = DB::table('pmb_applicants')->find($invoice->pmb_applicant_id);
            $customerName = $applicant ? $applicant->full_name : $customerName;
            $customerNo = $applicant ? $applicant->registration_number : $customerNo;
        }

        $formattedAmount = number_format((float) $invoice->final_amount, 2, '.', '');

        return response()->json([
            'responseCode' => '2002400',
            'responseMessage' => 'Successful',
            'response_code' => '0000',
            'response_message' => 'Inquiry VA Berhasil',
            'virtualAccountData' => [
                'partnerServiceId' => substr($vaNumber, 0, 4),
                'customerNo' => $customerNo,
                'virtualAccountNo' => $vaTx->va_number,
                'virtualAccountName' => $customerName,
                'virtualAccountEmail' => 'keuangan@staialittihad.ac.id',
                'inquiryRequestId' => 'INQ-BSI-' . date('YmdHis') . '-' . rand(1000, 9999),
                'totalAmount' => [
                    'value' => $formattedAmount,
                    'currency' => 'IDR',
                ],
                'billDetails' => [
                    [
                        'billCode' => $feeType ? $feeType->va_bill_code : '02',
                        'billName' => $feeType ? $feeType->name : 'Tagihan Akademik',
                        'billAmount' => [
                            'value' => $formattedAmount,
                            'currency' => 'IDR',
                        ],
                    ]
                ],
                'billDescription' => $invoice->notes ?? ($feeType ? $feeType->name : 'Tagihan Mahasiswa'),
                'inquiryStatus' => $invoice->status === 'LUNAS' ? 'PAID' : 'UNPAID',
                'expiredDate' => $invoice->due_date,
            ],
            'data' => [
                'va_number' => $vaTx->va_number,
                'customer_name' => $customerName,
                'customer_no' => $customerNo,
                'amount' => (float) $invoice->final_amount,
                'bill_description' => $invoice->notes,
                'status' => $invoice->status,
                'due_date' => $invoice->due_date,
            ],
        ]);
    }

    /**
     * PAYMENT CALLBACK WEBHOOK: Bank BSI mengirimkan konfirmasi pelunasan Host-to-Host
     * Endpoint: POST /api/v1/bsi/va/payment
     */
    public function paymentCallback(Request $request): JsonResponse
    {
        $payload = $request->all();
        $vaNumber = $request->input('va_number') 
            ?? $request->input('vaNumber') 
            ?? $request->input('virtualAccountNo');
            
        $amount = (float) ($request->input('amount') 
            ?? $request->input('paidAmount.value') 
            ?? $request->input('paidAmount') 
            ?? 0);

        $bsiRefNo = $request->input('bsi_reference_no') 
            ?? $request->input('bankReference') 
            ?? $request->input('paymentRequestId') 
            ?? 'BSI-' . date('YmdHis') . '-' . rand(1000, 9999);
            
        $channel = $request->input('channel') 
            ?? $request->input('sourceChannel') 
            ?? 'BSI_MOBILE';

        $signature = $request->header('X-BSI-Signature');

        // Validasi Tanda Tangan Kriptografis (HMAC SHA-256) jika kunci dikonfigurasi
        $secretKey = env('BSI_SECRET_KEY');
        if ($secretKey && app()->environment('production')) {
            $rawContent = $request->getContent();
            $expectedSignature = hash_hmac('sha256', $rawContent, $secretKey);
            if (!$signature || !hash_equals($expectedSignature, $signature)) {
                Log::warning('BSI VA Payment Callback Invalid Signature', [
                    'ip' => $request->ip(),
                    'received_signature' => $signature,
                ]);
                return response()->json([
                    'responseCode' => '4012500',
                    'responseMessage' => 'Invalid Security Signature',
                    'response_code' => '401',
                    'response_message' => 'Tanda tangan digital pembayaran tidak valid.',
                ], 401);
            }
        }

        Log::info('BSI VA Payment Callback Received', ['payload' => $payload]);

        $vaTx = DB::table('va_bsi_transactions')
            ->where('va_number', $vaNumber)
            ->first();

        if (!$vaTx) {
            return response()->json([
                'responseCode' => '4042512',
                'responseMessage' => 'Transaksi VA tidak ditemukan.',
                'response_code' => '404',
                'response_message' => 'Transaksi VA tidak ditemukan.',
            ], 404);
        }

        $invoice = DB::table('student_invoices')->find($vaTx->student_invoice_id);

        // Validasi nominal pembayaran tidak kurang dari nominal tagihan
        if ($amount > 0 && $amount < (float) $invoice->final_amount) {
            return response()->json([
                'responseCode' => '4002500',
                'responseMessage' => 'Underpaid Amount',
                'response_code' => '400',
                'response_message' => 'Nominal pembayaran tidak sesuai dengan total tagihan.',
            ], 400);
        }

        if ($invoice->status === 'LUNAS') {
            return response()->json([
                'responseCode' => '2002500',
                'responseMessage' => 'Successful (Already Paid)',
                'response_code' => '0000',
                'response_message' => 'Tagihan sudah berstatus lunas sebelumnya.',
                'data' => [
                    'invoice_number' => $invoice->invoice_number,
                    'paid_at' => $invoice->paid_at,
                ],
            ]);
        }

        // Eksekusi Pelunasan Otomatis dalam Database Transaction
        DB::transaction(function () use ($vaTx, $invoice, $bsiRefNo, $payload) {
            $now = now();

            // 1. Update VA Transaction
            DB::table('va_bsi_transactions')
                ->where('id', $vaTx->id)
                ->update([
                    'status' => 'PAID',
                    'bsi_reference_no' => $bsiRefNo,
                    'payment_datetime' => $now,
                    'raw_callback_payload' => json_encode($payload),
                    'updated_at' => $now,
                ]);

            // 2. Update Student Invoice -> LUNAS
            DB::table('student_invoices')
                ->where('id', $invoice->id)
                ->update([
                    'status' => 'LUNAS',
                    'paid_at' => $now,
                    'payment_method' => 'VA_BSI',
                    'updated_at' => $now,
                ]);

            // 3. Jika Tagihan PMB -> Otomatis Update Status PMB Applicant
            if ($invoice->pmb_applicant_id) {
                DB::table('pmb_applicants')
                    ->where('id', $invoice->pmb_applicant_id)
                    ->update([
                        'status' => 'TERVERIFIKASI_BAYAR',
                        'updated_at' => $now,
                    ]);
            }

            // 4. Catat Audit Log Pelunasan Keuangan
            DB::table('audit_logs')->insert([
                'user_id' => $invoice->user_id,
                'action' => 'VA_BSI_SETTLEMENT',
                'ip_address' => request()->ip(),
                'target_entity' => 'StudentInvoice',
                'target_id' => (string) $invoice->id,
                'details' => json_encode([
                    'va_number' => $vaTx->va_number,
                    'amount' => $invoice->final_amount,
                    'bsi_ref' => $bsiRefNo,
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        });

        // 5. Trigger Notifikasi WhatsApp Otomatis (E-Receipt Mahasiswa & Alert Grup Manajemen/Keuangan/Pimpinan)
        try {
            \App\Services\WhatsAppNotificationService::dispatchPaymentNotifications(
                $invoice->id,
                $vaNumber,
                (float) $amount,
                $bsiRefNo,
                $payload['channel'] ?? 'VA_BSI'
            );
        } catch (\Throwable $e) {
            Log::error('[WA NOTIFICATION DISPATCH ERROR] Gagal mengirim WhatsApp payment alert: ' . $e->getMessage());
        }

        return response()->json([
            'responseCode' => '2002500',
            'responseMessage' => 'Successful',
            'response_code' => '0000',
            'response_message' => 'Pelunasan Virtual Account BSI Berhasil Diverifikasi.',
            'data' => [
                'va_number' => $vaNumber,
                'invoice_number' => $invoice->invoice_number,
                'amount_paid' => $amount,
                'bsi_reference_no' => $bsiRefNo,
                'settlement_time' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * SIMULATOR SANDBOX BSI VA: Simulasi Pelunasan 1-Klik untuk Developer & UAT
     */
    public function simulatePayment(Request $request): JsonResponse
    {
        // Proteksi Lingkungan Produksi: Hanya Superadmin/Keuangan atau Token Khusus
        if (app()->environment('production')) {
            $user = auth()->user();
            $simToken = $request->header('X-Simulator-Token') ?? $request->input('simulator_token');
            $expectedToken = env('BSI_SIMULATOR_TOKEN', env('BSI_SECRET_KEY'));

            $isAuthorizedAdmin = $user && in_array($user->role, ['superadmin', 'keuangan']);
            $isValidToken = $expectedToken && $simToken === $expectedToken;

            if (!$isAuthorizedAdmin && !$isValidToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak: Endpoint simulator pembayaran hanya dapat digunakan oleh Superadmin/Keuangan atau dengan simulator token yang valid.',
                ], 403);
            }
        }

        $vaNumber = $request->input('va_number');

        $vaTx = DB::table('va_bsi_transactions')
            ->where('va_number', $vaNumber)
            ->first();

        if (!$vaTx) {
            return response()->json(['success' => false, 'message' => 'Nomor VA tidak ditemukan.'], 404);
        }

        // Trigger payment callback internal
        $request->merge([
            'amount' => $vaTx->amount,
            'bsi_reference_no' => 'SIM-BSI-' . date('YmdHis') . '-' . rand(100, 999),
            'channel' => 'BSI_MOBILE_SANDBOX',
        ]);

        $result = $this->paymentCallback($request);
        return response()->json([
            'success' => true,
            'message' => 'Simulasi pelunasan Host-to-Host BSI Virtual Account berhasil!',
            'data' => $result->getData(),
        ]);
    }
}

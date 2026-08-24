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
        $vaNumber = $request->input('va_number');

        if (!$vaNumber) {
            return response()->json([
                'response_code' => '400',
                'response_message' => 'Nomor Virtual Account wajib dikirimkan.',
            ], 400);
        }

        $vaTx = DB::table('va_bsi_transactions')
            ->where('va_number', $vaNumber)
            ->first();

        if (!$vaTx) {
            return response()->json([
                'response_code' => '404',
                'response_message' => 'Nomor Virtual Account tidak ditemukan.',
            ], 404);
        }

        $invoice = DB::table('student_invoices')->find($vaTx->student_invoice_id);
        
        $customerName = 'Mahasiswa STAI Al-Ittihad';
        if ($invoice->user_id) {
            $user = DB::table('users')->find($invoice->user_id);
            $customerName = $user ? $user->name : $customerName;
        } elseif ($invoice->pmb_applicant_id) {
            $applicant = DB::table('pmb_applicants')->find($invoice->pmb_applicant_id);
            $customerName = $applicant ? $applicant->full_name : $customerName;
        }

        return response()->json([
            'response_code' => '0000',
            'response_message' => 'Inquiry VA Berhasil',
            'data' => [
                'va_number' => $vaTx->va_number,
                'customer_name' => $customerName,
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
        $vaNumber = $request->input('va_number');
        $amount = (float) $request->input('amount');
        $bsiRefNo = $request->input('bsi_reference_no') ?? 'BSI-' . date('YmdHis') . '-' . rand(1000, 9999);
        $signature = $request->header('X-BSI-Signature');

        Log::info('BSI VA Payment Callback Received', ['payload' => $payload]);

        $vaTx = DB::table('va_bsi_transactions')
            ->where('va_number', $vaNumber)
            ->first();

        if (!$vaTx) {
            return response()->json([
                'response_code' => '404',
                'response_message' => 'Transaksi VA tidak ditemukan.',
            ], 404);
        }

        $invoice = DB::table('student_invoices')->find($vaTx->student_invoice_id);

        if ($invoice->status === 'LUNAS') {
            return response()->json([
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

        return response()->json([
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

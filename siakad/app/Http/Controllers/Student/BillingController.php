<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Tampilkan Halaman Tagihan Keuangan & VA BSI Mahasiswa
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Bersihkan NIM untuk pembentukan nomor VA BSI UKT (Prefix institusi: 9928)
        $cleanNim = preg_replace('/[^0-9]/', '', $user->identity_number ?: (string) $user->id);
        $institutionPrefix = config('services.bsi.institution_code', '9928');
        $defaultVaNumber = $institutionPrefix . '02' . str_pad($cleanNim, 8, '0', STR_PAD_LEFT);

        // Ambil data tagihan invoice mahasiswa dari database
        $invoices = DB::table('student_invoices')
            ->join('fee_types', 'student_invoices.fee_type_id', '=', 'fee_types.id')
            ->leftJoin('academic_periods', 'student_invoices.academic_period_id', '=', 'academic_periods.id')
            ->leftJoin('va_bsi_transactions', 'student_invoices.id', '=', 'va_bsi_transactions.student_invoice_id')
            ->where('student_invoices.user_id', $user->id)
            ->select(
                'student_invoices.*',
                'fee_types.name as fee_name',
                'fee_types.code as fee_code',
                'fee_types.va_bill_code',
                'academic_periods.name as period_name',
                'va_bsi_transactions.va_number as invoice_va_number',
                'va_bsi_transactions.status as va_status',
                'va_bsi_transactions.bsi_reference_no',
                'va_bsi_transactions.payment_datetime',
                'va_bsi_transactions.channel as va_channel'
            )
            ->orderBy('student_invoices.id', 'desc')
            ->get();

        // Jika belum ada tagihan terdaftar di DB (misal akun baru), buatkan invoice otomatis
        if ($invoices->isEmpty()) {
            $activePeriod = DB::table('academic_periods')->where('is_active', true)->first()
                ?? DB::table('academic_periods')->orderBy('id', 'desc')->first();

            $feeType = DB::table('fee_types')->where('code', 'SPP_UKT')->first()
                ?? DB::table('fee_types')->where('code', 'SPP')->first()
                ?? DB::table('fee_types')->first();

            if ($feeType) {
                $amount = (float) $feeType->default_amount;
                if ($amount <= 0) {
                    $amount = 2000000;
                }

                $invoiceNumber = 'INV-' . date('Ym') . '-' . str_pad($user->id, 4, '0', STR_PAD_LEFT) . '-' . rand(100, 999);
                $billCode = $feeType->va_bill_code ?: '02';
                $vaForInvoice = $institutionPrefix . $billCode . str_pad($cleanNim, 8, '0', STR_PAD_LEFT);
                $now = now();

                DB::transaction(function () use ($invoiceNumber, $user, $feeType, $activePeriod, $amount, $vaForInvoice, $now) {
                    $invoiceId = DB::table('student_invoices')->insertGetId([
                        'invoice_number' => $invoiceNumber,
                        'user_id' => $user->id,
                        'pmb_applicant_id' => null,
                        'fee_type_id' => $feeType->id,
                        'academic_period_id' => $activePeriod?->id,
                        'amount' => $amount,
                        'discount_amount' => 0,
                        'penalty_amount' => 0,
                        'final_amount' => $amount,
                        'due_date' => now()->addDays(30),
                        'status' => 'BELUM_BAYAR',
                        'paid_at' => null,
                        'payment_method' => null,
                        'notes' => "Tagihan {$feeType->name} Semester " . ($activePeriod?->name ?? 'Berjalan'),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    DB::table('va_bsi_transactions')->insert([
                        'student_invoice_id' => $invoiceId,
                        'va_number' => $vaForInvoice,
                        'channel' => 'BSI_MOBILE',
                        'amount' => $amount,
                        'status' => 'PENDING',
                        'bsi_reference_no' => null,
                        'payment_datetime' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                });

                // Muat ulang invoice setelah dibuat
                $invoices = DB::table('student_invoices')
                    ->join('fee_types', 'student_invoices.fee_type_id', '=', 'fee_types.id')
                    ->leftJoin('academic_periods', 'student_invoices.academic_period_id', '=', 'academic_periods.id')
                    ->leftJoin('va_bsi_transactions', 'student_invoices.id', '=', 'va_bsi_transactions.student_invoice_id')
                    ->where('student_invoices.user_id', $user->id)
                    ->select(
                        'student_invoices.*',
                        'fee_types.name as fee_name',
                        'fee_types.code as fee_code',
                        'fee_types.va_bill_code',
                        'academic_periods.name as period_name',
                        'va_bsi_transactions.va_number as invoice_va_number',
                        'va_bsi_transactions.status as va_status',
                        'va_bsi_transactions.bsi_reference_no',
                        'va_bsi_transactions.payment_datetime',
                        'va_bsi_transactions.channel as va_channel'
                    )
                    ->orderBy('student_invoices.id', 'desc')
                    ->get();
            }
        }

        // Format data invoices agar kompatibel penuh dengan view frontend
        $formattedInvoices = $invoices->map(function ($inv) use ($defaultVaNumber) {
            $statusUpper = strtoupper((string) $inv->status);
            $isPaid = in_array($statusUpper, ['LUNAS', 'PAID', 'SUCCESS']);
            $finalAmount = (float) ($inv->final_amount ?? $inv->amount);

            return [
                'id' => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'fee_name' => $inv->fee_name,
                'fee_code' => $inv->fee_code,
                'period_name' => $inv->period_name ?: 'Semester Berjalan',
                'amount' => (float) $inv->amount,
                'discount_amount' => (float) ($inv->discount_amount ?? 0),
                'penalty_amount' => (float) ($inv->penalty_amount ?? 0),
                'final_amount' => $finalAmount,
                'paid_amount' => $isPaid ? $finalAmount : 0.0,
                'due_date' => $inv->due_date,
                'status' => $inv->status,
                'is_paid' => $isPaid,
                'paid_at' => $inv->paid_at,
                'payment_method' => $inv->payment_method ?: ($isPaid ? 'VA_BSI' : null),
                'va_number' => $inv->invoice_va_number ?: $defaultVaNumber,
                'bsi_reference_no' => $inv->bsi_reference_no,
                'payment_datetime' => $inv->payment_datetime,
                'channel' => $inv->va_channel ?: 'BSI_MOBILE',
                'notes' => $inv->notes,
            ];
        });

        // Ambil riwayat transaksi VA BSI
        $invoiceIds = $invoices->pluck('id')->toArray();
        $transactions = DB::table('va_bsi_transactions')
            ->join('student_invoices', 'va_bsi_transactions.student_invoice_id', '=', 'student_invoices.id')
            ->join('fee_types', 'student_invoices.fee_type_id', '=', 'fee_types.id')
            ->whereIn('va_bsi_transactions.student_invoice_id', $invoiceIds)
            ->select(
                'va_bsi_transactions.*',
                'student_invoices.invoice_number',
                'fee_types.name as fee_name'
            )
            ->orderBy('va_bsi_transactions.id', 'desc')
            ->get();

        // Hitung rekapitulasi keuangan
        $activeInvoices = $formattedInvoices->reject(fn($inv) => in_array(strtoupper((string)$inv['status']), ['DIBATALKAN']));
        $totalBilled = (float) $activeInvoices->sum('final_amount');
        $totalPaid = (float) $activeInvoices->where('is_paid', true)->sum('final_amount');
        $remaining = max(0, $totalBilled - $totalPaid);
        $isFinancialLock = $remaining > 0;

        return Inertia::render('Student/Bills/Index', [
            'invoices' => $formattedInvoices,
            'transactions' => $transactions,
            'vaNumber' => $defaultVaNumber,
            'studentInfo' => [
                'name' => $user->name,
                'nim' => $user->identity_number ?: '-',
                'study_program' => $user->study_program ?: '-',
                'email' => $user->email,
                'class_type' => $user->class_type ?? 'Reguler',
            ],
            'summary' => [
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'remaining' => $remaining,
                'status' => $remaining <= 0 ? 'LUNAS' : ($totalPaid > 0 ? 'SEBAGIAN' : 'BELUM_LUNAS'),
                'is_financial_locked' => $isFinancialLock,
            ],
        ]);
    }

    /**
     * Simulator Pembayaran BSI VA 1-Klik untuk Mahasiswa (Sandbox Pelunasan Otomatis)
     */
    public function simulatePayment(Request $request)
    {
        $user = Auth::user();
        $invoiceId = $request->input('invoice_id');

        $invoice = DB::table('student_invoices')
            ->where('id', $invoiceId)
            ->where('user_id', $user->id)
            ->first();

        if (!$invoice) {
            return back()->with('error', 'Tagihan tidak ditemukan.');
        }

        $statusUpper = strtoupper((string) $invoice->status);
        if (in_array($statusUpper, ['LUNAS', 'PAID', 'SUCCESS'])) {
            return back()->with('info', 'Tagihan ini sudah berstatus lunas.');
        }

        $now = now();
        $bsiRefNo = 'BSI-SIM-' . date('YmdHis') . '-' . rand(1000, 9999);
        $cleanNim = preg_replace('/[^0-9]/', '', $user->identity_number ?: (string) $user->id);
        $institutionPrefix = config('services.bsi.institution_code', '9928');
        $defaultVa = $institutionPrefix . '02' . str_pad($cleanNim, 8, '0', STR_PAD_LEFT);
        $payAmount = (float) ($invoice->final_amount ?? $invoice->amount);

        DB::transaction(function () use ($invoice, $user, $now, $bsiRefNo, $defaultVa, $payAmount) {
            // 1. Update Student Invoice ke status LUNAS
            DB::table('student_invoices')
                ->where('id', $invoice->id)
                ->update([
                    'status' => 'LUNAS',
                    'paid_at' => $now,
                    'payment_method' => 'VA_BSI',
                    'updated_at' => $now,
                ]);

            // 2. Update atau buat record transaksi VA BSI
            $vaTx = DB::table('va_bsi_transactions')
                ->where('student_invoice_id', $invoice->id)
                ->first();

            $payload = [
                'responseCode' => '2002500',
                'responseMessage' => 'Payment Successful (Sandbox Pelunasan Mahasiswa)',
                'virtualAccountNo' => $vaTx ? $vaTx->va_number : $defaultVa,
                'paidAmount' => ['value' => (string) $payAmount, 'currency' => 'IDR'],
                'bankReference' => $bsiRefNo,
                'channel' => 'BSI Mobile Simulator',
                'paymentDateTime' => $now->toIso8601String(),
                'simulated_by' => 'MAHASISWA_SANDBOX',
            ];

            if ($vaTx) {
                DB::table('va_bsi_transactions')
                    ->where('id', $vaTx->id)
                    ->update([
                        'status' => 'PAID',
                        'channel' => 'BSI Mobile Simulator',
                        'bsi_reference_no' => $bsiRefNo,
                        'payment_datetime' => $now,
                        'raw_callback_payload' => json_encode($payload),
                        'updated_at' => $now,
                    ]);
            } else {
                DB::table('va_bsi_transactions')->insert([
                    'student_invoice_id' => $invoice->id,
                    'va_number' => $defaultVa,
                    'channel' => 'BSI Mobile Simulator',
                    'amount' => $payAmount,
                    'status' => 'PAID',
                    'bsi_reference_no' => $bsiRefNo,
                    'payment_datetime' => $now,
                    'raw_callback_payload' => json_encode($payload),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // 3. Catat audit log bila tabel tersedia
            if (DB::getSchemaBuilder()->hasTable('audit_logs')) {
                DB::table('audit_logs')->insert([
                    'user_id' => $user->id,
                    'action' => 'STUDENT_BILL_SIMULATE_PAYMENT',
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'target_entity' => 'StudentInvoice',
                    'target_id' => (string) $invoice->id,
                    'details' => json_encode([
                        'invoice_number' => $invoice->invoice_number,
                        'amount' => $payAmount,
                        'bsi_ref' => $bsiRefNo,
                    ]),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });

        return back()->with('success', "Simulasi Pembayaran Berhasil! Tagihan {$invoice->invoice_number} telah lunas melalui BSI Virtual Account.");
    }
}

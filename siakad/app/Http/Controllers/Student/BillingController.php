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

        // Bersihkan NIM untuk pembentukan nomor VA BSI UKT (Prefix: 992802)
        $cleanNim = preg_replace('/[^0-9]/', '', $user->identity_number ?: (string)$user->id);
        $vaNumber = '992802' . str_pad($cleanNim, 8, '0', STR_PAD_LEFT);

        // Ambil data tagihan invoice mahasiswa dari database
        $invoices = DB::table('student_invoices')
            ->join('fee_types', 'student_invoices.fee_type_id', '=', 'fee_types.id')
            ->leftJoin('academic_periods', 'student_invoices.academic_period_id', '=', 'academic_periods.id')
            ->where('student_invoices.user_id', $user->id)
            ->select(
                'student_invoices.*',
                'fee_types.name as fee_name',
                'fee_types.code as fee_code',
                'academic_periods.name as period_name'
            )
            ->orderBy('student_invoices.id', 'desc')
            ->get();

        // Jika belum ada invoice terdaftar di DB (misal akun demo baru), buatkan invoice otomatis
        if ($invoices->isEmpty()) {
            $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
            $feeType = DB::table('fee_types')->where('code', 'SPP')->first() 
                ?? DB::table('fee_types')->first();

            $feeTypeId = $feeType?->id ?? 1;
            $amount = 2500000;

            DB::table('student_invoices')->insert([
                'invoice_number' => 'INV/' . date('Ym') . '/' . str_pad($user->id, 5, '0', STR_PAD_LEFT),
                'user_id' => $user->id,
                'fee_type_id' => $feeTypeId,
                'academic_period_id' => $activePeriod?->id ?? 1,
                'amount' => $amount,
                'paid_amount' => $amount, // default demo lunas
                'status' => 'PAID',
                'due_date' => now()->addDays(30)->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $invoices = DB::table('student_invoices')
                ->join('fee_types', 'student_invoices.fee_type_id', '=', 'fee_types.id')
                ->leftJoin('academic_periods', 'student_invoices.academic_period_id', '=', 'academic_periods.id')
                ->where('student_invoices.user_id', $user->id)
                ->select(
                    'student_invoices.*',
                    'fee_types.name as fee_name',
                    'fee_types.code as fee_code',
                    'academic_periods.name as period_name'
                )
                ->orderBy('student_invoices.id', 'desc')
                ->get();
        }

        // Ambil riwayat transaksi VA BSI
        $invoiceIds = $invoices->pluck('id')->toArray();
        $transactions = DB::table('va_bsi_transactions')
            ->whereIn('student_invoice_id', $invoiceIds)
            ->orderBy('id', 'desc')
            ->get();

        // Hitung rekapitulasi keuangan
        $totalBilled = (float) $invoices->sum('amount');
        $totalPaid = (float) $invoices->sum('paid_amount');
        $remaining = max(0, $totalBilled - $totalPaid);
        $isFinancialLock = $remaining > 0;

        return Inertia::render('Student/Bills/Index', [
            'invoices' => $invoices,
            'transactions' => $transactions,
            'vaNumber' => $vaNumber,
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
     * Simulator Pembayaran BSI VA 1-Klik untuk Mahasiswa
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

        if ($invoice->status === 'PAID') {
            return back()->with('info', 'Tagihan ini sudah berstatus lunas.');
        }

        DB::table('student_invoices')->where('id', $invoice->id)->update([
            'paid_amount' => $invoice->amount,
            'status' => 'PAID',
            'updated_at' => now(),
        ]);

        // Catat transaksi BSI
        $cleanNim = preg_replace('/[^0-9]/', '', $user->identity_number ?: (string)$user->id);
        $vaNumber = '992802' . str_pad($cleanNim, 8, '0', STR_PAD_LEFT);

        DB::table('va_bsi_transactions')->insert([
            'student_invoice_id' => $invoice->id,
            'va_number' => $vaNumber,
            'amount' => $invoice->amount,
            'status' => 'PAID',
            'channel' => 'BSI Mobile Simulator',
            'reference_number' => 'BSI-SIM-' . time(),
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Simulasi Pembayaran Sukses! Tagihan {$invoice->invoice_number} telah lunas melalui BSI Virtual Account.");
    }
}

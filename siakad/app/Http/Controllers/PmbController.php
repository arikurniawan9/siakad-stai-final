<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PmbController extends Controller
{
    /**
     * Tampilan Formulir Pendaftaran Mahasiswa Baru (PMB) Online
     */
    public function showRegistrationForm(): Response
    {
        $activePmbPeriod = DB::table('pmb_periods')
            ->where('is_active', true)
            ->first();

        $studyPrograms = DB::table('study_programs')
            ->where('is_active', true)
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('Pmb/Register', [
            'pmbPeriod' => $activePmbPeriod,
            'studyPrograms' => $studyPrograms,
        ]);
    }

    /**
     * Proses Pendaftaran PMB & Auto-Generate VA BSI (992801...)
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pmb_period_id' => ['required', 'exists:pmb_periods,id'],
            'full_name' => ['required', 'string', 'max:150'],
            'nik' => ['required', 'string', 'size:16'],
            'phone_number' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:100'],
            'gender' => ['required', 'in:L,P'],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date'],
            'address' => ['required', 'string'],
            'previous_school' => ['required', 'string', 'max:150'],
            'first_choice_program_id' => ['required', 'exists:study_programs,id'],
            'second_choice_program_id' => ['nullable', 'exists:study_programs,id'],
            'pathway' => ['required', 'string'],
        ]);

        $pmbPeriod = DB::table('pmb_periods')->find($validated['pmb_period_id']);
        $regFee = $pmbPeriod ? $pmbPeriod->registration_fee : 250000;

        return DB::transaction(function () use ($validated, $regFee) {
            // 1. Generate Nomor Pendaftaran (PMB-2026-0001)
            $countToday = DB::table('pmb_applicants')->count() + 1;
            $regNumber = 'PMB-' . date('Y') . '-' . str_pad($countToday, 4, '0', STR_PAD_LEFT);

            // 2. Simpan Calon Mahasiswa
            $applicantId = DB::table('pmb_applicants')->insertGetId([
                'pmb_period_id' => $validated['pmb_period_id'],
                'registration_number' => $regNumber,
                'full_name' => $validated['full_name'],
                'nik' => $validated['nik'],
                'phone_number' => $validated['phone_number'],
                'email' => $validated['email'],
                'gender' => $validated['gender'],
                'birth_place' => $validated['birth_place'],
                'birth_date' => $validated['birth_date'],
                'address' => $validated['address'],
                'previous_school' => $validated['previous_school'],
                'first_choice_program_id' => $validated['first_choice_program_id'],
                'second_choice_program_id' => $validated['second_choice_program_id'] ?? null,
                'pathway' => $validated['pathway'],
                'status' => 'MENUNGGU_PEMBAYARAN',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Buat Tagihan Invoicing
            $invoiceNumber = 'INV-PMB-' . date('Ymd') . '-' . str_pad($applicantId, 4, '0', STR_PAD_LEFT);
            $invoiceId = DB::table('student_invoices')->insertGetId([
                'invoice_number' => $invoiceNumber,
                'pmb_applicant_id' => $applicantId,
                'fee_type_id' => 1, // PMB
                'amount' => $regFee,
                'discount_amount' => 0,
                'penalty_amount' => 0,
                'final_amount' => $regFee,
                'due_date' => now()->addDays(7),
                'status' => 'BELUM_BAYAR',
                'notes' => "Biaya Pendaftaran PMB Online - {$validated['full_name']}",
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 4. OTOMASI GENERATE NOMOR VIRTUAL ACCOUNT BSI
            // Format: [Prefix: 9928] + [Kode Tagihan: 01] + [Tahun 2 digit: 26] + [ID Applicant: 4 digit]
            $institutionCode = config('services.bsi.institution_code', '9928');
            $billCode = '01'; // 01 = PMB
            $idSuffix = date('y') . str_pad($applicantId, 4, '0', STR_PAD_LEFT);
            $vaNumber = $institutionCode . $billCode . $idSuffix; // e.g. 992801260001

            DB::table('va_bsi_transactions')->insert([
                'student_invoice_id' => $invoiceId,
                'va_number' => $vaNumber,
                'channel' => 'BSI_MOBILE',
                'amount' => $regFee,
                'status' => 'PENDING',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return redirect()->route('pmb.status', ['reg_number' => $regNumber])
                ->with('success', 'Pendaftaran PMB berhasil! Silakan lakukan pembayaran uang pendaftaran ke Virtual Account BSI di bawah ini.');
        });
    }

    /**
     * Cek Status Pendaftaran & Kartu VA BSI
     */
    public function checkStatus(Request $request): Response
    {
        $regNumber = $request->input('reg_number');

        $applicant = null;
        $invoice = null;
        $vaTransaction = null;
        $program = null;

        if ($regNumber) {
            $applicant = DB::table('pmb_applicants')
                ->where('registration_number', $regNumber)
                ->first();

            if ($applicant) {
                $program = DB::table('study_programs')->find($applicant->first_choice_program_id);

                $invoice = DB::table('student_invoices')
                    ->where('pmb_applicant_id', $applicant->id)
                    ->first();

                if ($invoice) {
                    $vaTransaction = DB::table('va_bsi_transactions')
                        ->where('student_invoice_id', $invoice->id)
                        ->first();
                }
            }
        }

        return Inertia::render('Pmb/Status', [
            'applicant' => $applicant,
            'program' => $program,
            'invoice' => $invoice,
            'vaTransaction' => $vaTransaction,
            'searchRegNumber' => $regNumber,
        ]);
    }
}

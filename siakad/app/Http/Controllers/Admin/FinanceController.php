<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Tampilkan Modul Keuangan Lengkap: Setup Tarif, Invoicing & Monitoring VA BSI
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->input('status');
        $search = $request->input('search');
        $selectedYearId = $request->input('academic_year_id');

        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();
        $studyPrograms = DB::table('study_programs')->get();
        $feeTypes = DB::table('fee_types')->orderBy('id', 'asc')->get();
        $academicPeriods = DB::table('academic_periods')->orderBy('id', 'desc')->get();
        $activePeriod = $academicPeriods->where('is_active', true)->first();

        // Ambil data Tagihan (Invoices)
        $invoices = DB::table('student_invoices')
            ->leftJoin('users', 'student_invoices.user_id', '=', 'users.id')
            ->leftJoin('pmb_applicants', 'student_invoices.pmb_applicant_id', '=', 'pmb_applicants.id')
            ->join('fee_types', 'student_invoices.fee_type_id', '=', 'fee_types.id')
            ->leftJoin('va_bsi_transactions', 'student_invoices.id', '=', 'va_bsi_transactions.student_invoice_id')
            ->select(
                'student_invoices.*',
                'fee_types.name as fee_name',
                'fee_types.code as fee_code',
                'users.name as user_name',
                'users.identity_number as user_nim',
                'users.study_program as user_prodi',
                'pmb_applicants.full_name as applicant_name',
                'pmb_applicants.registration_number as applicant_reg_num',
                'va_bsi_transactions.va_number',
                'va_bsi_transactions.status as va_status',
                'va_bsi_transactions.bsi_reference_no',
                'va_bsi_transactions.payment_datetime'
            )
            ->when($statusFilter, function ($q) use ($statusFilter) {
                $q->where('student_invoices.status', $statusFilter);
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('student_invoices.invoice_number', 'ilike', "%{$search}%")
                        ->orWhere('users.name', 'ilike', "%{$search}%")
                        ->orWhere('users.identity_number', 'ilike', "%{$search}%")
                        ->orWhere('pmb_applicants.full_name', 'ilike', "%{$search}%")
                        ->orWhere('va_bsi_transactions.va_number', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('student_invoices.id', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Ambil data Setup Tarif Biaya per Tahun Akademik
        $tariffs = DB::table('fee_tariffs')
            ->join('academic_years', 'fee_tariffs.academic_year_id', '=', 'academic_years.id')
            ->leftJoin('study_programs', 'fee_tariffs.study_program_id', '=', 'study_programs.id')
            ->join('fee_types', 'fee_tariffs.fee_type_id', '=', 'fee_types.id')
            ->when($selectedYearId, fn($q) => $q->where('fee_tariffs.academic_year_id', $selectedYearId))
            ->select(
                'fee_tariffs.*',
                'academic_years.code as year_code',
                'academic_years.name as year_name',
                'study_programs.name as study_program_name',
                'fee_types.name as fee_name',
                'fee_types.code as fee_code'
            )
            ->orderBy('fee_tariffs.academic_year_id', 'desc')
            ->orderBy('fee_tariffs.id', 'asc')
            ->get();

        // Statistik Kas
        $totalPaid = DB::table('student_invoices')->where('status', 'LUNAS')->sum('final_amount');
        $totalUnpaid = DB::table('student_invoices')->where('status', 'BELUM_BAYAR')->sum('final_amount');
        $totalVaCount = DB::table('va_bsi_transactions')->count();

        return Inertia::render('Admin/Finance/Index', [
            'invoices' => $invoices,
            'tariffs' => $tariffs,
            'feeTypes' => $feeTypes,
            'academicYears' => $academicYears,
            'studyPrograms' => $studyPrograms,
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'stats' => [
                'total_paid' => (float) $totalPaid,
                'total_unpaid' => (float) $totalUnpaid,
                'total_va' => $totalVaCount,
            ],
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
                'academic_year_id' => $selectedYearId,
            ],
        ]);
    }

    /**
     * Tambah Jenis Pembayaran / Komponen Biaya Baru (e.g. PRAKTIKUM, WISUDA)
     */
    public function storeFeeType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:fee_types,code'],
            'name' => ['required', 'string', 'max:100'],
            'va_bill_code' => ['required', 'string', 'size:2'],
            'default_amount' => ['required', 'numeric', 'min:0'],
            'is_periodic' => ['required', 'boolean'],
        ]);

        DB::table('fee_types')->insert([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'va_bill_code' => $validated['va_bill_code'],
            'default_amount' => $validated['default_amount'],
            'is_periodic' => $validated['is_periodic'],
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Komponen biaya {$validated['name']} ({$validated['code']}) berhasil ditambahkan.");
    }

    /**
     * Simpan / Perbarui Setup Tarif Biaya per Tahun Akademik & Prodi
     */
    public function storeTariff(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'study_program_id' => ['nullable', 'exists:study_programs,id'],
            'fee_type_id' => ['required', 'exists:fee_types,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        DB::table('fee_tariffs')->updateOrInsert(
            [
                'academic_year_id' => $validated['academic_year_id'],
                'study_program_id' => $validated['study_program_id'] ?: null,
                'fee_type_id' => $validated['fee_type_id'],
            ],
            [
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? 'Tarif Biaya Resmi',
                'is_active' => true,
                'updated_at' => now(),
            ]
        );

        return back()->with('success', 'Setup tarif biaya per tahun akademik & program studi berhasil disimpan.');
    }

    /**
     * Hapus Setup Tarif
     */
    public function destroyTariff(int $id): RedirectResponse
    {
        DB::table('fee_tariffs')->where('id', $id)->delete();
        return back()->with('success', 'Tarif biaya berhasil dihapus.');
    }

    /**
     * Mass Invoice Generation: Generate Tagihan Massal Otomatis Berdasarkan Tarif & Angkatan
     */
    public function generateMassInvoices(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_period_id' => ['required', 'exists:academic_periods,id'],
            'fee_type_id' => ['required', 'exists:fee_types,id'],
            'due_date' => ['required', 'date'],
            'batch_year' => ['nullable', 'string'], // e.g. 2026, 2025, 2024 atau all
            'study_program_id' => ['nullable', 'exists:study_programs,id'],
            'override_amount' => ['nullable', 'numeric', 'min:10000'],
        ]);

        $academicPeriod = DB::table('academic_periods')->find($validated['academic_period_id']);
        $feeType = DB::table('fee_types')->find($validated['fee_type_id']);
        $studyProgram = $validated['study_program_id'] ? DB::table('study_programs')->find($validated['study_program_id']) : null;

        $studentsQuery = DB::table('users')
            ->where('role', 'mahasiswa')
            ->where('is_active', true);

        if (!empty($validated['batch_year'])) {
            $prefix = substr($validated['batch_year'], -2);
            $studentsQuery->where('identity_number', 'like', "{$prefix}%");
        }

        if ($studyProgram) {
            $studentsQuery->where('study_program', $studyProgram->name);
        }

        $students = $studentsQuery->get();

        if ($students->isEmpty()) {
            return back()->with('error', 'Tidak ada mahasiswa aktif yang sesuai dengan kriteria angkatan/prodi terpilih.');
        }

        $institutionPrefix = config('services.bsi.institution_code', '9928');
        $billCode = $feeType->va_bill_code ?? '02';
        $generatedCount = 0;

        DB::transaction(function () use ($students, $validated, $feeType, $academicPeriod, $institutionPrefix, $billCode, &$generatedCount) {
            $now = now();

            foreach ($students as $student) {
                // Cari tarif spesifik atau default
                $tariffAmount = $validated['override_amount'] ?: null;
                if (!$tariffAmount) {
                    $tariff = DB::table('fee_tariffs')
                        ->where('academic_year_id', $academicPeriod->academic_year_id)
                        ->where('fee_type_id', $feeType->id)
                        ->first();
                    $tariffAmount = $tariff ? $tariff->amount : $feeType->default_amount;
                }

                $invoiceNumber = 'INV-' . date('Ym') . '-' . str_pad($student->id, 4, '0', STR_PAD_LEFT) . '-' . rand(100, 999);
                $cleanNim = preg_replace('/[^0-9]/', '', $student->identity_number ?? (string)$student->id);
                $vaNumber = $institutionPrefix . $billCode . str_pad($cleanNim, 8, '0', STR_PAD_LEFT);

                // Cek jika sudah ada tagihan sejenis di semester ini
                $existingInvoice = DB::table('student_invoices')
                    ->where('user_id', $student->id)
                    ->where('academic_period_id', $academicPeriod->id)
                    ->where('fee_type_id', $feeType->id)
                    ->first();

                if ($existingInvoice) {
                    continue;
                }

                $invoiceId = DB::table('student_invoices')->insertGetId([
                    'invoice_number' => $invoiceNumber,
                    'user_id' => $student->id,
                    'pmb_applicant_id' => null,
                    'fee_type_id' => $feeType->id,
                    'academic_period_id' => $academicPeriod->id,
                    'amount' => $tariffAmount,
                    'discount_amount' => 0,
                    'penalty_amount' => 0,
                    'final_amount' => $tariffAmount,
                    'due_date' => $validated['due_date'],
                    'status' => 'BELUM_BAYAR',
                    'notes' => "Tagihan {$feeType->name} Periode {$academicPeriod->name}",
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('va_bsi_transactions')->insert([
                    'student_invoice_id' => $invoiceId,
                    'va_number' => $vaNumber,
                    'channel' => 'BSI_MOBILE',
                    'amount' => $tariffAmount,
                    'status' => 'PENDING',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $generatedCount++;
            }
        });

        return back()->with('success', "Sukses! {$generatedCount} Tagihan {$feeType->name} & Virtual Account BSI (9928) berhasil diterbitkan.");
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PmbAdminController extends Controller
{
    /**
     * Tampilan Dashboard & Manajemen Penerimaan Mahasiswa Baru (PMB)
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $periodFilter = $request->input('pmb_period_id');
        $prodiFilter = $request->input('study_program_id');

        $pmbPeriods = DB::table('pmb_periods')->orderBy('id', 'desc')->get();
        $activePmbPeriod = $pmbPeriods->where('is_active', true)->first();
        $studyPrograms = DB::table('study_programs')->get();
        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();

        // Query Calon Mahasiswa
        $applicantsQuery = DB::table('pmb_applicants')
            ->join('pmb_periods', 'pmb_applicants.pmb_period_id', '=', 'pmb_periods.id')
            ->join('study_programs as p1', 'pmb_applicants.first_choice_program_id', '=', 'p1.id')
            ->leftJoin('study_programs as p2', 'pmb_applicants.second_choice_program_id', '=', 'p2.id')
            ->leftJoin('student_invoices', 'pmb_applicants.id', '=', 'student_invoices.pmb_applicant_id')
            ->leftJoin('va_bsi_transactions', 'student_invoices.id', '=', 'va_bsi_transactions.student_invoice_id')
            ->select(
                'pmb_applicants.*',
                'pmb_periods.name as period_name',
                'p1.name as first_choice_name',
                'p2.name as second_choice_name',
                'student_invoices.invoice_number',
                'student_invoices.final_amount as registration_fee',
                'student_invoices.status as invoice_status',
                'va_bsi_transactions.va_number',
                'va_bsi_transactions.status as va_status'
            );

        if ($periodFilter) {
            $applicantsQuery->where('pmb_applicants.pmb_period_id', $periodFilter);
        }

        if ($statusFilter) {
            $applicantsQuery->where('pmb_applicants.status', $statusFilter);
        }

        if ($prodiFilter) {
            $applicantsQuery->where(function ($q) use ($prodiFilter) {
                $q->where('pmb_applicants.first_choice_program_id', $prodiFilter)
                  ->orWhere('pmb_applicants.second_choice_program_id', $prodiFilter);
            });
        }

        if ($search) {
            $applicantsQuery->where(function ($sq) use ($search) {
                $sq->where('pmb_applicants.full_name', 'ilike', "%{$search}%")
                   ->orWhere('pmb_applicants.mother_name', 'ilike', "%{$search}%")
                   ->orWhere('pmb_applicants.registration_number', 'ilike', "%{$search}%")
                   ->orWhere('pmb_applicants.nik', 'ilike', "%{$search}%")
                   ->orWhere('pmb_applicants.nisn', 'ilike', "%{$search}%")
                   ->orWhere('pmb_applicants.previous_school', 'ilike', "%{$search}%")
                   ->orWhere('pmb_applicants.phone_number', 'ilike', "%{$search}%");
            });
        }

        $applicants = $applicantsQuery->orderBy('pmb_applicants.id', 'desc')->paginate(15)->withQueryString();

        // Statistik KPI PMB
        $totalApplicants = DB::table('pmb_applicants')->count();
        $verifiedCount = DB::table('pmb_applicants')->whereIn('status', ['TERVERIFIKASI', 'TERVERIFIKASI_BAYAR', 'LULUS_SELEKSI', 'SUDAH_DAFTAR_ULANG'])->count();
        $passedCount = DB::table('pmb_applicants')->whereIn('status', ['LULUS_SELEKSI', 'SUDAH_DAFTAR_ULANG'])->count();
        $pendingPaymentCount = DB::table('pmb_applicants')->where('status', 'MENUNGGU_PEMBAYARAN')->count();

        // Rekap per Prodi
        $prodiStats = DB::table('pmb_applicants')
            ->join('study_programs', 'pmb_applicants.first_choice_program_id', '=', 'study_programs.id')
            ->select('study_programs.name as prodi_name', DB::raw('count(*) as count'))
            ->groupBy('study_programs.name')
            ->get();

        return Inertia::render('Admin/Pmb/Index', [
            'applicants' => $applicants,
            'pmbPeriods' => $pmbPeriods,
            'activePmbPeriod' => $activePmbPeriod,
            'studyPrograms' => $studyPrograms,
            'academicYears' => $academicYears,
            'prodiStats' => $prodiStats,
            'stats' => [
                'total' => $totalApplicants,
                'verified' => $verifiedCount,
                'passed' => $passedCount,
                'pending_payment' => $pendingPaymentCount,
            ],
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'pmb_period_id' => $periodFilter,
                'study_program_id' => $prodiFilter,
            ],
        ]);
    }

    /**
     * Tambah Gelombang / Periode PMB Baru
     */
    public function storePeriod(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'name' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'registration_fee' => ['required', 'numeric', 'min:0'],
            'quota' => ['required', 'integer', 'min:1'],
        ]);

        DB::table('pmb_periods')->insert([
            'academic_year_id' => $validated['academic_year_id'],
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'registration_fee' => $validated['registration_fee'],
            'quota' => $validated['quota'],
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Gelombang pendaftaran {$validated['name']} berhasil dibuka.");
    }

    /**
     * Update Status Kelulusan / Seleksi Calon Mahasiswa
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:MENUNGGU_PEMBAYARAN,TERVERIFIKASI,LULUS_SELEKSI,DITOLAK,SUDAH_DAFTAR_ULANG'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        DB::table('pmb_applicants')->where('id', $id)->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Status calon mahasiswa berhasil diperbarui.');
    }

    /**
     * Otomasi Penerbitan Akun Mahasiswa Resmi (Generate NIM & Akun SIAKAD)
     */
    public function enrollStudent(Request $request, int $id): RedirectResponse
    {
        $applicant = DB::table('pmb_applicants')->where('id', $id)->first();
        if (!$applicant) {
            return back()->with('error', 'Data calon mahasiswa tidak ditemukan.');
        }

        $prodi = DB::table('study_programs')->find($applicant->first_choice_program_id);
        $now = now();
        $yearPrefix = date('y'); // e.g. 26

        // Generate NIM baru: Tahun (26) + Kode Prodi (01) + Nomor Urut (0001) -> 26010045
        $prodiCode = str_pad($applicant->first_choice_program_id, 2, '0', STR_PAD_LEFT);
        $studentCount = User::where('role', 'mahasiswa')->where('identity_number', 'like', "{$yearPrefix}{$prodiCode}%")->count() + 1;
        $newNim = $yearPrefix . $prodiCode . str_pad($studentCount, 4, '0', STR_PAD_LEFT);

        // Buat akun user mahasiswa
        $createdUser = User::create([
            'name' => $applicant->full_name,
            'username' => $newNim,
            'identity_number' => $newNim,
            'email' => $applicant->email,
            'role' => 'mahasiswa',
            'study_program' => $prodi ? $prodi->name : 'Pendidikan Agama Islam (S1)',
            'gender' => $applicant->gender,
            'phone_number' => $applicant->phone_number,
            'password' => Hash::make('salam123'),
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Update status calon mahasiswa menjadi SUDAH_DAFTAR_ULANG
        DB::table('pmb_applicants')->where('id', $id)->update([
            'status' => 'SUDAH_DAFTAR_ULANG',
            'notes' => "Resmi menjadi mahasiswa (NIM: {$newNim})",
            'updated_at' => $now,
        ]);

        return back()->with('success', "Sukses! {$applicant->full_name} resmi terdaftar sebagai Mahasiswa Baru dengan NIM: {$newNim} (Password: salam123).");
    }

    /**
     * Hapus Data Calon Mahasiswa PMB (Cascade Invoices & VA)
     */
    public function destroy(int $id): RedirectResponse
    {
        DB::transaction(function () use ($id) {
            $applicant = DB::table('pmb_applicants')->where('id', $id)->first();
            if (!$applicant) {
                return;
            }

            // 1. Hapus invoices & VA terkait pmb_applicant_id
            $invoiceIds = DB::table('student_invoices')
                ->where('pmb_applicant_id', $id)
                ->pluck('id')
                ->toArray();

            if (!empty($invoiceIds)) {
                DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $invoiceIds)->delete();
                DB::table('student_invoices')->whereIn('id', $invoiceIds)->delete();
            }

            // 2. Hapus berkas pmb
            if (DB::getSchemaBuilder()->hasTable('pmb_documents')) {
                DB::table('pmb_documents')->where('pmb_applicant_id', $id)->delete();
            }

            // 3. Hapus pendaftar
            DB::table('pmb_applicants')->where('id', $id)->delete();

            // Audit log
            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'PMB_APPLICANT_DELETE',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'target_entity' => 'PmbApplicant',
                'target_id' => (string) $id,
                'details' => json_encode(['full_name' => $applicant->full_name, 'reg_number' => $applicant->registration_number]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', 'Data calon pendaftar PMB beserta invoice & VA terkait berhasil dihapus.');
    }

    /**
     * Hapus Masal Pendaftar PMB
     */
    public function destroyBatch(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return back()->with('error', 'Tidak ada data pendaftar yang dipilih.');
        }

        DB::transaction(function () use ($ids) {
            $invoiceIds = DB::table('student_invoices')
                ->whereIn('pmb_applicant_id', $ids)
                ->pluck('id')
                ->toArray();

            if (!empty($invoiceIds)) {
                DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $invoiceIds)->delete();
                DB::table('student_invoices')->whereIn('id', $invoiceIds)->delete();
            }

            if (DB::getSchemaBuilder()->hasTable('pmb_documents')) {
                DB::table('pmb_documents')->whereIn('pmb_applicant_id', $ids)->delete();
            }

            DB::table('pmb_applicants')->whereIn('id', $ids)->delete();

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'PMB_APPLICANT_BATCH_DELETE',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'target_entity' => 'PmbApplicant',
                'target_id' => count($ids) . ' records',
                'details' => json_encode(['ids' => $ids]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', count($ids) . ' data calon pendaftar PMB berhasil dihapus.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AcademicPeriodController extends Controller
{
    /**
     * Tampilkan Daftar Tahun & Periode Akademik
     */
    public function index(): Response
    {
        $academicYears = DB::table('academic_years')
            ->orderBy('id', 'desc')
            ->get();

        $academicPeriods = DB::table('academic_periods')
            ->join('academic_years', 'academic_periods.academic_year_id', '=', 'academic_years.id')
            ->select(
                'academic_periods.*',
                'academic_years.code as year_code',
                'academic_years.name as year_name'
            )
            ->orderBy('academic_periods.id', 'desc')
            ->get();

        $activePeriod = $academicPeriods->where('is_active', true)->first();

        return Inertia::render('Admin/AcademicPeriods/Index', [
            'academicYears' => $academicYears,
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
        ]);
    }

    /**
     * Tambah Tahun Akademik Baru (e.g. 2027/2028)
     */
    public function storeYear(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:16', 'unique:academic_years,code'],
            'name' => ['required', 'string', 'max:64'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
        ], [
            'code.unique' => 'Kode Tahun Akademik sudah terdaftar sebelumnya.',
            'end_date.after' => 'Tanggal berakhir harus sesudah tanggal mulai.',
        ]);

        DB::table('academic_years')->insert([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'is_active' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Tahun Akademik {$validated['name']} ({$validated['code']}) berhasil ditambahkan.");
    }

    /**
     * Tambah Periode Semester Baru
     */
    public function storePeriod(Request $request): RedirectResponse
    {
        $validated = $this->validatePeriod($request);

        DB::table('academic_periods')->insert(array_merge($this->periodPayload($validated), [
            'is_active' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        return back()->with('success', "Periode Semester {$validated['name']} ({$validated['code']}) berhasil dibuat.");
    }

    /**
     * Perbarui periode semester yang sudah ada.
     */
    public function updatePeriod(Request $request, int $id): RedirectResponse
    {
        $period = DB::table('academic_periods')->find($id);

        if (!$period) {
            return back()->with('error', 'Periode semester tidak ditemukan.');
        }

        $validated = $this->validatePeriod($request, $id);

        DB::table('academic_periods')
            ->where('id', $id)
            ->update(array_merge($this->periodPayload($validated), [
                'updated_at' => now(),
            ]));

        return back()->with('success', "Periode Semester {$validated['name']} berhasil diperbarui.");
    }

    /**
     * Hapus periode yang belum aktif dan belum dipakai data akademik.
     */
    public function destroyPeriod(int $id): RedirectResponse
    {
        $period = DB::table('academic_periods')->find($id);

        if (!$period) {
            return back()->with('error', 'Periode semester tidak ditemukan.');
        }

        if ($period->is_active) {
            return back()->with('error', 'Periode semester yang sedang aktif tidak dapat dihapus. Aktifkan periode lain terlebih dahulu.');
        }

        $dependentTables = [
            'course_classes',
            'krs_submissions',
            'khs_records',
            'edom_questionnaires',
            'exam_schedules',
            'student_leave_requests',
        ];

        foreach ($dependentTables as $table) {
            if (Schema::hasTable($table) && DB::table($table)->where('academic_period_id', $id)->exists()) {
                return back()->with('error', 'Periode semester tidak dapat dihapus karena sudah memiliki data akademik terkait.');
            }
        }

        DB::table('academic_periods')->where('id', $id)->delete();

        return back()->with('success', "Periode Semester {$period->name} berhasil dihapus.");
    }

    /**
     * Aktifkan Periode Akademik Tertentu
     */
    public function activate(Request $request, $id): RedirectResponse
    {
        if (!DB::table('academic_periods')->where('id', $id)->exists()) {
            return back()->with('error', 'Periode semester tidak ditemukan.');
        }

        DB::transaction(function () use ($id) {
            DB::table('academic_periods')->update(['is_active' => false]);
            DB::table('academic_periods')->where('id', $id)->update(['is_active' => true]);
        });

        return back()->with('success', 'Periode akademik aktif berhasil diubah.');
    }

    /**
     * Validasi yang dipakai bersama oleh form tambah dan edit periode.
     */
    private function validatePeriod(Request $request, ?int $periodId = null): array
    {
        return $request->validate([
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'code' => ['required', 'string', 'max:32', Rule::unique('academic_periods', 'code')->ignore($periodId)],
            'name' => ['required', 'string', 'max:100'],
            'semester_type' => ['required', 'in:GANJIL,GENAP,PENDEK'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'krs_start_date' => ['required', 'date'],
            'krs_end_date' => ['required', 'date', 'after_or_equal:krs_start_date'],
            'payment_start_date' => ['required', 'date'],
            'payment_end_date' => ['required', 'date', 'after_or_equal:payment_start_date'],
            'grading_start_date' => ['nullable', 'date'],
            'grading_end_date' => ['nullable', 'date', 'after_or_equal:grading_start_date'],
            'edom_start_date' => ['nullable', 'date'],
            'edom_end_date' => ['nullable', 'date', 'after_or_equal:edom_start_date'],
        ], [
            'code.unique' => 'Kode Semester sudah digunakan.',
            'end_date.after' => 'Tanggal akhir perkuliahan harus sesudah tanggal mulai.',
            'krs_end_date.after_or_equal' => 'Tanggal akhir KRS tidak boleh sebelum tanggal mulai KRS.',
            'payment_end_date.after_or_equal' => 'Tanggal akhir pembayaran tidak boleh sebelum tanggal mulai pembayaran.',
            'grading_end_date.after_or_equal' => 'Tanggal akhir input nilai tidak boleh sebelum tanggal mulai.',
            'edom_end_date.after_or_equal' => 'Tanggal akhir EDOM tidak boleh sebelum tanggal mulai.',
        ]);
    }

    private function periodPayload(array $validated): array
    {
        return [
            'academic_year_id' => $validated['academic_year_id'],
            'code' => $validated['code'],
            'name' => $validated['name'],
            'semester_type' => $validated['semester_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'krs_start_date' => $validated['krs_start_date'],
            'krs_end_date' => $validated['krs_end_date'],
            'krs_revision_end_date' => date('Y-m-d', strtotime($validated['krs_end_date'] . ' +7 days')),
            'payment_start_date' => $validated['payment_start_date'],
            'payment_end_date' => $validated['payment_end_date'],
            'grading_start_date' => $validated['grading_start_date'] ?? $validated['start_date'],
            'grading_end_date' => $validated['grading_end_date'] ?? $validated['end_date'],
            'edom_start_date' => $validated['edom_start_date'] ?? null,
            'edom_end_date' => $validated['edom_end_date'] ?? null,
        ];
    }
}

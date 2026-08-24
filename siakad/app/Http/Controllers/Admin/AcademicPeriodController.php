<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $validated = $request->validate([
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'code' => ['required', 'string', 'max:32', 'unique:academic_periods,code'],
            'name' => ['required', 'string', 'max:100'],
            'semester_type' => ['required', 'in:GANJIL,GENAP,PENDEK'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'krs_start_date' => ['required', 'date'],
            'krs_end_date' => ['required', 'date', 'after_or_equal:krs_start_date'],
            'payment_start_date' => ['required', 'date'],
            'payment_end_date' => ['required', 'date', 'after_or_equal:payment_start_date'],
            'grading_start_date' => ['nullable', 'date'],
            'grading_end_date' => ['nullable', 'date'],
            'edom_start_date' => ['nullable', 'date'],
            'edom_end_date' => ['nullable', 'date'],
        ], [
            'code.unique' => 'Kode Semester sudah digunakan.',
        ]);

        DB::table('academic_periods')->insert([
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
            'is_active' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Periode Semester {$validated['name']} ({$validated['code']}) berhasil dibuat.");
    }

    /**
     * Aktifkan Periode Akademik Tertentu
     */
    public function activate(Request $request, $id): RedirectResponse
    {
        DB::transaction(function () use ($id) {
            DB::table('academic_periods')->update(['is_active' => false]);
            DB::table('academic_periods')->where('id', $id)->update(['is_active' => true]);
        });

        return back()->with('success', 'Periode akademik aktif berhasil diubah.');
    }
}

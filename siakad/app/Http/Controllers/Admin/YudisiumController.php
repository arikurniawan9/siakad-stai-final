<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class YudisiumController extends Controller
{
    /**
     * Tampilkan Skrining Kelulusan, Yudisium & SK Sarjana
     */
    public function index(Request $request): Response
    {
        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();
        $periods = DB::table('yudisium_periods')->orderBy('id', 'desc')->get();

        $applicants = DB::table('yudisium_applicants')
            ->join('users', 'yudisium_applicants.student_id', '=', 'users.id')
            ->join('yudisium_periods', 'yudisium_applicants.yudisium_period_id', '=', 'yudisium_periods.id')
            ->select(
                'yudisium_applicants.*',
                'users.name as student_name',
                'users.identity_number as student_nim',
                'users.study_program as student_prodi',
                'yudisium_periods.name as period_name'
            )
            ->orderBy('yudisium_applicants.id', 'desc')
            ->paginate(15);

        // Statistik
        $totalYudisium = DB::table('yudisium_applicants')->count();
        $verifiedYudisium = DB::table('yudisium_applicants')->where('status', 'LOLOS_VERIFIKASI')->count();
        $graduatedCount = DB::table('yudisium_applicants')->where('status', 'RESMI_LULUS')->count();

        return Inertia::render('Admin/Yudisium/Index', [
            'applicants' => $applicants,
            'periods' => $periods,
            'academicYears' => $academicYears,
            'stats' => [
                'total' => $totalYudisium,
                'verified' => $verifiedYudisium,
                'graduated' => $graduatedCount,
            ],
        ]);
    }

    /**
     * Tambah Periode Yudisium Baru
     */
    public function storePeriod(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'name' => ['required', 'string', 'max:100'],
            'event_date' => ['required', 'date'],
            'registration_deadline' => ['required', 'date'],
            'sk_number' => ['nullable', 'string', 'max:100'],
        ]);

        DB::table('yudisium_periods')->insert([
            'academic_year_id' => $validated['academic_year_id'],
            'name' => $validated['name'],
            'event_date' => $validated['event_date'],
            'registration_deadline' => $validated['registration_deadline'],
            'sk_number' => $validated['sk_number'] ?? 'SK-YUDISIUM-STAI-' . date('Y/m'),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Periode yudisium sarjana berhasil dibuka.');
    }

    /**
     * Verifikasi Kelulusan / Resmikan Lulus
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:DIAJUKAN,LOLOS_VERIFIKASI,DITOLAK,RESMI_LULUS'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::table('yudisium_applicants')->where('id', $id)->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Status yudisium mahasiswa berhasil diperbarui.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentActivityController extends Controller
{
    /**
     * Tampilan Modul Aktivitas Mahasiswa & Rekognisi MBKM
     */
    public function index(Request $request): Response|JsonResponse
    {
        $prodiFilter = $request->input('study_program');
        $typeFilter = $request->input('activity_type');
        $search = $request->input('search');

        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        $academicPeriods = DB::table('academic_periods')->orderBy('id', 'desc')->get();
        $activePeriod = $academicPeriods->firstWhere('is_active', true) ?? $academicPeriods->first();

        $activities = DB::table('student_activities')
            ->join('users as students', 'student_activities.student_id', '=', 'students.id')
            ->leftJoin('study_programs', 'student_activities.study_program_id', '=', 'study_programs.id')
            ->when($prodiFilter, fn($q) => $q->where('student_activities.study_program_id', $prodiFilter))
            ->when($typeFilter, fn($q) => $q->where('student_activities.activity_type', $typeFilter))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('students.name', 'ilike', "%{$search}%")
                       ->orWhere('students.identity_number', 'ilike', "%{$search}%")
                       ->orWhere('student_activities.title', 'ilike', "%{$search}%");
                });
            })
            ->select(
                'student_activities.*',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'study_programs.name as study_program_name'
            )
            ->orderBy('student_activities.id', 'desc')
            ->get();

        $stats = [
            'total_activities' => $activities->count(),
            'total_mbkm' => $activities->filter(fn($a) => str_starts_with($a->activity_type, 'MBKM_'))->count(),
            'total_prestasi' => $activities->where('activity_type', 'PRESTASI_LOMBA')->count(),
            'total_credits_recognized' => $activities->sum('recognition_credits'),
        ];

        return Inertia::render('Admin/Activities/Index', [
            'activities' => $activities,
            'studyPrograms' => $studyPrograms,
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'stats' => $stats,
            'filters' => [
                'study_program' => $prodiFilter,
                'activity_type' => $typeFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Simpan Aktivitas Baru
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'activity_type' => 'required|string',
            'title' => 'required|string|max:255',
            'organization_name' => 'nullable|string|max:255',
            'recognition_credits' => 'nullable|numeric|min:0|max:24',
            'sk_number' => 'nullable|string|max:100',
        ]);

        $student = User::find($request->student_id);
        $prodi = DB::table('study_programs')->where('name', 'ilike', "%{$student->study_program}%")->first();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        DB::table('student_activities')->insert([
            'student_id' => $request->student_id,
            'study_program_id' => $prodi?->id,
            'academic_period_id' => $activePeriod?->id ?? 1,
            'activity_type' => $request->activity_type,
            'title' => $request->title,
            'organization_name' => $request->organization_name,
            'location' => $request->location,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'recognition_credits' => $request->recognition_credits ?: 0,
            'sk_number' => $request->sk_number,
            'status' => 'DISETUJUI',
            'description' => $request->description,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Aktivitas Mahasiswa berhasil dicatat & SKS Rekognisi telah ditetapkan.');
    }

    /**
     * Hapus Aktivitas
     */
    public function destroy($id): RedirectResponse|JsonResponse
    {
        DB::table('student_activities')->where('id', $id)->delete();
        return back()->with('success', 'Data aktivitas mahasiswa berhasil dihapus.');
    }
}

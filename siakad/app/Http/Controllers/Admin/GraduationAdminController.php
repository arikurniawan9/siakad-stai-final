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
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class GraduationAdminController extends Controller
{
    /**
     * Tampilan Modul Kelulusan (3 Tab: Tugas Akhir, Wisuda, Surat Keterangan Lulus)
     */
    public function index(Request $request): Response|JsonResponse
    {
        $tab = $request->input('tab', 'thesis'); // thesis | graduation | skl
        $prodiFilter = $request->input('study_program');
        $search = $request->input('search');

        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        $lecturers = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])->select('id', 'name')->orderBy('name')->get();
        $academicPeriods = DB::table('academic_periods')->orderBy('id', 'desc')->get();
        $activePeriod = $academicPeriods->firstWhere('is_active', true) ?? $academicPeriods->first();

        // 1. Tab Tugas Akhir / Skripsi
        $theses = DB::table('thesis_submissions')
            ->join('users as students', 'thesis_submissions.student_id', '=', 'students.id')
            ->leftJoin('users as adv1', 'thesis_submissions.advisor_1_id', '=', 'adv1.id')
            ->leftJoin('users as adv2', 'thesis_submissions.advisor_2_id', '=', 'adv2.id')
            ->leftJoin('study_programs', 'thesis_submissions.study_program_id', '=', 'study_programs.id')
            ->when($prodiFilter, fn($q) => $q->where('thesis_submissions.study_program_id', $prodiFilter))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('students.name', 'ilike', "%{$search}%")
                       ->orWhere('students.identity_number', 'ilike', "%{$search}%")
                       ->orWhere('thesis_submissions.title', 'ilike', "%{$search}%");
                });
            })
            ->select(
                'thesis_submissions.*',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'study_programs.name as study_program_name',
                'adv1.name as advisor_1_name',
                'adv2.name as advisor_2_name'
            )
            ->orderBy('thesis_submissions.id', 'desc')
            ->get();

        // 2. Tab Wisuda & Yudisium
        $yudisiumPeriods = DB::table('yudisium_periods')->orderBy('id', 'desc')->get();
        $yudisiumApplicants = DB::table('yudisium_applicants')
            ->join('users as students', 'yudisium_applicants.student_id', '=', 'students.id')
            ->join('yudisium_periods', 'yudisium_applicants.yudisium_period_id', '=', 'yudisium_periods.id')
            ->select(
                'yudisium_applicants.*',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'students.study_program',
                'yudisium_periods.name as period_name',
                'yudisium_periods.event_date as graduation_date'
            )
            ->orderBy('yudisium_applicants.id', 'desc')
            ->get();

        // 3. Tab SKL (Surat Keterangan Lulus)
        $sklLetters = DB::table('yudisium_applicants')
            ->join('users as students', 'yudisium_applicants.student_id', '=', 'students.id')
            ->where('yudisium_applicants.status', 'LULUS')
            ->select(
                'yudisium_applicants.*',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'students.study_program'
            )
            ->get();

        $stats = [
            'total_thesis' => $theses->count(),
            'thesis_passed' => $theses->where('status', 'LULUS')->count(),
            'total_yudisium' => $yudisiumApplicants->count(),
            'total_skl' => $sklLetters->count(),
        ];

        return Inertia::render('Admin/Graduations/Index', [
            'theses' => $theses,
            'yudisiumPeriods' => $yudisiumPeriods,
            'yudisiumApplicants' => $yudisiumApplicants,
            'sklLetters' => $sklLetters,
            'studyPrograms' => $studyPrograms,
            'lecturers' => $lecturers,
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'stats' => $stats,
            'currentTab' => $tab,
            'filters' => [
                'study_program' => $prodiFilter,
                'search' => $search,
                'tab' => $tab,
            ],
        ]);
    }

    /**
     * Simpan / Update Judul Skripsi
     */
    public function storeThesis(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'title' => 'required|string|max:500',
            'advisor_1_id' => 'nullable|exists:users,id',
            'advisor_2_id' => 'nullable|exists:users,id',
            'status' => 'nullable|string',
        ]);

        $student = User::find($request->student_id);
        $prodi = DB::table('study_programs')->where('name', 'ilike', "%{$student->study_program}%")->first();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        DB::table('thesis_submissions')->updateOrInsert(
            ['student_id' => $request->student_id],
            [
                'study_program_id' => $prodi?->id,
                'academic_period_id' => $activePeriod?->id ?? 1,
                'title' => $request->title,
                'abstract' => $request->abstract,
                'advisor_1_id' => $request->advisor_1_id,
                'advisor_2_id' => $request->advisor_2_id,
                'status' => $request->status ?: 'PENGAJUAN',
                'defense_date' => $request->defense_date,
                'defense_room' => $request->defense_room,
                'score' => $request->score,
                'grade_letter' => $request->grade_letter,
                'sk_number' => $request->sk_number,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        return back()->with('success', 'Data Tugas Akhir / Skripsi mahasiswa berhasil diperbarui.');
    }

    /**
     * Cetak Surat Keterangan Lulus (SKL) PDF
     */
    public function printSkl(Request $request, $id): HttpResponse
    {
        $applicant = DB::table('yudisium_applicants')
            ->join('users as students', 'yudisium_applicants.student_id', '=', 'students.id')
            ->where('yudisium_applicants.id', $id)
            ->select('yudisium_applicants.*', 'students.name as student_name', 'students.identity_number as student_nim', 'students.study_program')
            ->first();

        if (!$applicant) {
            abort(404, 'Data SKL tidak ditemukan.');
        }

        $signatory = DB::table('institutional_signatories')
            ->join('structural_positions', 'institutional_signatories.position_id', '=', 'structural_positions.id')
            ->where('structural_positions.code', 'KETUA')
            ->where('institutional_signatories.is_active', true)
            ->first();

        $html = view('pdf.skl', [
            'applicant' => $applicant,
            'signatory' => $signatory,
            'printDate' => now()->translatedFormat('d F Y'),
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }
}

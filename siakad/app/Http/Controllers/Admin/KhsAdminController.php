<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class KhsAdminController extends Controller
{
    /**
     * Tampilan Monitoring Kartu Hasil Studi (KHS) Mahasiswa
     */
    public function index(Request $request): Response|JsonResponse
    {
        $prodiFilter = $request->input('study_program');
        $yearFilter = $request->input('academic_year'); // e.g. 2025
        $periodFilter = $request->input('academic_period'); // period ID
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 20);

        // Master Data
        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        $batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

        $academicPeriods = DB::table('academic_periods')
            ->join('academic_years', 'academic_periods.academic_year_id', '=', 'academic_years.id')
            ->select('academic_periods.*', 'academic_years.code as year_code', 'academic_years.name as year_name')
            ->orderBy('academic_periods.id', 'desc')
            ->get();

        $activePeriod = $academicPeriods->firstWhere('is_active', true) ?? $academicPeriods->first();
        $selectedPeriodId = $periodFilter ? (int) $periodFilter : ($activePeriod?->id ?? 1);
        $currentPeriodObj = $academicPeriods->firstWhere('id', $selectedPeriodId) ?? $activePeriod;

        $selectedProdiObj = null;
        if ($prodiFilter) {
            $selectedProdiObj = $studyPrograms->first(function ($p) use ($prodiFilter) {
                return (string)$p->id === (string)$prodiFilter || $p->code === $prodiFilter || $p->name === $prodiFilter;
            });
        }

        $isSelectionComplete = !empty($selectedProdiObj) && !empty($yearFilter);

        $studentsData = null;
        $stats = [
            'total_students' => 0,
            'completed_khs' => 0,
            'avg_ips' => 0.0,
            'highest_ips' => 0.0,
        ];

        if ($isSelectionComplete) {
            $prefix2 = substr($yearFilter, -2);
            $prefix4 = substr($yearFilter, 0, 4);

            $students = User::where('role', 'mahasiswa')
                ->where(function ($sq) use ($selectedProdiObj) {
                    $sq->where('study_program', $selectedProdiObj->name)
                       ->orWhere('study_program', "{$selectedProdiObj->name} ({$selectedProdiObj->degree})")
                       ->orWhere('study_program', 'ilike', "%{$selectedProdiObj->name}%")
                       ->orWhere('study_program', 'ilike', "%{$selectedProdiObj->code}%");
                })
                ->where(function ($sq) use ($prefix2, $prefix4) {
                    $sq->where('identity_number', 'like', "{$prefix2}%")
                       ->orWhere('identity_number', 'like', "{$prefix4}%")
                       ->orWhereYear('created_at', $prefix4);
                })
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($sq) use ($search) {
                        $sq->where('name', 'ilike', "%{$search}%")
                           ->orWhere('identity_number', 'ilike', "%{$search}%");
                    });
                })
                ->select('id', 'name', 'identity_number as nim', 'study_program', 'academic_advisor_id')
                ->orderBy('identity_number', 'asc')
                ->get();

            $studentIds = $students->pluck('id')->toArray();

            // Ambil data KHS records
            $khsRecords = DB::table('khs_records')
                ->where('academic_period_id', $selectedPeriodId)
                ->whereIn('student_id', $studentIds)
                ->get()
                ->keyBy('student_id');

            // Ambil detail nilai semester per mahasiswa
            $grades = DB::table('course_grades')
                ->join('course_classes', 'course_grades.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->where('course_classes.academic_period_id', $selectedPeriodId)
                ->whereIn('course_grades.student_id', $studentIds)
                ->select(
                    'course_grades.*',
                    'courses.code as course_code',
                    'courses.name as course_name',
                    'courses.credits',
                    'course_classes.name as class_name'
                )
                ->get()
                ->groupBy('student_id');

            $allIps = [];
            $mergedList = $students->map(function ($stu) use ($khsRecords, $grades, $yearFilter) {
                $khs = $khsRecords->get($stu->id);
                $stuGrades = $grades->get($stu->id) ?? collect();

                $totalCredits = $stuGrades->sum('credits');
                $totalPoints = 0;
                $passedCredits = 0;

                foreach ($stuGrades as $g) {
                    $pt = (float)($g->grade_point ?? 0.0);
                    $cr = (float)($g->credits ?? 0.0);
                    $totalPoints += ($pt * $cr);
                    if ($pt >= 2.0) { // Grade C or higher considered passed
                        $passedCredits += $cr;
                    }
                }

                $calculatedIps = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : ($khs ? (float)$khs->gpa_semester : 0.0);

                return (object)[
                    'id' => $stu->id,
                    'nim' => $stu->nim,
                    'name' => $stu->name,
                    'study_program' => $stu->study_program,
                    'batch_year' => $yearFilter,
                    'khs_id' => $khs?->id ?? null,
                    'total_credits' => $totalCredits ?: ($khs ? (float)$khs->credits_taken : 0),
                    'passed_credits' => $passedCredits ?: ($khs ? (float)$khs->credits_passed : 0),
                    'ips' => $calculatedIps,
                    'grades_count' => $stuGrades->count(),
                    'grades' => $stuGrades,
                    'status' => $stuGrades->count() > 0 ? 'TERSEDIA' : 'BELUM_ADA_NILAI',
                ];
            });

            $stats['total_students'] = $students->count();
            $stats['completed_khs'] = $mergedList->where('status', 'TERSEDIA')->count();
            $availableIps = $mergedList->where('status', 'TERSEDIA')->pluck('ips')->filter();
            $stats['avg_ips'] = $availableIps->count() > 0 ? round($availableIps->avg(), 2) : 0.0;
            $stats['highest_ips'] = $availableIps->count() > 0 ? round($availableIps->max(), 2) : 0.0;

            // Pagination
            $page = (int) $request->input('page', 1);
            $totalCount = $mergedList->count();
            $offset = ($page - 1) * $perPage;
            $paginatedItems = $mergedList->slice($offset, $perPage)->values();

            $studentsData = [
                'data' => $paginatedItems,
                'total' => $totalCount,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => max(1, ceil($totalCount / $perPage)),
            ];
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'students' => $studentsData,
                'stats' => $stats,
                'isSelectionComplete' => $isSelectionComplete,
                'selectedProdiObj' => $selectedProdiObj,
                'currentPeriodObj' => $currentPeriodObj,
            ]);
        }

        return Inertia::render('Admin/Khs/Index', [
            'students' => $studentsData,
            'studyPrograms' => $studyPrograms,
            'batchYears' => $batchYears,
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'currentPeriodObj' => $currentPeriodObj,
            'selectedProdiObj' => $selectedProdiObj,
            'isSelectionComplete' => $isSelectionComplete,
            'stats' => $stats,
            'filters' => [
                'study_program' => $prodiFilter,
                'academic_year' => $yearFilter,
                'academic_period' => $selectedPeriodId,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Cetak Lembar KHS PDF
     */
    public function printPdf(Request $request, $studentId, $periodId): HttpResponse
    {
        $student = User::findOrFail($studentId);
        $period = DB::table('academic_periods')
            ->join('academic_years', 'academic_periods.academic_year_id', '=', 'academic_years.id')
            ->where('academic_periods.id', $periodId)
            ->select('academic_periods.*', 'academic_years.name as year_name')
            ->first();

        $advisor = User::find($student->academic_advisor_id);

        $grades = DB::table('course_grades')
            ->join('course_classes', 'course_grades.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('class_lecturers', 'class_lecturers.course_class_id', '=', 'course_classes.id')
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $periodId)
            ->where('course_grades.student_id', $studentId)
            ->select(
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'course_grades.grade_letter',
                'course_grades.grade_point',
                'course_grades.final_score',
                'course_classes.name as class_name',
                'lecturers.name as lecturer_name'
            )
            ->get();

        $totalCredits = $grades->sum('credits');
        $totalPoints = 0;
        foreach ($grades as $g) {
            $totalPoints += ((float)$g->grade_point * (float)$g->credits);
        }
        $ips = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.0;

        $signatory = DB::table('institutional_signatories')
            ->join('structural_positions', 'institutional_signatories.position_id', '=', 'structural_positions.id')
            ->where('structural_positions.code', 'WAKET_1')
            ->where('institutional_signatories.is_active', true)
            ->first();

        $html = view('pdf.khs', [
            'student' => $student,
            'period' => $period,
            'advisor' => $advisor,
            'grades' => $grades,
            'totalCredits' => $totalCredits,
            'totalPoints' => $totalPoints,
            'ips' => $ips,
            'signatory' => $signatory,
            'printDate' => now()->translatedFormat('d F Y'),
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }
}

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

class TranscriptAdminController extends Controller
{
    /**
     * Tampilan Transkrip Akademik Kumulatif Mahasiswa
     */
    public function index(Request $request): Response|JsonResponse
    {
        $prodiFilter = $request->input('study_program');
        $yearFilter = $request->input('academic_year');
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 20);

        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        $batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

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
            'eligible_grad' => 0,
            'avg_gpa' => 0.0,
            'highest_gpa' => 0.0,
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

            // Ambil seluruh histori nilai mahasiswa di seluruh semester
            $allGrades = DB::table('course_grades')
                ->join('course_classes', 'course_grades.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->whereIn('course_grades.student_id', $studentIds)
                ->select(
                    'course_grades.*',
                    'courses.code as course_code',
                    'courses.name as course_name',
                    'courses.credits',
                    'courses.semester_level'
                )
                ->get()
                ->groupBy('student_id');

            // Ambil predikat kelulusan
            $predicates = DB::table('graduation_predicates')->orderBy('min_ipk', 'desc')->get();

            $mergedList = $students->map(function ($stu) use ($allGrades, $predicates, $yearFilter) {
                $grades = $allGrades->get($stu->id) ?? collect();

                // Ambil nilai tertinggi per mata kuliah jika ada pengulangan
                $bestGrades = $grades->groupBy('course_code')->map(function ($group) {
                    return $group->sortByDesc('grade_point')->first();
                });

                $totalCredits = $bestGrades->sum('credits');
                $totalPoints = 0;
                $passedCredits = 0;

                foreach ($bestGrades as $g) {
                    $pt = (float)($g->grade_point ?? 0.0);
                    $cr = (float)($g->credits ?? 0.0);
                    $totalPoints += ($pt * $cr);
                    if ($pt >= 2.0) {
                        $passedCredits += $cr;
                    }
                }

                $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.0;

                // Hitung predikat
                $predicateName = 'Memuaskan';
                foreach ($predicates as $pred) {
                    if ($gpa >= (float)$pred->min_ipk && $gpa <= (float)$pred->max_ipk) {
                        $predicateName = $pred->name;
                        break;
                    }
                }

                $isEligible = $passedCredits >= 144; // Standar S1

                return (object)[
                    'id' => $stu->id,
                    'nim' => $stu->nim,
                    'name' => $stu->name,
                    'study_program' => $stu->study_program,
                    'batch_year' => $yearFilter,
                    'total_credits_taken' => $totalCredits,
                    'total_credits_passed' => $passedCredits,
                    'gpa' => $gpa,
                    'predicate' => $predicateName,
                    'courses_count' => $bestGrades->count(),
                    'is_eligible_graduation' => $isEligible,
                    'status' => $totalCredits > 0 ? 'AKTIF' : 'BELUM_ADA_NILAI',
                ];
            });

            $stats['total_students'] = $students->count();
            $stats['eligible_grad'] = $mergedList->where('is_eligible_graduation', true)->count();
            $availableGpa = $mergedList->where('total_credits_taken', '>', 0)->pluck('gpa')->filter();
            $stats['avg_gpa'] = $availableGpa->count() > 0 ? round($availableGpa->avg(), 2) : 0.0;
            $stats['highest_gpa'] = $availableGpa->count() > 0 ? round($availableGpa->max(), 2) : 0.0;

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
            ]);
        }

        return Inertia::render('Admin/Transcripts/Index', [
            'students' => $studentsData,
            'studyPrograms' => $studyPrograms,
            'batchYears' => $batchYears,
            'selectedProdiObj' => $selectedProdiObj,
            'isSelectionComplete' => $isSelectionComplete,
            'stats' => $stats,
            'filters' => [
                'study_program' => $prodiFilter,
                'academic_year' => $yearFilter,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Cetak Transkrip Nilai PDF Resmi Ber-QR Code
     */
    public function printPdf(Request $request, $studentId): HttpResponse
    {
        $student = User::findOrFail($studentId);
        $studyProgram = DB::table('study_programs')->where('name', 'ilike', "%{$student->study_program}%")->first();
        $degree = DB::table('study_program_degrees')->where('study_program_id', $studyProgram?->id ?? 1)->first();

        $allGrades = DB::table('course_grades')
            ->join('course_classes', 'course_grades.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('course_grades.student_id', $studentId)
            ->select(
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'course_grades.grade_letter',
                'course_grades.grade_point'
            )
            ->get();

        $bestGrades = $allGrades->groupBy('course_code')->map(fn($g) => $g->sortByDesc('grade_point')->first())->values();

        $totalCredits = $bestGrades->sum('credits');
        $totalPoints = 0;
        foreach ($bestGrades as $g) {
            $totalPoints += ((float)$g->grade_point * (float)$g->credits);
        }
        $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.0;

        $predicates = DB::table('graduation_predicates')->orderBy('min_ipk', 'desc')->get();
        $predicateName = 'Memuaskan';
        foreach ($predicates as $pred) {
            if ($gpa >= (float)$pred->min_ipk && $gpa <= (float)$pred->max_ipk) {
                $predicateName = $pred->name;
                break;
            }
        }

        $signatory = DB::table('institutional_signatories')
            ->join('structural_positions', 'institutional_signatories.position_id', '=', 'structural_positions.id')
            ->where('structural_positions.code', 'KETUA')
            ->where('institutional_signatories.is_active', true)
            ->first();

        $html = view('pdf.transcript', [
            'student' => $student,
            'studyProgram' => $studyProgram,
            'degree' => $degree,
            'grades' => $bestGrades,
            'totalCredits' => $totalCredits,
            'totalPoints' => $totalPoints,
            'gpa' => $gpa,
            'predicate' => $predicateName,
            'signatory' => $signatory,
            'printDate' => now()->translatedFormat('d F Y'),
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }
}

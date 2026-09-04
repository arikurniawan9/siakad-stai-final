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

class GradeAdminController extends Controller
{
    /**
     * Tampilan Modul Penilaian (3 Sub-tab: Persentase Nilai, Per Kelas, Per Mahasiswa)
     */
    public function index(Request $request): Response|JsonResponse
    {
        $tab = $request->input('tab', 'class'); // percentage | class | student
        $search = $request->input('search');
        $prodiFilter = $request->input('study_program');
        $yearFilter = $request->input('academic_year');

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $selectedPeriodId = $request->input('period_id', $activePeriod?->id ?? 1);

        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        $batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

        // 1. Tab 1: Persentase Nilai (Bobot Nilai)
        $gradeWeights = DB::table('grade_weights')->orderBy('id', 'asc')->get();

        // 2. Tab 2: Per Kelas
        $classes = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $selectedPeriodId)
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('courses.name', 'ilike', "%{$search}%")
                       ->orWhere('courses.code', 'ilike', "%{$search}%")
                       ->orWhere('course_classes.name', 'ilike', "%{$search}%");
                });
            })
            ->select(
                'course_classes.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'lecturers.name as lecturer_name'
            )
            ->get();

        $classesWithStats = $classes->map(function ($cls) {
            $enrollmentCount = DB::table('class_enrollments')
                ->where('course_class_id', $cls->id)
                ->count();

            $grades = DB::table('course_grades')
                ->where('course_class_id', $cls->id)
                ->get();

            $avgScore = $grades->avg('final_score') ?? 0;
            $isLocked = $grades->where('is_locked', true)->count() > 0;

            $cls->enrolled_count = $enrollmentCount;
            $cls->grades_count = count($grades);
            $cls->avg_score = round($avgScore, 2);
            $cls->is_locked = $isLocked;

            return $cls;
        });

        // 3. Tab 3: Per Mahasiswa
        $studentsList = [];
        if ($tab === 'student' && $prodiFilter && $yearFilter) {
            $prefix2 = substr($yearFilter, -2);
            $prefix4 = substr($yearFilter, 0, 4);

            $students = User::where('role', 'mahasiswa')
                ->where('study_program', 'ilike', "%{$prodiFilter}%")
                ->where(function ($sq) use ($prefix2, $prefix4) {
                    $sq->where('identity_number', 'like', "{$prefix2}%")
                       ->orWhere('identity_number', 'like', "{$prefix4}%")
                       ->orWhereYear('created_at', $prefix4);
                })
                ->when($search, fn($q) => $q->where('name', 'ilike', "%{$search}%")->orWhere('identity_number', 'ilike', "%{$search}%"))
                ->select('id', 'name', 'identity_number as nim', 'study_program')
                ->get();

            $studentIds = $students->pluck('id')->toArray();
            $studentGrades = DB::table('course_grades')
                ->join('course_classes', 'course_grades.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->whereIn('course_grades.student_id', $studentIds)
                ->select('course_grades.*', 'courses.name as course_name', 'courses.code as course_code', 'courses.credits')
                ->get()
                ->groupBy('student_id');

            $studentsList = $students->map(function ($s) use ($studentGrades) {
                $gr = $studentGrades->get($s->id) ?? collect();
                $s->grades_count = $gr->count();
                $s->avg_final_score = round($gr->avg('final_score') ?? 0, 2);
                $s->grades = $gr;
                return $s;
            });
        }

        $stats = [
            'total_classes' => $classesWithStats->count(),
            'locked_classes' => $classesWithStats->where('is_locked', true)->count(),
            'open_classes' => $classesWithStats->where('is_locked', false)->count(),
            'total_components' => $gradeWeights->count(),
        ];

        return Inertia::render('Admin/Grades/Index', [
            'activePeriod' => $activePeriod,
            'classes' => $classesWithStats,
            'gradeWeights' => $gradeWeights,
            'studentsList' => $studentsList,
            'studyPrograms' => $studyPrograms,
            'batchYears' => $batchYears,
            'stats' => $stats,
            'currentTab' => $tab,
            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'study_program' => $prodiFilter,
                'academic_year' => $yearFilter,
            ],
        ]);
    }

    /**
     * Tampilan Detail Lembar Nilai (Gradebook Sheet) Kelas
     */
    public function show(int $classId): Response
    {
        $class = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->join('academic_periods', 'course_classes.academic_period_id', '=', 'academic_periods.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.id', $classId)
            ->select(
                'course_classes.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'academic_periods.name as period_name',
                'lecturers.name as lecturer_name',
                'lecturers.identity_number as lecturer_nidn'
            )
            ->first();

        if (!$class) {
            abort(404);
        }

        $enrollments = DB::table('class_enrollments')
            ->join('users as students', 'class_enrollments.student_id', '=', 'students.id')
            ->where('class_enrollments.course_class_id', $classId)
            ->select(
                'students.id as student_id',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'class_enrollments.status as enrollment_status'
            )
            ->orderBy('students.identity_number')
            ->get();

        $studentIds = $enrollments->pluck('student_id')->toArray();
        $grades = DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        $studentsWithGrades = $enrollments->map(function ($stu) use ($grades) {
            $g = $grades->get($stu->student_id);
            $stu->attendance_score = $g?->attendance_score ?? 0;
            $stu->assignment_score = $g?->assignment_score ?? 0;
            $stu->quiz_score = $g?->quiz_score ?? 0;
            $stu->mid_exam_score = $g?->mid_exam_score ?? 0;
            $stu->final_exam_score = $g?->final_exam_score ?? 0;
            $stu->final_score = $g?->final_score ?? 0;
            $stu->grade_letter = $g?->grade_letter ?? '-';
            $stu->grade_point = $g?->grade_point ?? 0.0;
            $stu->is_locked = (bool)($g?->is_locked ?? false);
            return $stu;
        });

        $gradeWeights = DB::table('grade_weights')->get();
        $isClassLocked = $studentsWithGrades->where('is_locked', true)->count() > 0;

        return Inertia::render('Admin/Grades/Show', [
            'classInfo' => $class,
            'students' => $studentsWithGrades,
            'gradeWeights' => $gradeWeights,
            'isLocked' => $isClassLocked,
        ]);
    }

    /**
     * Simpan Perubahan Nilai Mahasiswa Sekelas
     */
    public function updateGrades(Request $request, int $classId): RedirectResponse
    {
        $gradesData = $request->input('grades', []);

        DB::transaction(function () use ($classId, $gradesData) {
            foreach ($gradesData as $g) {
                DB::table('course_grades')->updateOrInsert(
                    [
                        'course_class_id' => $classId,
                        'student_id' => $g['student_id'],
                    ],
                    [
                        'attendance_score' => $g['attendance_score'] ?? 0,
                        'assignment_score' => $g['assignment_score'] ?? 0,
                        'quiz_score' => $g['quiz_score'] ?? 0,
                        'mid_exam_score' => $g['mid_exam_score'] ?? 0,
                        'final_exam_score' => $g['final_exam_score'] ?? 0,
                        'final_score' => $g['final_score'] ?? 0,
                        'grade_letter' => $g['grade_letter'] ?? 'E',
                        'grade_point' => $g['grade_point'] ?? 0.0,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        });

        return back()->with('success', 'Nilai mahasiswa sekelas berhasil disimpan & disinkronkan ke KHS.');
    }

    /**
     * Kunci / Buka Lembar Nilai (Grade Lock)
     */
    public function toggleLock(Request $request, int $classId): RedirectResponse
    {
        $currentLock = DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->where('is_locked', true)
            ->exists();

        $newLock = !$currentLock;

        DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->update([
                'is_locked' => $newLock,
                'locked_at' => $newLock ? now() : null,
                'updated_at' => now(),
            ]);

        $msg = $newLock ? 'Lembar Nilai DPNA berhasil DIKUNCI (Grade Lock Aktif).' : 'Kunci Lembar Nilai DIBUKA kembali untuk revisi dosen.';
        return back()->with('success', $msg);
    }
}

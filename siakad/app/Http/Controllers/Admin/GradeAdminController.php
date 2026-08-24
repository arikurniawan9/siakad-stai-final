<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GradeAdminController extends Controller
{
    /**
     * Tampilan Daftar Kelas & Monitoring Gradebook
     */
    public function index(Request $request): Response
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $selectedPeriodId = $request->input('period_id', $activePeriod?->id ?? 1);

        $classes = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $selectedPeriodId)
            ->select(
                'course_classes.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'lecturers.name as lecturer_name'
            )
            ->get();

        // Hitung statistik per kelas (jumlah mahasiswa, rata-rata nilai, status lock)
        $classesWithStats = $classes->map(function ($cls) {
            $enrollmentCount = DB::table('class_enrollments')
                ->where('course_class_id', $cls->id)
                ->count();

            $grades = DB::table('course_grades')
                ->join('krs_items', 'course_grades.krs_item_id', '=', 'krs_items.id')
                ->where('krs_items.course_class_id', $cls->id)
                ->get();

            $avgScore = $grades->avg('final_score') ?? 0;
            $isLocked = $grades->where('is_locked', true)->count() > 0;

            $cls->enrolled_count = $enrollmentCount;
            $cls->grades_count = count($grades);
            $cls->avg_score = round($avgScore, 2);
            $cls->is_locked = $isLocked;

            return $cls;
        });

        return Inertia::render('Admin/Grades/Index', [
            'activePeriod' => $activePeriod,
            'classes' => $classesWithStats,
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

        // Ambil mahasiswa terdaftar & nilainya
        $enrollments = DB::table('class_enrollments')
            ->join('users as students', 'class_enrollments.student_id', '=', 'students.id')
            ->leftJoin('krs_items', function ($j) use ($classId) {
                $j->on('class_enrollments.course_class_id', '=', 'krs_items.course_class_id');
            })
            ->leftJoin('course_grades', 'krs_items.id', '=', 'course_grades.krs_item_id')
            ->where('class_enrollments.course_class_id', $classId)
            ->select(
                'students.id as student_id',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'krs_items.id as krs_item_id',
                'course_grades.id as grade_id',
                'course_grades.attendance_score',
                'course_grades.assignment_score',
                'course_grades.quiz_score',
                'course_grades.mid_exam_score',
                'course_grades.final_exam_score',
                'course_grades.final_score',
                'course_grades.grade_letter',
                'course_grades.grade_point',
                'course_grades.is_locked'
            )
            ->distinct()
            ->orderBy('students.name', 'asc')
            ->get();

        // Distribusi Nilai
        $distribution = [
            'A' => $enrollments->where('grade_letter', 'A')->count(),
            'A-' => $enrollments->where('grade_letter', 'A-')->count(),
            'B+' => $enrollments->where('grade_letter', 'B+')->count(),
            'B' => $enrollments->where('grade_letter', 'B')->count(),
            'C+' => $enrollments->where('grade_letter', 'C+')->count(),
            'C' => $enrollments->where('grade_letter', 'C')->count(),
            'D' => $enrollments->where('grade_letter', 'D')->count(),
            'E' => $enrollments->where('grade_letter', 'E')->count(),
        ];

        $isClassLocked = $enrollments->where('is_locked', true)->count() > 0;

        return Inertia::render('Admin/Grades/Show', [
            'courseClass' => $class,
            'students' => $enrollments,
            'distribution' => $distribution,
            'isLocked' => $isClassLocked,
        ]);
    }

    /**
     * Simpan / Perbarui Nilai Mahasiswa Kelas Ini
     */
    public function updateGrades(Request $request, int $classId): RedirectResponse
    {
        $gradesData = $request->input('grades', []);

        DB::transaction(function () use ($gradesData, $classId) {
            foreach ($gradesData as $g) {
                if (empty($g['krs_item_id'])) continue;

                $attendance = floatval($g['attendance_score'] ?? 0);
                $assignment = floatval($g['assignment_score'] ?? 0);
                $quiz = floatval($g['quiz_score'] ?? 0);
                $mid = floatval($g['mid_exam_score'] ?? 0);
                $final = floatval($g['final_exam_score'] ?? 0);

                // Formula 10% Attendance + 20% Assignment + 15% Quiz + 25% Mid + 30% Final
                $finalScore = round(($attendance * 0.10) + ($assignment * 0.20) + ($quiz * 0.15) + ($mid * 0.25) + ($final * 0.30), 2);

                $letter = 'E';
                $point = 0.00;
                if ($finalScore >= 90) { $letter = 'A'; $point = 4.00; }
                elseif ($finalScore >= 85) { $letter = 'A-'; $point = 3.75; }
                elseif ($finalScore >= 80) { $letter = 'B+'; $point = 3.50; }
                elseif ($finalScore >= 75) { $letter = 'B'; $point = 3.00; }
                elseif ($finalScore >= 70) { $letter = 'C+'; $point = 2.50; }
                elseif ($finalScore >= 65) { $letter = 'C'; $point = 2.00; }
                elseif ($finalScore >= 60) { $letter = 'D'; $point = 1.00; }

                DB::table('course_grades')->updateOrInsert(
                    ['krs_item_id' => $g['krs_item_id']],
                    [
                        'attendance_score' => $attendance,
                        'assignment_score' => $assignment,
                        'quiz_score' => $quiz,
                        'mid_exam_score' => $mid,
                        'final_exam_score' => $final,
                        'final_score' => $finalScore,
                        'grade_letter' => $letter,
                        'grade_point' => $point,
                        'updated_at' => now(),
                    ]
                );
            }
        });

        return back()->with('success', 'Rekapitulasi nilai kelas berhasil dikalkulasi dan disimpan.');
    }

    /**
     * Kunci / Buka Lembar Nilai (Grade Lock)
     */
    public function toggleLock(int $classId): RedirectResponse
    {
        $krsItemIds = DB::table('krs_items')
            ->where('course_class_id', $classId)
            ->pluck('id');

        $currentLocked = DB::table('course_grades')
            ->whereIn('krs_item_id', $krsItemIds)
            ->value('is_locked') ?? false;

        $newLockedState = !$currentLocked;

        DB::table('course_grades')
            ->whereIn('krs_item_id', $krsItemIds)
            ->update(['is_locked' => $newLockedState]);

        $statusText = $newLockedState ? 'DIKUNCI (Tidak dapat diedit)' : 'DIBUKA (Dapat diedit)';
        return back()->with('success', "Status pengisian nilai kelas berhasil {$statusText}.");
    }
}

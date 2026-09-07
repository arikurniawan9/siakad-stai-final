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
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class GradeAdminController extends Controller
{
    /**
     * Tampilan Modul Penilaian (3 Sub-tab: Persentase Nilai, Per Kelas, Per Mahasiswa)
     * Disesuaikan otomatis dengan peran pengguna (Dosen Pengampu, Dosen PA, Kaprodi, BAAK, Superadmin)
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = auth()->user();
        $role = $user ? $user->role : 'dosen';

        $tab = $request->input('tab', 'class'); // percentage | class | student
        $search = $request->input('search');
        $prodiFilter = $request->input('study_program');
        $yearFilter = $request->input('academic_year');
        $lecturerFilter = $request->input('lecturer_id');

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $selectedPeriodId = $request->input('period_id', $activePeriod?->id ?? 1);

        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        $batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

        // 1. Tab 1: Persentase Nilai (Bobot Nilai Standar)
        $gradeWeights = DB::table('grade_weights')->orderBy('id', 'asc')->get();

        // 2. Tab 2: Per Kelas (Filtered by Lecturer if user is Dosen / Dosen PA)
        $classesQuery = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->join('academic_periods', 'course_classes.academic_period_id', '=', 'academic_periods.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $selectedPeriodId);

        // FILTER PERAN DOSEN: Jika role adalah Dosen atau Dosen PA, HANYA tampilkan kelas yang diampu dosen ini!
        $isLecturerRole = in_array($role, ['dosen', 'dosen_pa']);
        if ($isLecturerRole) {
            $classesQuery->whereExists(function ($query) use ($user) {
                $query->select(DB::raw(1))
                      ->from('class_lecturers')
                      ->whereColumn('class_lecturers.course_class_id', 'course_classes.id')
                      ->where('class_lecturers.lecturer_id', $user->id);
            });
        } elseif ($role === 'kaprodi') {
            // Kaprodi dapat melihat kelas prodi mereka, atau filter kelas yang mereka ampu
            if ($request->input('only_my_classes') === '1') {
                $classesQuery->whereExists(function ($query) use ($user) {
                    $query->select(DB::raw(1))
                          ->from('class_lecturers')
                          ->whereColumn('class_lecturers.course_class_id', 'course_classes.id')
                          ->where('class_lecturers.lecturer_id', $user->id);
                });
            } elseif ($user->study_program) {
                // Filter berdasarkan program studi Kaprodi jika ada
                $classesQuery->where(function ($q) use ($user) {
                    $q->where('study_programs.name', 'ilike', "%{$user->study_program}%")
                      ->orWhereNull('courses.study_program_id');
                });
            }
        } else {
            // Superadmin & Admin Akademik dapat filter berdasarkan dosen tertentu
            if ($lecturerFilter) {
                $classesQuery->whereExists(function ($query) use ($lecturerFilter) {
                    $query->select(DB::raw(1))
                          ->from('class_lecturers')
                          ->whereColumn('class_lecturers.course_class_id', 'course_classes.id')
                          ->where('class_lecturers.lecturer_id', $lecturerFilter);
                });
            }
            if ($prodiFilter) {
                $classesQuery->where('study_programs.name', 'ilike', "%{$prodiFilter}%");
            }
        }

        if ($search) {
            $classesQuery->where(function ($sq) use ($search) {
                $sq->where('courses.name', 'ilike', "%{$search}%")
                   ->orWhere('courses.code', 'ilike', "%{$search}%")
                   ->orWhere('course_classes.name', 'ilike', "%{$search}%")
                   ->orWhere('lecturers.name', 'ilike', "%{$search}%");
            });
        }

        $classes = $classesQuery->select(
            'course_classes.*',
            'courses.code as course_code',
            'courses.name as course_name',
            'courses.credits',
            'courses.semester_level',
            'study_programs.name as course_study_program',
            'academic_periods.name as period_name',
            'lecturers.name as lecturer_name',
            'lecturers.identity_number as lecturer_nidn'
        )->orderBy('courses.code', 'asc')->get();

        $classesWithStats = $classes->map(function ($cls) {
            $enrollmentCount = DB::table('class_enrollments')
                ->where('course_class_id', $cls->id)
                ->count();

            $grades = DB::table('course_grades')
                ->where('course_class_id', $cls->id)
                ->get();

            $avgScore = $grades->avg('final_score') ?? 0;
            $isLocked = $grades->where('is_locked', true)->count() > 0;
            $gradedCount = $grades->where('final_score', '>', 0)->count();

            $cls->enrolled_count = $enrollmentCount;
            $cls->grades_count = count($grades);
            $cls->graded_count = $gradedCount;
            $cls->avg_score = round($avgScore, 2);
            $cls->is_locked = $isLocked;
            $cls->is_completed = ($enrollmentCount > 0 && $gradedCount >= $enrollmentCount);

            return $cls;
        });

        // 3. Tab 3: Per Mahasiswa
        $studentsList = [];
        if ($tab === 'student' && ($prodiFilter || $isLecturerRole)) {
            $studentsQuery = User::where('role', 'mahasiswa');

            if ($isLecturerRole) {
                // Untuk dosen: tampilkan mahasiswa yang mengambil kelas dosen ini
                $classIds = $classesWithStats->pluck('id')->toArray();
                $enrolledStudentIds = DB::table('class_enrollments')
                    ->whereIn('course_class_id', $classIds)
                    ->pluck('student_id')
                    ->unique()
                    ->toArray();

                $studentsQuery->whereIn('id', $enrolledStudentIds);
            } else {
                if ($prodiFilter) {
                    $studentsQuery->where('study_program', 'ilike', "%{$prodiFilter}%");
                }
                if ($yearFilter) {
                    $prefix2 = substr($yearFilter, -2);
                    $prefix4 = substr($yearFilter, 0, 4);
                    $studentsQuery->where(function ($sq) use ($prefix2, $prefix4) {
                        $sq->where('identity_number', 'like', "{$prefix2}%")
                           ->orWhere('identity_number', 'like', "{$prefix4}%")
                           ->orWhereYear('created_at', $prefix4);
                    });
                }
            }

            if ($search) {
                $studentsQuery->where(function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%")
                      ->orWhere('identity_number', 'ilike', "%{$search}%");
                });
            }

            $students = $studentsQuery->select('id', 'name', 'identity_number as nim', 'study_program')->get();
            $studentIds = $students->pluck('id')->toArray();

            $studentGradesQuery = DB::table('course_grades')
                ->join('course_classes', 'course_grades.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->whereIn('course_grades.student_id', $studentIds);

            if ($isLecturerRole) {
                $studentGradesQuery->whereIn('course_classes.id', $classesWithStats->pluck('id')->toArray());
            }

            $studentGrades = $studentGradesQuery
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

        // Daftar Dosen untuk Filter Admin
        $allLecturers = [];
        if (!$isLecturerRole) {
            $allLecturers = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
                ->select('id', 'name', 'identity_number')
                ->orderBy('name', 'asc')
                ->get();
        }

        $stats = [
            'total_classes' => $classesWithStats->count(),
            'locked_classes' => $classesWithStats->where('is_locked', true)->count(),
            'open_classes' => $classesWithStats->where('is_locked', false)->count(),
            'completed_classes' => $classesWithStats->where('is_completed', true)->count(),
            'total_components' => $gradeWeights->count(),
            'total_students' => $classesWithStats->sum('enrolled_count'),
        ];

        return Inertia::render('Admin/Grades/Index', [
            'activePeriod' => $activePeriod,
            'classes' => $classesWithStats,
            'gradeWeights' => $gradeWeights,
            'studentsList' => $studentsList,
            'studyPrograms' => $studyPrograms,
            'batchYears' => $batchYears,
            'allLecturers' => $allLecturers,
            'stats' => $stats,
            'currentTab' => $tab,
            'userRole' => $role,
            'lecturerInfo' => [
                'id' => $user->id,
                'name' => $user->name,
                'identity_number' => $user->identity_number,
                'study_program' => $user->study_program,
            ],
            'filters' => [
                'tab' => $tab,
                'search' => $search,
                'study_program' => $prodiFilter,
                'academic_year' => $yearFilter,
                'lecturer_id' => $lecturerFilter,
                'only_my_classes' => $request->input('only_my_classes', '0'),
            ],
        ]);
    }

    /**
     * Tampilan Detail Lembar Nilai (Gradebook Sheet DPNA) Kelas
     */
    public function show(int $classId): Response|RedirectResponse
    {
        $user = auth()->user();
        $role = $user ? $user->role : 'dosen';

        // Otorisasi Dosen: Jika peran dosen/dosen_pa, pastikan yang bersangkutan adalah dosen pengampu kelas ini!
        if (in_array($role, ['dosen', 'dosen_pa'])) {
            $isAssigned = DB::table('class_lecturers')
                ->where('course_class_id', $classId)
                ->where('lecturer_id', $user->id)
                ->exists();

            if (!$isAssigned) {
                return redirect()->route('grades.index')->with('error', 'Akses ditolak. Anda bukan dosen pengampu untuk kelas ini.');
            }
        }

        $class = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->join('academic_periods', 'course_classes.academic_period_id', '=', 'academic_periods.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->leftJoin('class_schedules', 'course_classes.id', '=', 'class_schedules.course_class_id')
            ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
            ->where('course_classes.id', $classId)
            ->select(
                'course_classes.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'study_programs.name as study_program',
                'academic_periods.name as period_name',
                'lecturers.name as lecturer_name',
                'lecturers.identity_number as lecturer_nidn',
                'rooms.name as room_name'
            )
            ->first();

        if (!$class) {
            abort(404, 'Kelas perkuliahan tidak ditemukan.');
        }

        // Ambil mahasiswa yang terdaftar di kelas ini
        $enrollments = DB::table('class_enrollments')
            ->join('users as students', 'class_enrollments.student_id', '=', 'students.id')
            ->where('class_enrollments.course_class_id', $classId)
            ->select(
                'students.id as student_id',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'class_enrollments.status as enrollment_status'
            )
            ->orderBy('students.identity_number', 'asc')
            ->get();

        $studentIds = $enrollments->pluck('student_id')->toArray();
        $grades = DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        $studentsWithGrades = $enrollments->map(function ($stu) use ($grades) {
            $g = $grades->get($stu->student_id);
            $stu->attendance_score = (float)($g?->attendance_score ?? 0);
            $stu->assignment_score = (float)($g?->assignment_score ?? 0);
            $stu->quiz_score = (float)($g?->quiz_score ?? 0);
            $stu->mid_exam_score = (float)($g?->mid_exam_score ?? 0);
            $stu->final_exam_score = (float)($g?->final_exam_score ?? 0);
            $stu->final_score = (float)($g?->final_score ?? 0);
            $stu->grade_letter = $g?->grade_letter ?? '-';
            $stu->grade_point = (float)($g?->grade_point ?? 0.0);
            $stu->is_locked = (bool)($g?->is_locked ?? false);
            return $stu;
        });

        $gradeWeights = DB::table('grade_weights')->orderBy('id', 'asc')->get();
        $isClassLocked = $studentsWithGrades->where('is_locked', true)->count() > 0;

        // Hitung distribusi nilai
        $distribution = [
            'A' => 0, 'A-' => 0, 'B+' => 0, 'B' => 0,
            'B-' => 0, 'C+' => 0, 'C' => 0, 'D' => 0, 'E' => 0
        ];
        foreach ($studentsWithGrades as $s) {
            if (isset($distribution[$s->grade_letter])) {
                $distribution[$s->grade_letter]++;
            }
        }

        $avgFinalScore = $studentsWithGrades->avg('final_score') ?? 0;

        return Inertia::render('Admin/Grades/Show', [
            'courseClass' => $class,
            'students' => $studentsWithGrades,
            'gradeWeights' => $gradeWeights,
            'isLocked' => $isClassLocked,
            'distribution' => $distribution,
            'avgScore' => round($avgFinalScore, 2),
            'userRole' => $role,
        ]);
    }

    /**
     * Simpan Perubahan Nilai Mahasiswa Sekelas
     */
    public function updateGrades(Request $request, int $classId): RedirectResponse|JsonResponse
    {
        $user = auth()->user();
        $role = $user ? $user->role : 'dosen';

        // Otorisasi Dosen
        if (in_array($role, ['dosen', 'dosen_pa'])) {
            $isAssigned = DB::table('class_lecturers')
                ->where('course_class_id', $classId)
                ->where('lecturer_id', $user->id)
                ->exists();

            if (!$isAssigned) {
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => 'Anda bukan dosen pengampu untuk kelas ini.'], 403);
                }
                return back()->with('error', 'Akses ditolak. Anda bukan dosen pengampu untuk kelas ini.');
            }
        }

        // Cek apakah nilai kelas sedang terkunci
        $isLocked = DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->where('is_locked', true)
            ->exists();

        if ($isLocked && !in_array($role, ['superadmin', 'admin_akademik'])) {
            $msg = 'Lembar nilai DPNA sedang terkunci (Grade Lock). Hubungi BAAK untuk membuka kunci.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msg], 422);
            }
            return back()->with('error', $msg);
        }

        $gradesData = $request->input('grades', []);

        DB::transaction(function () use ($classId, $gradesData) {
            foreach ($gradesData as $g) {
                $studentId = $g['student_id'] ?? null;
                if (!$studentId) continue;

                $att = (float)($g['attendance_score'] ?? 0);
                $asg = (float)($g['assignment_score'] ?? 0);
                $quiz = (float)($g['quiz_score'] ?? 0);
                $mid = (float)($g['mid_exam_score'] ?? 0);
                $final = (float)($g['final_exam_score'] ?? 0);

                // Hitung Nilai Akhir dengan bobot standar STAI Al-Ittihad (10/20/15/25/30)
                $finalScore = round(($att * 0.10) + ($asg * 0.20) + ($quiz * 0.15) + ($mid * 0.25) + ($final * 0.30), 2);

                $letter = 'E';
                $point = 0.00;
                if ($finalScore >= 85) { $letter = 'A'; $point = 4.00; }
                elseif ($finalScore >= 80) { $letter = 'A-'; $point = 3.75; }
                elseif ($finalScore >= 75) { $letter = 'B+'; $point = 3.50; }
                elseif ($finalScore >= 70) { $letter = 'B'; $point = 3.00; }
                elseif ($finalScore >= 65) { $letter = 'B-'; $point = 2.75; }
                elseif ($finalScore >= 60) { $letter = 'C+'; $point = 2.50; }
                elseif ($finalScore >= 55) { $letter = 'C'; $point = 2.00; }
                elseif ($finalScore >= 45) { $letter = 'D'; $point = 1.00; }

                // Hubungkan dengan krs_items jika ada
                $krsItem = DB::table('krs_items')
                    ->join('krs_submissions', 'krs_items.krs_submission_id', '=', 'krs_submissions.id')
                    ->where('krs_items.course_class_id', $classId)
                    ->where('krs_submissions.student_id', $studentId)
                    ->select('krs_items.id')
                    ->first();

                DB::table('course_grades')->updateOrInsert(
                    [
                        'course_class_id' => $classId,
                        'student_id' => $studentId,
                    ],
                    [
                        'krs_item_id' => $krsItem?->id,
                        'attendance_score' => $att,
                        'assignment_score' => $asg,
                        'quiz_score' => $quiz,
                        'mid_exam_score' => $mid,
                        'final_exam_score' => $final,
                        'final_score' => $finalScore,
                        'grade_letter' => $letter,
                        'grade_point' => $point,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        });

        // Rekam Audit Trail
        try {
            DB::table('audit_logs')->insert([
                'user_id' => $user->id,
                'action' => "UPDATE_GRADES_CLASS_{$classId}",
                'target_entity' => 'course_grades',
                'ip_address' => $request->ip() ?? '127.0.0.1',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Nilai mahasiswa sekelas berhasil disimpan & disinkronkan ke KHS.'
            ]);
        }

        return back()->with('success', 'Nilai mahasiswa sekelas berhasil disimpan & disinkronkan ke KHS.');
    }

    /**
     * Kunci / Buka Lembar Nilai (Grade Lock DPNA)
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

    /**
     * Ekspor Nilai Kelas ke Format Microsoft Excel (.xls) dengan KOP Resmi
     */
    public function exportExcel(Request $request, int $classId): StreamedResponse
    {
        $class = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
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
                'study_programs.name as study_program',
                'academic_periods.name as period_name',
                'lecturers.name as lecturer_name',
                'lecturers.identity_number as lecturer_nidn'
            )
            ->first();

        if (!$class) abort(404);

        $enrollments = DB::table('class_enrollments')
            ->join('users as students', 'class_enrollments.student_id', '=', 'students.id')
            ->where('class_enrollments.course_class_id', $classId)
            ->select(
                'students.id as student_id',
                'students.name as student_name',
                'students.identity_number as student_nim'
            )
            ->orderBy('students.identity_number', 'asc')
            ->get();

        $studentIds = $enrollments->pluck('student_id')->toArray();
        $grades = DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        $cleanCode = preg_replace('/[^A-Za-z0-9]/', '_', $class->course_code);
        $cleanClass = preg_replace('/[^A-Za-z0-9]/', '_', $class->name);
        $filename = "DPNA_{$cleanCode}_{$cleanClass}_" . date('Ymd_His') . ".xls";

        return new StreamedResponse(function () use ($class, $enrollments, $grades) {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
            echo '<style>
                body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; }
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #047857; padding: 8px 6px; text-align: center; font-size: 11px; }
                td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: middle; font-size: 11px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-mono { font-family: "Consolas", monospace; mso-number-format:"\@"; }
                .header-title { font-size: 14px; font-weight: 900; color: #065f46; text-align: center; }
                .header-sub { font-size: 12px; font-weight: bold; text-align: center; }
                .meta-label { font-weight: bold; background-color: #f3f4f6; }
                .score-col { background-color: #f9fafb; font-weight: bold; }
                .lulus { color: #065f46; font-weight: bold; }
                .tidur { color: #991b1b; font-weight: bold; }
            </style></head><body>';

            echo '<table>';
            echo '<tr><td colspan="12" class="header-title" style="border:none;">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</td></tr>';
            echo '<tr><td colspan="12" class="header-sub" style="border:none;">DAFTAR PESERTA DAN NILAI AKHIR (DPNA)</td></tr>';
            echo '<tr><td colspan="12" style="border:none; text-align:center; font-size:10px; color:#4b5563;">Periode: ' . ($class->period_name ?? 'Semester Ganjil 2026/2027') . ' • Tanggal Ekspor: ' . date('d F Y, H:i') . ' WIB</td></tr>';
            echo '<tr><td colspan="12" style="border:none; height:8px;"></td></tr>';

            // Meta Info
            echo '<tr>';
            echo '<td colspan="2" class="meta-label">Mata Kuliah:</td>';
            echo '<td colspan="4">' . $class->course_name . ' (' . $class->course_code . ')</td>';
            echo '<td colspan="2" class="meta-label">Dosen Pengampu:</td>';
            echo '<td colspan="4">' . ($class->lecturer_name ?? '-') . ' (NIDN: ' . ($class->lecturer_nidn ?? '-') . ')</td>';
            echo '</tr>';

            echo '<tr>';
            echo '<td colspan="2" class="meta-label">Bobot SKS & Kelas:</td>';
            echo '<td colspan="4">' . $class->credits . ' SKS • Kelas ' . $class->name . '</td>';
            echo '<td colspan="2" class="meta-label">Program Studi:</td>';
            echo '<td colspan="4">' . ($class->study_program ?? 'Tarbiyah / PAI') . '</td>';
            echo '</tr>';
            echo '<tr><td colspan="12" style="border:none; height:10px;"></td></tr>';

            // Table Columns
            echo '<tr>';
            echo '<th style="width:40px;">No</th>';
            echo '<th style="width:130px;">NIM</th>';
            echo '<th style="width:230px;">Nama Mahasiswa</th>';
            echo '<th style="width:90px;">Presensi (10%)</th>';
            echo '<th style="width:90px;">Tugas (20%)</th>';
            echo '<th style="width:90px;">Kuis (15%)</th>';
            echo '<th style="width:90px;">UTS (25%)</th>';
            echo '<th style="width:90px;">UAS (30%)</th>';
            echo '<th style="width:90px;">Nilai Akhir</th>';
            echo '<th style="width:70px;">Huruf</th>';
            echo '<th style="width:70px;">Bobot</th>';
            echo '<th style="width:100px;">Status</th>';
            echo '</tr>';

            $no = 1;
            foreach ($enrollments as $stu) {
                $g = $grades->get($stu->student_id);
                $att = (float)($g?->attendance_score ?? 0);
                $asg = (float)($g?->assignment_score ?? 0);
                $quiz = (float)($g?->quiz_score ?? 0);
                $mid = (float)($g?->mid_exam_score ?? 0);
                $fin = (float)($g?->final_exam_score ?? 0);
                $finalScore = (float)($g?->final_score ?? 0);
                $letter = $g?->grade_letter ?? '-';
                $point = (float)($g?->grade_point ?? 0.0);
                $isPassed = in_array($letter, ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']);

                echo '<tr>';
                echo '<td class="text-center">' . $no++ . '</td>';
                echo '<td class="font-mono text-center">' . $stu->student_nim . '</td>';
                echo '<td><strong>' . htmlspecialchars($stu->student_name) . '</strong></td>';
                echo '<td class="text-center">' . $att . '</td>';
                echo '<td class="text-center">' . $asg . '</td>';
                echo '<td class="text-center">' . $quiz . '</td>';
                echo '<td class="text-center">' . $mid . '</td>';
                echo '<td class="text-center">' . $fin . '</td>';
                echo '<td class="text-center score-col">' . number_format($finalScore, 1) . '</td>';
                echo '<td class="text-center font-mono score-col">' . $letter . '</td>';
                echo '<td class="text-center font-mono score-col">' . number_format($point, 2) . '</td>';
                echo '<td class="text-center ' . ($isPassed ? 'lulus' : 'tidur') . '">' . ($isPassed ? 'LULUS' : 'TIDAK LULUS') . '</td>';
                echo '</tr>';
            }

            echo '</table>';
            echo '</body></html>';
        }, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ]);
    }

    /**
     * Unduh Template Excel / CSV Kosong Siap Isi Sesuai Daftar Mahasiswa Kelas Ini
     */
    public function downloadTemplate(Request $request, int $classId): StreamedResponse
    {
        $class = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('course_classes.id', $classId)
            ->select('courses.code', 'course_classes.name')
            ->first();

        $enrollments = DB::table('class_enrollments')
            ->join('users as students', 'class_enrollments.student_id', '=', 'students.id')
            ->where('class_enrollments.course_class_id', $classId)
            ->select('students.id as student_id', 'students.identity_number as student_nim', 'students.name as student_name')
            ->orderBy('students.identity_number', 'asc')
            ->get();

        $grades = DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->get()
            ->keyBy('student_id');

        $cleanCode = preg_replace('/[^A-Za-z0-9]/', '_', $class?->code ?? 'MK');
        $cleanClass = preg_replace('/[^A-Za-z0-9]/', '_', $class?->name ?? 'A');
        $filename = "Template_Nilai_{$cleanCode}_{$cleanClass}.csv";

        return new StreamedResponse(function () use ($enrollments, $grades) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            // Header kolom
            fputcsv($handle, [
                'student_id',
                'nim',
                'nama_mahasiswa',
                'presensi_10',
                'tugas_20',
                'kuis_15',
                'uts_25',
                'uas_30'
            ]);

            foreach ($enrollments as $stu) {
                $g = $grades->get($stu->student_id);
                fputcsv($handle, [
                    $stu->student_id,
                    $stu->student_nim,
                    $stu->student_name,
                    $g?->attendance_score ?? 85,
                    $g?->assignment_score ?? 80,
                    $g?->quiz_score ?? 80,
                    $g?->mid_exam_score ?? 80,
                    $g?->final_exam_score ?? 85,
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Cetak DPNA Resmi Format PDF
     */
    public function printPdf(Request $request, int $classId): HttpResponse
    {
        $class = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->join('academic_periods', 'course_classes.academic_period_id', '=', 'academic_periods.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->leftJoin('class_schedules', 'course_classes.id', '=', 'class_schedules.course_class_id')
            ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
            ->where('course_classes.id', $classId)
            ->select(
                'course_classes.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'study_programs.name as study_program',
                'academic_periods.name as period_name',
                'lecturers.name as lecturer_name',
                'lecturers.identity_number as lecturer_nidn',
                'rooms.name as room_name'
            )
            ->first();

        if (!$class) abort(404);

        $enrollments = DB::table('class_enrollments')
            ->join('users as students', 'class_enrollments.student_id', '=', 'students.id')
            ->where('class_enrollments.course_class_id', $classId)
            ->select(
                'students.id as student_id',
                'students.name as student_name',
                'students.identity_number as student_nim'
            )
            ->orderBy('students.identity_number', 'asc')
            ->get();

        $studentIds = $enrollments->pluck('student_id')->toArray();
        $grades = DB::table('course_grades')
            ->where('course_class_id', $classId)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        $studentsWithGrades = $enrollments->map(function ($stu) use ($grades) {
            $g = $grades->get($stu->student_id);
            $stu->attendance_score = (float)($g?->attendance_score ?? 0);
            $stu->assignment_score = (float)($g?->assignment_score ?? 0);
            $stu->quiz_score = (float)($g?->quiz_score ?? 0);
            $stu->mid_exam_score = (float)($g?->mid_exam_score ?? 0);
            $stu->final_exam_score = (float)($g?->final_exam_score ?? 0);
            $stu->final_score = (float)($g?->final_score ?? 0);
            $stu->grade_letter = $g?->grade_letter ?? '-';
            $stu->grade_point = (float)($g?->grade_point ?? 0.0);
            $stu->is_locked = (bool)($g?->is_locked ?? false);
            return $stu;
        });

        $isClassLocked = $studentsWithGrades->where('is_locked', true)->count() > 0;

        $distribution = [
            'A' => 0, 'A-' => 0, 'B+' => 0, 'B' => 0,
            'B-' => 0, 'C+' => 0, 'C' => 0, 'D' => 0, 'E' => 0
        ];
        $passedCount = 0;
        foreach ($studentsWithGrades as $s) {
            if (isset($distribution[$s->grade_letter])) {
                $distribution[$s->grade_letter]++;
            }
            if (in_array($s->grade_letter, ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'])) {
                $passedCount++;
            }
        }

        $totalStudents = count($studentsWithGrades);
        $passPercentage = $totalStudents > 0 ? round(($passedCount / $totalStudents) * 100, 1) : 100;
        $avgScore = $studentsWithGrades->avg('final_score') ?? 0;

        // Ambil data Kaprodi sebagai penandatangan
        $signatory = User::where('role', 'kaprodi')->first();

        $html = view('pdf.dpna', [
            'class' => $class,
            'students' => $studentsWithGrades,
            'isLocked' => $isClassLocked,
            'distribution' => $distribution,
            'avgScore' => $avgScore,
            'passPercentage' => $passPercentage,
            'signatory' => $signatory,
            'printDate' => now()->translatedFormat('d F Y'),
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }
}

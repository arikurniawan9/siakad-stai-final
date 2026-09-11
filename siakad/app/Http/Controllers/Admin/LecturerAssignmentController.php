<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LecturerAssignmentController extends Controller
{
    /**
     * Tampilan Utama Plotting & Penugasan Dosen Pengampu Mata Kuliah
     */
    public function index(Request $request): Response|JsonResponse
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first()
            ?? DB::table('academic_periods')->orderBy('id', 'desc')->first();

        $selectedPeriodId = (int) $request->input('period_id', $activePeriod?->id ?? 1);
        $academicPeriods = DB::table('academic_periods')->orderBy('code', 'desc')->get();
        $studyPrograms = DB::table('study_programs')->select('id', 'code', 'name', 'degree')->orderBy('id', 'asc')->get();

        $selectedProgramId = $request->input('program_id');
        $search = $request->input('search');

        // Ambil semua Dosen (Dosen, Dosen PA, Kaprodi)
        $lecturersQuery = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($selectedProgramId && $selectedProgramId !== 'ALL', function ($q) use ($selectedProgramId, $studyPrograms) {
                $prodiObj = $studyPrograms->firstWhere('id', (int) $selectedProgramId);
                if ($prodiObj) {
                    $q->where(function ($sub) use ($prodiObj) {
                        $sub->where('study_program', 'ilike', "%{$prodiObj->name}%")
                            ->orWhere('study_program', 'ilike', "%{$prodiObj->code}%");
                    });
                }
            });

        $lecturers = $lecturersQuery->orderBy('name', 'asc')->get();

        // Ambil seluruh penugasan class_lecturers untuk periode ini
        $assignments = DB::table('class_lecturers')
            ->join('course_classes', 'class_lecturers.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->where('course_classes.academic_period_id', $selectedPeriodId)
            ->select(
                'class_lecturers.id as class_lecturer_id',
                'class_lecturers.lecturer_id',
                'class_lecturers.is_primary',
                'course_classes.id as course_class_id',
                'course_classes.name as class_name',
                'course_classes.code as class_code',
                'course_classes.capacity',
                'course_classes.delivery_mode',
                'courses.id as course_id',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'courses.course_type',
                'study_programs.id as study_program_id',
                'study_programs.name as study_program_name',
                DB::raw('(SELECT COUNT(*) FROM class_enrollments WHERE class_enrollments.course_class_id = course_classes.id) as enrolled_count')
            )
            ->orderBy('courses.code', 'asc')
            ->orderBy('course_classes.name', 'asc')
            ->get();

        $assignmentsByLecturer = $assignments->groupBy('lecturer_id');

        // Transformasi data dosen dengan daftar mata kuliah & kelas yang diampu
        $lecturersData = $lecturers->map(function ($lec) use ($assignmentsByLecturer) {
            $lecAssignments = $assignmentsByLecturer->get($lec->id, collect());
            $lec->assigned_classes = $lecAssignments;
            $lec->assigned_courses_count = $lecAssignments->pluck('course_id')->unique()->count();
            $lec->assigned_classes_count = $lecAssignments->count();
            $lec->total_credits = (float) $lecAssignments->sum('credits');
            return $lec;
        });

        // Ambil data mata kuliah untuk Course-Centric View & Dropdown Picker
        $coursesQuery = DB::table('courses')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->select(
                'courses.id',
                'courses.code',
                'courses.name',
                'courses.credits',
                'courses.semester_level',
                'courses.course_type',
                'courses.course_group',
                'courses.study_program_id',
                'study_programs.name as study_program_name'
            )
            ->when($selectedProgramId && $selectedProgramId !== 'ALL', function ($q) use ($selectedProgramId) {
                $q->where('courses.study_program_id', (int) $selectedProgramId);
            })
            ->orderBy('courses.code', 'asc');

        $allCourses = $coursesQuery->get();

        // Ambil seluruh kelas perkuliahan di periode terpilih
        $periodClasses = DB::table('course_classes')
            ->where('academic_period_id', $selectedPeriodId)
            ->select(
                'course_classes.*',
                DB::raw('(SELECT COUNT(*) FROM class_enrollments WHERE class_enrollments.course_class_id = course_classes.id) as enrolled_count')
            )
            ->get();

        $classesByCourse = $periodClasses->groupBy('course_id');
        $assignmentsByClass = $assignments->groupBy('course_class_id');

        // Satukan dosen pengajar ke setiap kelas
        $coursesWithClasses = $allCourses->map(function ($c) use ($classesByCourse, $assignmentsByClass, $lecturers) {
            $classes = $classesByCourse->get($c->id, collect());
            $c->classes = $classes->map(function ($cls) use ($assignmentsByClass, $lecturers) {
                $clsAssignments = $assignmentsByClass->get($cls->id, collect());
                $cls->lecturers = $clsAssignments->map(function ($a) use ($lecturers) {
                    $lecUser = $lecturers->firstWhere('id', $a->lecturer_id);
                    return [
                        'class_lecturer_id' => $a->class_lecturer_id,
                        'lecturer_id' => $a->lecturer_id,
                        'lecturer_name' => $lecUser?->name ?? 'Dosen Tidak Dikenal',
                        'lecturer_nidn' => $lecUser?->identity_number ?? '-',
                        'is_primary' => (bool) $a->is_primary,
                    ];
                });
                return $cls;
            });
            $c->classes_count = $classes->count();
            $c->has_lecturer = $classes->some(fn($cls) => $cls->lecturers->isNotEmpty());
            return $c;
        });

        // Metrik & Statistik
        $totalLecturers = $lecturers->count();
        $activeTeachingLecturers = $lecturersData->filter(fn($l) => $l->assigned_classes_count > 0)->count();
        $totalCoursesOffered = $allCourses->count();
        $totalClassesOffered = $periodClasses->count();
        $unassignedClassesCount = $periodClasses->filter(function ($cls) use ($assignmentsByClass) {
            return !$assignmentsByClass->has($cls->id);
        })->count();
        $totalCreditsTaught = (float) $assignments->sum('credits');

        $stats = [
            'total_lecturers' => $totalLecturers,
            'active_teaching_lecturers' => $activeTeachingLecturers,
            'total_courses_offered' => $totalCoursesOffered,
            'total_classes_offered' => $totalClassesOffered,
            'unassigned_classes_count' => $unassignedClassesCount,
            'total_credits_taught' => $totalCreditsTaught,
        ];

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'lecturers' => $lecturersData,
                'courses' => $coursesWithClasses,
                'stats' => $stats,
            ]);
        }

        return Inertia::render('Admin/LecturerAssignments/Index', [
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'selectedPeriodId' => $selectedPeriodId,
            'studyPrograms' => $studyPrograms,
            'selectedProgramId' => $selectedProgramId ? ($selectedProgramId === 'ALL' ? 'ALL' : (int) $selectedProgramId) : 'ALL',
            'lecturers' => $lecturersData,
            'coursesWithClasses' => $coursesWithClasses,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'program_id' => $selectedProgramId,
                'period_id' => $selectedPeriodId,
            ],
        ]);
    }

    /**
     * Tugaskan Satu Dosen ke Berbagai Mata Kuliah atau Kelas
     */
    public function assign(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'lecturer_id' => ['required', 'exists:users,id'],
            'academic_period_id' => ['required', 'exists:academic_periods,id'],
            'course_ids' => ['nullable', 'array'],
            'course_ids.*' => ['exists:courses,id'],
            'course_class_ids' => ['nullable', 'array'],
            'course_class_ids.*' => ['exists:course_classes,id'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $lecturer = User::findOrFail($validated['lecturer_id']);
        $periodId = $validated['academic_period_id'];
        $isPrimary = $validated['is_primary'] ?? true;
        $assignedCount = 0;

        DB::transaction(function () use ($validated, $lecturer, $periodId, $isPrimary, &$assignedCount) {
            // 1. Jika menugaskan berdasarkan kelas yang sudah ada
            if (!empty($validated['course_class_ids'])) {
                foreach ($validated['course_class_ids'] as $classId) {
                    DB::table('class_lecturers')->updateOrInsert(
                        [
                            'course_class_id' => $classId,
                            'lecturer_id' => $lecturer->id,
                        ],
                        [
                            'is_primary' => $isPrimary,
                            'updated_at' => now(),
                        ]
                    );
                    $assignedCount++;
                }
            }

            // 2. Jika menugaskan berdasarkan mata kuliah (auto-create class jika belum ada)
            if (!empty($validated['course_ids'])) {
                foreach ($validated['course_ids'] as $courseId) {
                    $course = DB::table('courses')->find($courseId);
                    if (!$course) continue;

                    // Cek apakah sudah ada kelas untuk mata kuliah ini di periode ini
                    $existingClass = DB::table('course_classes')
                        ->where('academic_period_id', $periodId)
                        ->where('course_id', $courseId)
                        ->first();

                    if ($existingClass) {
                        $classId = $existingClass->id;
                    } else {
                        // Auto-generate Kelas A
                        $codeSlug = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $course->code));
                        $classCode = "cls-{$periodId}-{$codeSlug}-a-" . Str::random(4);

                        $classId = DB::table('course_classes')->insertGetId([
                            'academic_period_id' => $periodId,
                            'course_id' => $courseId,
                            'name' => 'Kelas A',
                            'code' => $classCode,
                            'capacity' => 35,
                            'delivery_mode' => 'TATAP_MUKA',
                            'status' => 'AKTIF',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    DB::table('class_lecturers')->updateOrInsert(
                        [
                            'course_class_id' => $classId,
                            'lecturer_id' => $lecturer->id,
                        ],
                        [
                            'is_primary' => $isPrimary,
                            'updated_at' => now(),
                        ]
                    );
                    $assignedCount++;
                }
            }
        });

        return back()->with('success', "Berhasil menugaskan {$assignedCount} mata kuliah/kelas kepada Dosen {$lecturer->name}.");
    }

    /**
     * Batch Assign: Menugaskan Dosen ke Beberapa Kelas Sekaligus
     */
    public function batchAssign(Request $request): RedirectResponse
    {
        return $this->assign($request);
    }

    /**
     * Cabut / Hapus Relasi Penugasan Dosen dari Kelas
     */
    public function removeAssignment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_class_id' => ['required', 'exists:course_classes,id'],
            'lecturer_id' => ['required', 'exists:users,id'],
        ]);

        $lecturer = User::find($validated['lecturer_id']);
        $courseClass = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('course_classes.id', $validated['course_class_id'])
            ->select('course_classes.name as class_name', 'courses.name as course_name')
            ->first();

        DB::table('class_lecturers')
            ->where('course_class_id', $validated['course_class_id'])
            ->where('lecturer_id', $validated['lecturer_id'])
            ->delete();

        $lecturerName = $lecturer?->name ?? 'Dosen';
        $className = $courseClass ? "{$courseClass->course_name} ({$courseClass->class_name})" : 'Kelas';

        return back()->with('success', "Penugasan Dosen {$lecturerName} pada {$className} berhasil dicabut.");
    }

    /**
     * Buat Kelas Baru Cepat Sekaligus Menugaskan Dosen
     */
    public function quickCreateClassAndAssign(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_period_id' => ['required', 'exists:academic_periods,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'class_name' => ['required', 'string', 'max:64'],
            'lecturer_id' => ['required', 'exists:users,id'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:200'],
            'delivery_mode' => ['nullable', 'in:TATAP_MUKA,DARING,HYBRID'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $course = DB::table('courses')->findOrFail($validated['course_id']);
        $lecturer = User::findOrFail($validated['lecturer_id']);

        $codeSlug = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $course->code));
        $nameSlug = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $validated['class_name']));
        $classCode = "cls-{$validated['academic_period_id']}-{$codeSlug}-{$nameSlug}-" . Str::random(4);

        DB::transaction(function () use ($validated, $classCode, $lecturer) {
            $classId = DB::table('course_classes')->insertGetId([
                'academic_period_id' => $validated['academic_period_id'],
                'course_id' => $validated['course_id'],
                'name' => $validated['class_name'],
                'code' => $classCode,
                'capacity' => $validated['capacity'] ?? 35,
                'delivery_mode' => $validated['delivery_mode'] ?? 'TATAP_MUKA',
                'status' => 'AKTIF',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('class_lecturers')->updateOrInsert(
                [
                    'course_class_id' => $classId,
                    'lecturer_id' => $lecturer->id,
                ],
                [
                    'is_primary' => $validated['is_primary'] ?? true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        });

        return back()->with('success', "Kelas {$validated['class_name']} untuk {$course->name} berhasil dibuat dan diampu oleh {$lecturer->name}.");
    }

    /**
     * Ekspor Rekap SK Penugasan Dosen Semester Ini ke Format Excel (.xls)
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $periodId = $request->input('period_id');
        $period = DB::table('academic_periods')->find($periodId) 
            ?? DB::table('academic_periods')->where('is_active', true)->first();

        $assignments = DB::table('class_lecturers')
            ->join('course_classes', 'class_lecturers.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->join('users', 'class_lecturers.lecturer_id', '=', 'users.id')
            ->where('course_classes.academic_period_id', $period?->id ?? 1)
            ->select(
                'users.name as lecturer_name',
                'users.identity_number as lecturer_nidn',
                'users.study_program as lecturer_homebase',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'course_classes.name as class_name',
                'course_classes.delivery_mode',
                'study_programs.name as prodi_name',
                'class_lecturers.is_primary'
            )
            ->orderBy('users.name', 'asc')
            ->orderBy('courses.code', 'asc')
            ->get();

        $filename = 'rekap-penugasan-dosen-' . ($period?->code ?? 'semester') . '-' . date('Ymd_His') . '.xls';

        return new StreamedResponse(function () use ($assignments, $period) {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
            echo '<style>
                body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; }
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #1e1b4b; color: #ffffff; font-weight: bold; border: 1px solid #312e81; padding: 8px; text-align: center; }
                td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: middle; }
                .text-center { text-align: center; }
                .font-mono { font-family: "Consolas", monospace; mso-number-format:"\@"; }
                .zebra { background-color: #f8fafc; }
                .header-title { font-size: 14px; font-weight: 900; color: #1e1b4b; text-align: center; }
                .badge-primary { background-color: #dbeafe; color: #1e40af; font-weight: bold; }
                .badge-team { background-color: #fef3c7; color: #92400e; }
            </style></head><body>';

            echo '<table>';
            echo '<tr><td colspan="10" class="header-title" style="border:none;">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</td></tr>';
            echo '<tr><td colspan="10" style="border:none; text-align:center; font-weight:bold; font-size:12px;">SURAT KEPUTUSAN / REKAP PENUGASAN DOSEN PENGAMPU MATA KULIAH</td></tr>';
            echo '<tr><td colspan="10" style="border:none; text-align:center; font-size:11px; color:#475569;">Periode Akademik: ' . ($period?->name ?? 'Tahun Akademik Berjalan') . ' • Tanggal Ekspor: ' . date('d F Y, H:i') . ' WIB</td></tr>';
            echo '<tr><td colspan="10" style="border:none; height:12px;"></td></tr>';

            echo '<tr>';
            echo '<th style="width:40px;">No</th>';
            echo '<th style="width:220px;">Nama Dosen Pengampu</th>';
            echo '<th style="width:120px;">NIDN / NIP</th>';
            echo '<th style="width:180px;">Homebase Dosen</th>';
            echo '<th style="width:90px;">Kode MK</th>';
            echo '<th style="width:240px;">Nama Mata Kuliah</th>';
            echo '<th style="width:100px;">Kelas</th>';
            echo '<th style="width:60px;">SKS</th>';
            echo '<th style="width:80px;">Semester</th>';
            echo '<th style="width:130px;">Status Pengampu</th>';
            echo '</tr>';

            $no = 1;
            foreach ($assignments as $a) {
                $isZebra = ($no % 2 === 0) ? 'class="zebra"' : '';
                $statusRole = $a->is_primary ? 'Dosen Utama' : 'Team Teaching';
                $statusClass = $a->is_primary ? 'badge-primary' : 'badge-team';

                echo "<tr {$isZebra}>";
                echo "<td class='text-center'>{$no}</td>";
                echo "<td><strong>{$a->lecturer_name}</strong></td>";
                echo "<td class='font-mono text-center'>{$a->lecturer_nidn}</td>";
                echo "<td>{$a->lecturer_homebase}</td>";
                echo "<td class='font-mono text-center'>{$a->course_code}</td>";
                echo "<td><strong>{$a->course_name}</strong></td>";
                echo "<td class='text-center'>{$a->class_name}</td>";
                echo "<td class='text-center'><strong>{$a->credits}</strong></td>";
                echo "<td class='text-center'>Smt {$a->semester_level}</td>";
                echo "<td class='text-center {$statusClass}'>{$statusRole}</td>";
                echo "</tr>";
                $no++;
            }

            echo '</table></body></html>';
        }, 200, [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }
}

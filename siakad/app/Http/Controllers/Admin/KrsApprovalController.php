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

class KrsApprovalController extends Controller
{
    /**
     * Tampilan Monitoring & Approval Data Rencana Studi (KRS)
     */
    public function index(Request $request): Response|JsonResponse
    {
        $prodiFilter = $request->input('study_program');
        $yearFilter = $request->input('academic_year'); // e.g. 2026, 2025, 2024, 2023
        $periodFilter = $request->input('academic_period'); // period ID
        $statusFilter = $request->input('status');
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 20);

        // Master Data Filter
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

        // Selected Prodi Object
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
            'approved' => 0,
            'pending' => 0,
            'draft' => 0,
            'not_submitted' => 0,
        ];

        if ($isSelectionComplete) {
            // Ambil seluruh mahasiswa di Prodi & Angkatan terpilih
            $prefix2 = substr($yearFilter, -2);
            $prefix4 = substr($yearFilter, 0, 4);

            $studentsQuery = User::where('role', 'mahasiswa')
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
                           ->orWhere('identity_number', 'ilike', "%{$search}%")
                           ->orWhere('username', 'ilike', "%{$search}%");
                    });
                })
                ->select('id', 'name', 'identity_number as nim', 'email', 'study_program', 'academic_advisor_id', 'created_at')
                ->orderBy('identity_number', 'asc');

            $allStudents = $studentsQuery->get();
            $studentIds = $allStudents->pluck('id')->toArray();

            // Ambil pengajuan KRS untuk periode terpilih
            $krsSubmissions = DB::table('krs_submissions')
                ->where('academic_period_id', $selectedPeriodId)
                ->whereIn('student_id', $studentIds)
                ->get()
                ->keyBy('student_id');

            // Ambil item KRS untuk detail mata kuliah
            $submissionIds = $krsSubmissions->pluck('id')->toArray();
            $krsItems = DB::table('krs_items')
                ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->leftJoin('class_schedules', 'class_schedules.course_class_id', '=', 'course_classes.id')
                ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
                ->whereIn('krs_items.krs_submission_id', $submissionIds)
                ->select(
                    'krs_items.*',
                    'courses.code as course_code',
                    'courses.name as course_name',
                    'courses.credits',
                    'courses.semester_level',
                    'course_classes.name as class_name',
                    'class_schedules.day_of_week',
                    'class_schedules.start_time',
                    'class_schedules.end_time',
                    'rooms.code as room_code',
                    'rooms.name as room_name'
                )
                ->get()
                ->groupBy('krs_submission_id');

            // Ambil Dosen PA
            $advisorIds = $allStudents->pluck('academic_advisor_id')->filter()->unique()->toArray();
            $advisors = User::whereIn('id', $advisorIds)->pluck('name', 'id');

            // Gabungkan status KRS ke setiap mahasiswa
            $mergedStudents = $allStudents->map(function ($stu) use ($krsSubmissions, $krsItems, $advisors, $yearFilter) {
                $sub = $krsSubmissions->get($stu->id);
                $status = $sub ? $sub->status : 'BELUM_KRS';
                $credits = $sub ? (float)$sub->total_credits : 0.0;
                $items = $sub ? ($krsItems->get($sub->id) ?? collect()) : collect();

                return (object)[
                    'id' => $stu->id,
                    'nim' => $stu->nim,
                    'name' => $stu->name,
                    'email' => $stu->email,
                    'study_program' => $stu->study_program,
                    'batch_year' => $yearFilter,
                    'advisor_name' => $advisors->get($stu->academic_advisor_id) ?? '-',
                    'krs_submission_id' => $sub?->id ?? null,
                    'status' => $status,
                    'credits' => $credits,
                    'items_count' => $items->count(),
                    'items' => $items,
                    'submitted_at' => $sub?->submitted_at ?? null,
                    'approved_at' => $sub?->approved_at ?? null,
                    'approval_notes' => $sub?->approval_notes ?? null,
                ];
            });

            // Filter status jika ada
            if ($statusFilter) {
                $mergedStudents = $mergedStudents->filter(function ($item) use ($statusFilter) {
                    if ($statusFilter === 'DISETUJUI') return $item->status === 'DISETUJUI';
                    if ($statusFilter === 'DIAJUKAN') return $item->status === 'DIAJUKAN';
                    if ($statusFilter === 'DRAFT') return $item->status === 'DRAFT';
                    if ($statusFilter === 'BELUM_KRS') return $item->status === 'BELUM_KRS';
                    return true;
                })->values();
            }

            // Hitung statistik
            $stats['total_students'] = $allStudents->count();
            $stats['approved'] = $allStudents->filter(fn($s) => ($krsSubmissions->get($s->id)?->status ?? '') === 'DISETUJUI')->count();
            $stats['pending'] = $allStudents->filter(fn($s) => ($krsSubmissions->get($s->id)?->status ?? '') === 'DIAJUKAN')->count();
            $stats['draft'] = $allStudents->filter(fn($s) => ($krsSubmissions->get($s->id)?->status ?? '') === 'DRAFT')->count();
            $stats['not_submitted'] = $allStudents->filter(fn($s) => !$krsSubmissions->has($s->id))->count();

            // Manual Pagination
            $page = (int) $request->input('page', 1);
            $totalCount = $mergedStudents->count();
            $offset = ($page - 1) * $perPage;
            $paginatedItems = $mergedStudents->slice($offset, $perPage)->values();

            $studentsData = [
                'data' => $paginatedItems,
                'total' => $totalCount,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => max(1, ceil($totalCount / $perPage)),
            ];
        }

        // Return JSON response if requested via AJAX
        if ($request->wantsJson() || $request->header('X-Inertia-Partial-Data')) {
            return response()->json([
                'success' => true,
                'students' => $studentsData,
                'stats' => $stats,
                'isSelectionComplete' => $isSelectionComplete,
                'selectedProdiObj' => $selectedProdiObj,
                'currentPeriodObj' => $currentPeriodObj,
            ]);
        }

        return Inertia::render('Admin/KrsApproval/Index', [
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
                'status' => $statusFilter,
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Setujui KRS Mahasiswa (Individual Approval)
     */
    public function approve($id): RedirectResponse|JsonResponse
    {
        $submission = DB::table('krs_submissions')->where('id', $id)->first();
        if (!$submission) {
            return request()->wantsJson() 
                ? response()->json(['success' => false, 'message' => 'Pengajuan KRS tidak ditemukan.'], 404)
                : back()->with('error', 'Data pengajuan KRS tidak ditemukan.');
        }

        DB::transaction(function () use ($submission) {
            // Update submission status
            DB::table('krs_submissions')->where('id', $submission->id)->update([
                'status' => 'DISETUJUI',
                'approved_at' => now(),
                'updated_at' => now(),
            ]);

            // Update item status
            DB::table('krs_items')->where('krs_submission_id', $submission->id)->update([
                'status' => 'DISETUJUI',
                'updated_at' => now(),
            ]);

            // Auto-enroll student to class_enrollments
            $items = DB::table('krs_items')->where('krs_submission_id', $submission->id)->get();
            foreach ($items as $item) {
                DB::table('class_enrollments')->updateOrInsert(
                    [
                        'course_class_id' => $item->course_class_id,
                        'student_id' => $submission->student_id,
                    ],
                    [
                        'status' => 'TERDAFTAR',
                        'enrolled_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            // Audit log
            DB::table('audit_logs')->insert([
                'user_id' => auth()->id() ?? 1,
                'action' => 'KRS_APPROVE',
                'target_entity' => 'KrsSubmission',
                'target_id' => (string) $submission->id,
                'details' => json_encode(['student_id' => $submission->student_id, 'credits' => $submission->total_credits]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $msg = "KRS Mahasiswa berhasil disetujui ({$submission->total_credits} SKS) & otomatis terdaftar di kelas perkuliahan.";
        return request()->wantsJson() 
            ? response()->json(['success' => true, 'message' => $msg])
            : back()->with('success', $msg);
    }

    /**
     * Tolak / Batalkan KRS Mahasiswa
     */
    public function reject(Request $request, $id): RedirectResponse|JsonResponse
    {
        $notes = $request->input('notes', 'Silakan sesuaikan pilihan mata kuliah sesuai arahan Dosen PA.');

        $submission = DB::table('krs_submissions')->where('id', $id)->first();
        if (!$submission) {
            return request()->wantsJson() 
                ? response()->json(['success' => false, 'message' => 'Data KRS tidak ditemukan.'], 404)
                : back()->with('error', 'Data KRS tidak ditemukan.');
        }

        DB::transaction(function () use ($submission, $notes) {
            DB::table('krs_submissions')->where('id', $submission->id)->update([
                'status' => 'DITOLAK',
                'approval_notes' => $notes,
                'updated_at' => now(),
            ]);

            DB::table('krs_items')->where('krs_submission_id', $submission->id)->update([
                'status' => 'DITOLAK',
                'updated_at' => now(),
            ]);

            // Hapus dari class enrollments jika sebelumnya disetujui
            $items = DB::table('krs_items')->where('krs_submission_id', $submission->id)->pluck('course_class_id')->toArray();
            if (!empty($items)) {
                DB::table('class_enrollments')
                    ->where('student_id', $submission->student_id)
                    ->whereIn('course_class_id', $items)
                    ->delete();
            }
        });

        $msg = 'Pengajuan KRS berhasil ditolak dan dikembalikan ke status revisi.';
        return request()->wantsJson() 
            ? response()->json(['success' => true, 'message' => $msg])
            : back()->with('success', $msg);
    }

    /**
     * Setujui Semua Pengajuan KRS yang Menunggu (Bulk Approval)
     */
    public function bulkApprove(Request $request): RedirectResponse|JsonResponse
    {
        $periodId = $request->input('academic_period_id');
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $targetPeriodId = $periodId ?: ($activePeriod?->id ?? 1);

        $pendingSubmissions = DB::table('krs_submissions')
            ->where('academic_period_id', $targetPeriodId)
            ->where('status', 'DIAJUKAN')
            ->get();

        if ($pendingSubmissions->isEmpty()) {
            return request()->wantsJson()
                ? response()->json(['success' => false, 'message' => 'Tidak ada pengajuan KRS yang sedang menunggu persetujuan.'], 422)
                : back()->with('error', 'Tidak ada pengajuan KRS yang sedang menunggu persetujuan.');
        }

        $count = 0;
        DB::transaction(function () use ($pendingSubmissions, &$count) {
            foreach ($pendingSubmissions as $sub) {
                DB::table('krs_submissions')->where('id', $sub->id)->update([
                    'status' => 'DISETUJUI',
                    'approved_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('krs_items')->where('krs_submission_id', $sub->id)->update([
                    'status' => 'DISETUJUI',
                    'updated_at' => now(),
                ]);

                $items = DB::table('krs_items')->where('krs_submission_id', $sub->id)->get();
                foreach ($items as $item) {
                    DB::table('class_enrollments')->updateOrInsert(
                        [
                            'course_class_id' => $item->course_class_id,
                            'student_id' => $sub->student_id,
                        ],
                        [
                            'status' => 'TERDAFTAR',
                            'enrolled_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
                $count++;
            }
        });

        $msg = "Bulk Approval Berhasil! {$count} Pengajuan KRS mahasiswa telah disetujui sekaligus.";
        return request()->wantsJson() 
            ? response()->json(['success' => true, 'message' => $msg])
            : back()->with('success', $msg);
    }

    /**
     * Cetak Lembar Rencana Studi (KRS) PDF
     */
    public function printPdf(Request $request, $id): HttpResponse
    {
        $submission = DB::table('krs_submissions')
            ->join('users as students', 'krs_submissions.student_id', '=', 'students.id')
            ->leftJoin('users as advisors', 'krs_submissions.academic_advisor_id', '=', 'advisors.id')
            ->join('academic_periods', 'krs_submissions.academic_period_id', '=', 'academic_periods.id')
            ->join('academic_years', 'academic_periods.academic_year_id', '=', 'academic_years.id')
            ->where('krs_submissions.id', $id)
            ->select(
                'krs_submissions.*',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'students.study_program',
                'advisors.name as advisor_name',
                'academic_periods.name as period_name',
                'academic_years.name as year_name'
            )
            ->first();

        if (!$submission) {
            abort(404, 'Data KRS tidak ditemukan.');
        }

        $items = DB::table('krs_items')
            ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('class_lecturers', 'class_lecturers.course_class_id', '=', 'course_classes.id')
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->leftJoin('class_schedules', 'class_schedules.course_class_id', '=', 'course_classes.id')
            ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
            ->where('krs_items.krs_submission_id', $submission->id)
            ->select(
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'course_classes.name as class_name',
                'lecturers.name as lecturer_name',
                'class_schedules.day_of_week',
                'class_schedules.start_time',
                'class_schedules.end_time',
                'rooms.name as room_name'
            )
            ->get();

        $signatory = DB::table('institutional_signatories')
            ->join('structural_positions', 'institutional_signatories.position_id', '=', 'structural_positions.id')
            ->where('structural_positions.code', 'WAKET_1')
            ->where('institutional_signatories.is_active', true)
            ->first();

        $html = view('pdf.krs', [
            'submission' => $submission,
            'items' => $items,
            'signatory' => $signatory,
            'printDate' => now()->translatedFormat('d F Y'),
        ])->render();

        return response($html)->header('Content-Type', 'text/html');
    }

    /**
     * Ambil Rincian KRS Mahasiswa dan Daftar Mata Kuliah yang Tersedia
     */
    public function getStudentKrsDetails(Request $request, $studentId): JsonResponse
    {
        $student = User::where('role', 'mahasiswa')
            ->where(function ($q) use ($studentId) {
                $q->where('id', $studentId)
                  ->orWhere('identity_number', $studentId)
                  ->orWhere('username', $studentId);
            })
            ->first();

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Data mahasiswa tidak ditemukan.'], 404);
        }

        $periodId = $request->input('academic_period_id');
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $targetPeriodId = $periodId ? (int) $periodId : ($activePeriod?->id ?? 1);

        $data = $this->buildStudentKrsPayload($student, $targetPeriodId);

        return response()->json(array_merge(['success' => true], $data));
    }

    /**
     * Helper Pembuat Payload Data KRS Mahasiswa & Kelas Ditawarkan
     */
    private function buildStudentKrsPayload(User $student, int $periodId): array
    {
        $period = DB::table('academic_periods')
            ->join('academic_years', 'academic_periods.academic_year_id', '=', 'academic_years.id')
            ->where('academic_periods.id', $periodId)
            ->select('academic_periods.*', 'academic_years.name as year_name', 'academic_years.code as year_code')
            ->first();

        $advisor = null;
        if ($student->academic_advisor_id) {
            $advisor = User::find($student->academic_advisor_id);
        }

        // Submission KRS
        $submission = DB::table('krs_submissions')
            ->where('student_id', $student->id)
            ->where('academic_period_id', $periodId)
            ->first();

        $enrolledItems = collect();
        if ($submission) {
            $enrolledItems = DB::table('krs_items')
                ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->leftJoin('class_schedules', 'course_classes.id', '=', 'class_schedules.course_class_id')
                ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
                ->leftJoin('class_lecturers', function ($join) {
                    $join->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                         ->where('class_lecturers.is_primary', true);
                })
                ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
                ->where('krs_items.krs_submission_id', $submission->id)
                ->select(
                    'krs_items.id as krs_item_id',
                    'krs_items.status as item_status',
                    'course_classes.id as course_class_id',
                    'course_classes.name as class_name',
                    'course_classes.capacity',
                    'courses.id as course_id',
                    'courses.code as course_code',
                    'courses.name as course_name',
                    'courses.credits',
                    'courses.semester_level',
                    'class_schedules.day_of_week',
                    'class_schedules.start_time',
                    'class_schedules.end_time',
                    'rooms.name as room_name',
                    'rooms.code as room_code',
                    'lecturers.name as lecturer_name'
                )
                ->orderBy('courses.semester_level', 'asc')
                ->orderBy('courses.code', 'asc')
                ->get();
        }

        $enrolledClassIds = $enrolledItems->pluck('course_class_id')->toArray();

        // Cari Prodi ID mahasiswa
        $prodiStr = $student->study_program;
        $studyProgram = DB::table('study_programs')
            ->where(function ($q) use ($prodiStr) {
                $q->where('name', $prodiStr)
                  ->orWhere('name', 'ilike', "%{$prodiStr}%")
                  ->orWhereRaw("? ILIKE '%' || name || '%'", [$prodiStr]);
            })
            ->first();
        $prodiId = $studyProgram?->id;

        // Ambil kelas yang ditawarkan pada periode ini
        $availableQuery = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('class_schedules', 'course_classes.id', '=', 'class_schedules.course_class_id')
            ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
            ->leftJoin('class_lecturers', function ($join) {
                $join->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                     ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $periodId)
            ->where('course_classes.status', 'AKTIF');

        if ($prodiId) {
            $availableQuery->where(function ($q) use ($prodiId) {
                $q->where('courses.study_program_id', $prodiId)
                  ->orWhereNull('courses.study_program_id');
            });
        }

        if (!empty($enrolledClassIds)) {
            $availableQuery->whereNotIn('course_classes.id', $enrolledClassIds);
        }

        $availableClasses = $availableQuery->select(
            'course_classes.id as course_class_id',
            'course_classes.name as class_name',
            'course_classes.capacity',
            'courses.id as course_id',
            'courses.code as course_code',
            'courses.name as course_name',
            'courses.credits',
            'courses.semester_level',
            'class_schedules.day_of_week',
            'class_schedules.start_time',
            'class_schedules.end_time',
            'rooms.name as room_name',
            'rooms.code as room_code',
            'lecturers.name as lecturer_name'
        )
        ->orderBy('courses.semester_level', 'asc')
        ->orderBy('courses.code', 'asc')
        ->get();

        // Hitung kuota terisi untuk setiap kelas
        $allClassIds = $availableClasses->pluck('course_class_id')->toArray();
        $enrolledCounts = DB::table('class_enrollments')
            ->whereIn('course_class_id', $allClassIds)
            ->select('course_class_id', DB::raw('count(*) as count'))
            ->groupBy('course_class_id')
            ->pluck('count', 'course_class_id');

        $availableClasses->transform(function ($c) use ($enrolledCounts) {
            $c->enrolled_count = $enrolledCounts[$c->course_class_id] ?? 0;
            return $c;
        });

        $totalCredits = (float) $enrolledItems->sum('credits');

        $availableSemesters = $availableClasses->pluck('semester_level')->filter()->unique()->values()->sort()->values()->all();

        return [
            'student' => [
                'id' => $student->id,
                'nim' => $student->identity_number ?: $student->username,
                'name' => $student->name,
                'study_program' => $student->study_program,
                'advisor_name' => $advisor?->name ?? 'Dra. Hj. Siti Maryam, M.Pd.I',
                'academic_advisor_id' => $student->academic_advisor_id,
            ],
            'period' => $period,
            'submission' => $submission,
            'status' => $submission ? $submission->status : 'BELUM_KRS',
            'total_credits' => $totalCredits,
            'max_credits' => (float)($submission?->max_credits_allowed ?? 24),
            'enrolled_items' => $enrolledItems,
            'available_classes' => $availableClasses,
            'available_semesters' => $availableSemesters,
        ];
    }

    /**
     * Tambahkan Mata Kuliah ke KRS Mahasiswa
     */
    public function addCourseToStudent(Request $request, $studentId): JsonResponse
    {
        $student = User::where('role', 'mahasiswa')
            ->where(function ($q) use ($studentId) {
                $q->where('id', $studentId)
                  ->orWhere('identity_number', $studentId)
                  ->orWhere('username', $studentId);
            })
            ->firstOrFail();

        $classId = (int) $request->input('course_class_id');
        $periodId = (int) $request->input('academic_period_id', 1);

        $courseClass = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('course_classes.id', $classId)
            ->select('course_classes.*', 'courses.credits', 'courses.name as course_name', 'courses.code as course_code')
            ->first();

        if (!$courseClass) {
            return response()->json(['success' => false, 'message' => 'Kelas perkuliahan tidak ditemukan.'], 404);
        }

        // Ambil atau buat submission
        $submission = DB::table('krs_submissions')
            ->where('student_id', $student->id)
            ->where('academic_period_id', $periodId)
            ->first();

        if (!$submission) {
            $subId = DB::table('krs_submissions')->insertGetId([
                'student_id' => $student->id,
                'academic_period_id' => $periodId,
                'total_credits' => 0,
                'max_credits_allowed' => 24,
                'status' => 'DISETUJUI',
                'academic_advisor_id' => $student->academic_advisor_id ?? 5,
                'submitted_at' => now(),
                'approved_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $submission = DB::table('krs_submissions')->where('id', $subId)->first();
        }

        // Cek duplikasi di KRS
        $alreadyInKrs = DB::table('krs_items')
            ->where('krs_submission_id', $submission->id)
            ->where('course_class_id', $classId)
            ->exists();

        if ($alreadyInKrs) {
            return response()->json(['success' => false, 'message' => 'Mata kuliah ini sudah ada di dalam KRS mahasiswa.'], 422);
        }

        // Hitung total SKS saat ini
        $currentCredits = (float) DB::table('krs_items')
            ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('krs_items.krs_submission_id', $submission->id)
            ->sum('courses.credits');

        $newTotal = $currentCredits + $courseClass->credits;
        if ($newTotal > ($submission->max_credits_allowed ?: 24)) {
            return response()->json([
                'success' => false, 
                'message' => "Gagal menambahkan mata kuliah: Batas maksimal SKS tercapai (Maks 24 SKS, saat ini: {$currentCredits}, tambah: {$courseClass->credits})."
            ], 422);
        }

        DB::transaction(function () use ($submission, $classId, $student, $newTotal) {
            DB::table('krs_items')->insert([
                'krs_submission_id' => $submission->id,
                'course_class_id' => $classId,
                'status' => $submission->status === 'DISETUJUI' ? 'DISETUJUI' : 'DRAFT',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('krs_submissions')->where('id', $submission->id)->update([
                'total_credits' => $newTotal,
                'updated_at' => now(),
            ]);

            if ($submission->status === 'DISETUJUI') {
                DB::table('class_enrollments')->updateOrInsert(
                    [
                        'course_class_id' => $classId,
                        'student_id' => $student->id,
                    ],
                    [
                        'status' => 'TERDAFTAR',
                        'enrolled_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id() ?? 1,
                'action' => 'KRS_ADMIN_ADD_COURSE',
                'target_entity' => 'KrsItem',
                'target_id' => (string) $classId,
                'details' => json_encode(['student_id' => $student->id, 'class_id' => $classId, 'credits' => $newTotal]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $data = $this->buildStudentKrsPayload($student, $periodId);
        return response()->json(array_merge([
            'success' => true,
            'message' => "Mata kuliah {$courseClass->course_name} ({$courseClass->credits} SKS) berhasil ditambahkan ke KRS!"
        ], $data));
    }

    /**
     * Tambahkan Beberapa Mata Kuliah Pilihan Sekaligus ke KRS Mahasiswa
     */
    public function batchAddSelected(Request $request, $studentId): JsonResponse
    {
        $student = User::where('role', 'mahasiswa')
            ->where(function ($q) use ($studentId) {
                $q->where('id', $studentId)
                  ->orWhere('identity_number', $studentId)
                  ->orWhere('username', $studentId);
            })
            ->firstOrFail();

        $classIds = $request->input('course_class_ids', []);
        if (empty($classIds) || !is_array($classIds)) {
            return response()->json(['success' => false, 'message' => 'Silakan pilih minimal satu mata kuliah.'], 422);
        }

        $periodId = (int) $request->input('academic_period_id', 1);

        $submission = DB::table('krs_submissions')
            ->where('student_id', $student->id)
            ->where('academic_period_id', $periodId)
            ->first();

        if (!$submission) {
            $subId = DB::table('krs_submissions')->insertGetId([
                'student_id' => $student->id,
                'academic_period_id' => $periodId,
                'total_credits' => 0,
                'max_credits_allowed' => 24,
                'status' => 'DISETUJUI',
                'academic_advisor_id' => $student->academic_advisor_id ?? 5,
                'submitted_at' => now(),
                'approved_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $submission = DB::table('krs_submissions')->where('id', $subId)->first();
        }

        $enrolledClassIds = DB::table('krs_items')
            ->where('krs_submission_id', $submission->id)
            ->pluck('course_class_id')
            ->toArray();

        $classesToAdd = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->whereIn('course_classes.id', $classIds)
            ->whereNotIn('course_classes.id', $enrolledClassIds)
            ->select('course_classes.id as class_id', 'courses.credits', 'courses.name as course_name')
            ->get();

        if ($classesToAdd->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Seluruh mata kuliah yang dipilih sudah ada di dalam KRS.'], 422);
        }

        $currentCredits = (float) DB::table('krs_items')
            ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('krs_items.krs_submission_id', $submission->id)
            ->sum('courses.credits');

        $additionalCredits = (float) $classesToAdd->sum('credits');
        $newTotal = $currentCredits + $additionalCredits;
        $maxAllowed = (float) ($submission->max_credits_allowed ?: 24);

        if ($newTotal > $maxAllowed) {
            return response()->json([
                'success' => false,
                'message' => "Gagal menambahkan: Total SKS akan menjadi {$newTotal} SKS, melebihi batas maksimal {$maxAllowed} SKS (Saat ini: {$currentCredits} SKS, Tambahan: {$additionalCredits} SKS)."
            ], 422);
        }

        $countAdded = 0;
        DB::transaction(function () use ($submission, $classesToAdd, $student, $newTotal, &$countAdded) {
            foreach ($classesToAdd as $cls) {
                DB::table('krs_items')->insert([
                    'krs_submission_id' => $submission->id,
                    'course_class_id' => $cls->class_id,
                    'status' => $submission->status === 'DISETUJUI' ? 'DISETUJUI' : 'DRAFT',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($submission->status === 'DISETUJUI') {
                    DB::table('class_enrollments')->updateOrInsert(
                        [
                            'course_class_id' => $cls->class_id,
                            'student_id' => $student->id,
                        ],
                        [
                            'status' => 'TERDAFTAR',
                            'enrolled_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }

                $countAdded++;
            }

            DB::table('krs_submissions')->where('id', $submission->id)->update([
                'total_credits' => $newTotal,
                'updated_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id() ?? 1,
                'action' => 'KRS_ADMIN_BATCH_ADD_SELECTED',
                'target_entity' => 'KrsSubmission',
                'target_id' => (string) $submission->id,
                'details' => json_encode([
                    'student_id' => $student->id,
                    'added_count' => $countAdded,
                    'additional_credits' => $classesToAdd->sum('credits'),
                    'total_credits' => $newTotal,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $data = $this->buildStudentKrsPayload($student, $periodId);
        return response()->json(array_merge([
            'success' => true,
            'message' => "Berhasil menambahkan {$countAdded} mata kuliah terpilih (+{$additionalCredits} SKS) ke dalam KRS!"
        ], $data));
    }

    /**
     * Hapus Mata Kuliah dari KRS Mahasiswa
     */
    public function removeCourseFromStudent(Request $request, $studentId): JsonResponse
    {
        $student = User::where('role', 'mahasiswa')
            ->where(function ($q) use ($studentId) {
                $q->where('id', $studentId)
                  ->orWhere('identity_number', $studentId)
                  ->orWhere('username', $studentId);
            })
            ->firstOrFail();

        $classId = (int) $request->input('course_class_id');
        $krsItemId = (int) $request->input('krs_item_id');
        $periodId = (int) $request->input('academic_period_id', 1);

        $submission = DB::table('krs_submissions')
            ->where('student_id', $student->id)
            ->where('academic_period_id', $periodId)
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Pengajuan KRS tidak ditemukan.'], 404);
        }

        DB::transaction(function () use ($submission, $classId, $krsItemId, $student) {
            if ($krsItemId) {
                $item = DB::table('krs_items')->where('id', $krsItemId)->first();
                $targetClassId = $item?->course_class_id ?: $classId;
                DB::table('krs_items')->where('id', $krsItemId)->delete();
            } else {
                $targetClassId = $classId;
                DB::table('krs_items')
                    ->where('krs_submission_id', $submission->id)
                    ->where('course_class_id', $classId)
                    ->delete();
            }

            if ($targetClassId) {
                DB::table('class_enrollments')
                    ->where('course_class_id', $targetClassId)
                    ->where('student_id', $student->id)
                    ->delete();
            }

            $remainingCredits = (float) DB::table('krs_items')
                ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->where('krs_items.krs_submission_id', $submission->id)
                ->sum('courses.credits');

            DB::table('krs_submissions')->where('id', $submission->id)->update([
                'total_credits' => $remainingCredits,
                'status' => $remainingCredits <= 0 ? 'BELUM_KRS' : $submission->status,
                'updated_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id() ?? 1,
                'action' => 'KRS_ADMIN_REMOVE_COURSE',
                'target_entity' => 'KrsItem',
                'target_id' => (string) $targetClassId,
                'details' => json_encode(['student_id' => $student->id, 'class_id' => $targetClassId, 'remaining_credits' => $remainingCredits]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $data = $this->buildStudentKrsPayload($student, $periodId);
        return response()->json(array_merge([
            'success' => true,
            'message' => 'Mata kuliah berhasil dihapus dari KRS mahasiswa.'
        ], $data));
    }

    /**
     * Ambil Paket Mata Kuliah Semester Sekaligus (Batch Enrollment)
     */
    public function batchAddPackage(Request $request, $studentId): JsonResponse
    {
        $student = User::where('role', 'mahasiswa')
            ->where(function ($q) use ($studentId) {
                $q->where('id', $studentId)
                  ->orWhere('identity_number', $studentId)
                  ->orWhere('username', $studentId);
            })
            ->firstOrFail();

        $semesterLevel = (int) $request->input('semester_level', 2);
        $periodId = (int) $request->input('academic_period_id', 1);

        $submission = DB::table('krs_submissions')
            ->where('student_id', $student->id)
            ->where('academic_period_id', $periodId)
            ->first();

        if (!$submission) {
            $subId = DB::table('krs_submissions')->insertGetId([
                'student_id' => $student->id,
                'academic_period_id' => $periodId,
                'total_credits' => 0,
                'max_credits_allowed' => 24,
                'status' => 'DISETUJUI',
                'academic_advisor_id' => $student->academic_advisor_id ?? 5,
                'submitted_at' => now(),
                'approved_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $submission = DB::table('krs_submissions')->where('id', $subId)->first();
        }

        // Ambil kelas semester level tersebut
        $prodiStr = $student->study_program;
        $studyProgram = DB::table('study_programs')
            ->where(function ($q) use ($prodiStr) {
                $q->where('name', $prodiStr)
                  ->orWhere('name', 'ilike', "%{$prodiStr}%")
                  ->orWhereRaw("? ILIKE '%' || name || '%'", [$prodiStr]);
            })
            ->first();

        $classes = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('course_classes.academic_period_id', $periodId)
            ->where('course_classes.status', 'AKTIF')
            ->where('courses.semester_level', $semesterLevel)
            ->when($studyProgram, function ($q) use ($studyProgram) {
                $q->where(function ($sq) use ($studyProgram) {
                    $sq->where('courses.study_program_id', $studyProgram->id)
                       ->orWhereNull('courses.study_program_id');
                });
            })
            ->select('course_classes.id as class_id', 'courses.credits')
            ->get();

        $addedCount = 0;
        DB::transaction(function () use ($submission, $classes, $student, &$addedCount) {
            $enrolled = DB::table('krs_items')->where('krs_submission_id', $submission->id)->pluck('course_class_id')->toArray();

            foreach ($classes as $cls) {
                if (!in_array($cls->class_id, $enrolled)) {
                    DB::table('krs_items')->insert([
                        'krs_submission_id' => $submission->id,
                        'course_class_id' => $cls->class_id,
                        'status' => 'DISETUJUI',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    DB::table('class_enrollments')->updateOrInsert(
                        [
                            'course_class_id' => $cls->class_id,
                            'student_id' => $student->id,
                        ],
                        [
                            'status' => 'TERDAFTAR',
                            'enrolled_at' => now(),
                            'updated_at' => now(),
                        ]
                    );

                    $addedCount++;
                }
            }

            $totalCredits = (float) DB::table('krs_items')
                ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->where('krs_items.krs_submission_id', $submission->id)
                ->sum('courses.credits');

            DB::table('krs_submissions')->where('id', $submission->id)->update([
                'total_credits' => $totalCredits,
                'status' => 'DISETUJUI',
                'updated_at' => now(),
            ]);
        });

        $data = $this->buildStudentKrsPayload($student, $periodId);
        return response()->json(array_merge([
            'success' => true,
            'message' => "Berhasil menambahkan paket Semester {$semesterLevel} ({$addedCount} mata kuliah baru) ke KRS mahasiswa!"
        ], $data));
    }

    /**
     * Ubah Status KRS Mahasiswa (Setujui / Revisi / Simpan Draf)
     */
    public function updateKrsStatus(Request $request, $studentId): JsonResponse
    {
        $student = User::where('role', 'mahasiswa')
            ->where(function ($q) use ($studentId) {
                $q->where('id', $studentId)
                  ->orWhere('identity_number', $studentId)
                  ->orWhere('username', $studentId);
            })
            ->firstOrFail();

        $newStatus = $request->input('status', 'DISETUJUI');
        $notes = $request->input('notes', '');
        $periodId = (int) $request->input('academic_period_id', 1);

        $submission = DB::table('krs_submissions')
            ->where('student_id', $student->id)
            ->where('academic_period_id', $periodId)
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'KRS belum dibuat untuk mahasiswa ini.'], 404);
        }

        DB::transaction(function () use ($submission, $newStatus, $notes, $student) {
            $updateData = [
                'status' => $newStatus,
                'updated_at' => now(),
            ];

            if ($newStatus === 'DISETUJUI') {
                $updateData['approved_at'] = now();
            } elseif ($newStatus === 'DITOLAK') {
                $updateData['advisor_notes'] = $notes;
            }

            DB::table('krs_submissions')->where('id', $submission->id)->update($updateData);

            DB::table('krs_items')->where('krs_submission_id', $submission->id)->update([
                'status' => $newStatus,
                'updated_at' => now(),
            ]);

            $items = DB::table('krs_items')->where('krs_submission_id', $submission->id)->pluck('course_class_id')->toArray();

            if ($newStatus === 'DISETUJUI') {
                foreach ($items as $clsId) {
                    DB::table('class_enrollments')->updateOrInsert(
                        ['course_class_id' => $clsId, 'student_id' => $student->id],
                        ['status' => 'TERDAFTAR', 'enrolled_at' => now(), 'updated_at' => now()]
                    );
                }
            } elseif ($newStatus === 'DITOLAK') {
                DB::table('class_enrollments')
                    ->where('student_id', $student->id)
                    ->whereIn('course_class_id', $items)
                    ->delete();
            }

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id() ?? 1,
                'action' => 'KRS_ADMIN_UPDATE_STATUS',
                'target_entity' => 'KrsSubmission',
                'target_id' => (string) $submission->id,
                'details' => json_encode(['student_id' => $student->id, 'status' => $newStatus, 'notes' => $notes]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        $data = $this->buildStudentKrsPayload($student, $periodId);
        return response()->json(array_merge([
            'success' => true,
            'message' => "Status KRS berhasil diubah menjadi {$newStatus}!"
        ], $data));
    }
}

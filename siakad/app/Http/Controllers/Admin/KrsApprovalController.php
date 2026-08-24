<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KrsApprovalController extends Controller
{
    /**
     * Tampilan Monitoring & Approval KRS Mahasiswa
     */
    public function index(Request $request): Response
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $statusFilter = $request->input('status');
        $search = $request->input('search');

        $submissions = DB::table('krs_submissions')
            ->join('users as students', 'krs_submissions.student_id', '=', 'students.id')
            ->leftJoin('users as advisors', 'krs_submissions.academic_advisor_id', '=', 'advisors.id')
            ->where('krs_submissions.academic_period_id', $activePeriod?->id ?? 1)
            ->when($statusFilter, fn($q) => $q->where('krs_submissions.status', $statusFilter))
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('students.name', 'ilike', "%{$search}%")
                        ->orWhere('students.identity_number', 'ilike', "%{$search}%")
                        ->orWhere('students.username', 'ilike', "%{$search}%");
                });
            })
            ->select(
                'krs_submissions.*',
                'students.name as student_name',
                'students.identity_number as student_nim',
                'students.email as student_email',
                'students.study_program',
                'advisors.name as advisor_name'
            )
            ->orderBy('krs_submissions.id', 'desc')
            ->get();

        // Ambil item KRS detail
        $submissionIds = $submissions->pluck('id')->toArray();
        $krsItems = DB::table('krs_items')
            ->join('course_classes', 'krs_items.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->whereIn('krs_items.krs_submission_id', $submissionIds)
            ->select(
                'krs_items.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'course_classes.name as class_name'
            )
            ->get()
            ->groupBy('krs_submission_id');

        // Tambahkan items ke masing-masing submission
        $submissionsWithItems = $submissions->map(function ($sub) use ($krsItems) {
            $sub->items = $krsItems[$sub->id] ?? [];
            return $sub;
        });

        // Statistik
        $totalSubmissions = count($submissions);
        $approvedCount = $submissions->where('status', 'DISETUJUI')->count();
        $pendingCount = $submissions->where('status', 'DIAJUKAN')->count();
        $draftCount = $submissions->where('status', 'DRAFT')->count();

        return Inertia::render('Admin/KrsApproval/Index', [
            'activePeriod' => $activePeriod,
            'submissions' => $submissionsWithItems,
            'stats' => [
                'total' => $totalSubmissions,
                'approved' => $approvedCount,
                'pending' => $pendingCount,
                'draft' => $draftCount,
            ],
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Setujui KRS Mahasiswa (Individual Approval)
     */
    public function approve($id): RedirectResponse
    {
        $submission = DB::table('krs_submissions')->where('id', $id)->first();
        if (!$submission) {
            return back()->with('error', 'Data pengajuan KRS tidak ditemukan.');
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
                'user_id' => auth()->id(),
                'action' => 'KRS_APPROVE',
                'target_entity' => 'KrsSubmission',
                'target_id' => (string) $submission->id,
                'details' => json_encode(['student_id' => $submission->student_id, 'credits' => $submission->total_credits]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', "KRS Mahasiswa berhasil disetujui ({$submission->total_credits} SKS) & otomatis ter-enroll ke kelas perkuliahan.");
    }

    /**
     * Tolak KRS dengan Catatan Revisi
     */
    public function reject(Request $request, $id): RedirectResponse
    {
        $notes = $request->input('notes', 'Silakan sesuaikan pilihan mata kuliah sesuai arahan Dosen PA.');

        DB::table('krs_submissions')->where('id', $id)->update([
            'status' => 'DITOLAK',
            'approval_notes' => $notes,
            'updated_at' => now(),
        ]);

        DB::table('krs_items')->where('krs_submission_id', $id)->update([
            'status' => 'DITOLAK',
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Pengajuan KRS berhasil ditolak dan dikembalikan ke mahasiswa untuk revisi.');
    }

    /**
     * Setujui Semua Pengajuan KRS yang Menunggu (Bulk Approval)
     */
    public function bulkApprove(Request $request): RedirectResponse
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $pendingSubmissions = DB::table('krs_submissions')
            ->where('academic_period_id', $activePeriod?->id ?? 1)
            ->where('status', 'DIAJUKAN')
            ->get();

        if ($pendingSubmissions->isEmpty()) {
            return back()->with('error', 'Tidak ada pengajuan KRS yang berstatus menunggu persetujuan.');
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

                // Enroll
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

        return back()->with('success', "Bulk Approval Berhasil! {$count} Pengajuan KRS mahasiswa telah disetujui sekaligus.");
    }
}

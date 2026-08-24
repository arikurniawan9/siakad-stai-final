<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KrsController extends Controller
{
    /**
     * Tampilan Halaman Pengisian KRS Online Mahasiswa
     */
    public function index(): Response
    {
        $user = Auth::user();

        // 1. Ambil Periode Aktif
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        // 2. FINANCIAL LOCK GUARD: Cek apakah ada tunggakan SPP belum lunas
        $hasUnpaidTuition = DB::table('student_invoices')
            ->where('user_id', $user->id)
            ->where('status', '!=', 'LUNAS')
            ->where('academic_period_id', $activePeriod?->id)
            ->exists();

        // 3. Ambil / Buat Submission KRS
        $krsSubmission = DB::table('krs_submissions')
            ->where('student_id', $user->id)
            ->where('academic_period_id', $activePeriod?->id)
            ->first();

        $selectedClassIds = [];
        if ($krsSubmission) {
            $selectedClassIds = DB::table('krs_items')
                ->where('krs_submission_id', $krsSubmission->id)
                ->pluck('course_class_id')
                ->toArray();
        }

        // 4. Daftar Penawaran Kelas Kuliah Semester Ini
        $offeredClasses = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('class_schedules', 'course_classes.id', '=', 'class_schedules.course_class_id')
            ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
            ->leftJoin('class_lecturers', function ($join) {
                $join->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                    ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $activePeriod?->id)
            ->select(
                'course_classes.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits as course_credits',
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

        return Inertia::render('Student/Krs/Index', [
            'activePeriod' => $activePeriod,
            'isFinancialLocked' => $hasUnpaidTuition,
            'krsSubmission' => $krsSubmission,
            'selectedClassIds' => $selectedClassIds,
            'offeredClasses' => $offeredClasses,
            'maxCreditsAllowed' => 24,
        ]);
    }

    /**
     * Simpan / Ajukan KRS Online ke Dosen PA
     */
    public function submit(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $classIds = $request->input('class_ids', []);

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        if (empty($classIds)) {
            return back()->with('error', 'Silakan pilih minimal 1 mata kuliah untuk disimpan ke KRS.');
        }

        // Hitung total SKS
        $totalCredits = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->whereIn('course_classes.id', $classIds)
            ->sum('courses.credits');

        if ($totalCredits > 24) {
            return back()->with('error', "Beban SKS melebihi batas maksimum 24 SKS (Total SKS dipilih: {$totalCredits} SKS).");
        }

        DB::transaction(function () use ($user, $activePeriod, $classIds, $totalCredits) {
            // 1. Buat / Update Submission KRS
            $submissionId = DB::table('krs_submissions')->updateOrInsert(
                [
                    'student_id' => $user->id,
                    'academic_period_id' => $activePeriod->id,
                ],
                [
                    'total_credits' => $totalCredits,
                    'max_credits_allowed' => 24,
                    'status' => 'DIAJUKAN',
                    'academic_advisor_id' => 5, // Dra. Hj. Siti Maryam (Dosen PA)
                    'submitted_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $submission = DB::table('krs_submissions')
                ->where('student_id', $user->id)
                ->where('academic_period_id', $activePeriod->id)
                ->first();

            // 2. Re-sync items
            DB::table('krs_items')->where('krs_submission_id', $submission->id)->delete();
            foreach ($classIds as $clsId) {
                DB::table('krs_items')->insert([
                    'krs_submission_id' => $submission->id,
                    'course_class_id' => $clsId,
                    'status' => 'DISETUJUI',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 3. Catat Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => $user->id,
                'action' => 'KRS_SUBMISSION',
                'ip_address' => request()->ip(),
                'target_entity' => 'KrsSubmission',
                'target_id' => (string) $submission->id,
                'details' => json_encode(['total_credits' => $totalCredits, 'class_count' => count($classIds)]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', "KRS berhasil diajukan ({$totalCredits} SKS) dan sedang menunggu persetujuan Dosen PA.");
    }
}

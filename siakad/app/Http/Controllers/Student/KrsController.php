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
        if (!$activePeriod) {
            return back()->with('error', 'Tidak ada periode akademik aktif saat ini.');
        }

        // 1. FINANCIAL LOCK GUARD SERVER-SIDE: Cek tunggakan SPP/UKT
        $hasUnpaidTuition = DB::table('student_invoices')
            ->where('user_id', $user->id)
            ->where('status', '!=', 'LUNAS')
            ->where('academic_period_id', $activePeriod->id)
            ->exists();

        if ($hasUnpaidTuition) {
            return back()->with('error', 'Akses Ditolak: Anda memiliki tagihan pembayaran SPP/UKT yang belum lunas. Pengisian KRS terkunci secara finansial.');
        }

        if (empty($classIds)) {
            return back()->with('error', 'Silakan pilih minimal 1 mata kuliah untuk disimpan ke KRS.');
        }

        // 2. Hitung total SKS & validasi batas beban
        $totalCredits = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->whereIn('course_classes.id', $classIds)
            ->sum('courses.credits');

        if ($totalCredits > 24) {
            return back()->with('error', "Beban SKS melebihi batas maksimum 24 SKS (Total SKS dipilih: {$totalCredits} SKS).");
        }

        // 3. Validasi Kapasitas Kuota Kelas
        foreach ($classIds as $clsId) {
            $class = DB::table('course_classes')->find($clsId);
            if ($class) {
                $enrolledCount = DB::table('krs_items')
                    ->join('krs_submissions', 'krs_items.krs_submission_id', '=', 'krs_submissions.id')
                    ->where('krs_items.course_class_id', $clsId)
                    ->where('krs_submissions.academic_period_id', $activePeriod->id)
                    ->where('krs_submissions.student_id', '!=', $user->id)
                    ->count();

                if ($enrolledCount >= $class->capacity) {
                    $course = DB::table('courses')->find($class->course_id);
                    return back()->with('error', "Kapasitas kelas {$class->name} ({$course?->name}) sudah penuh ({$class->capacity} mahasiswa). Silakan pilih kelas paralel lain.");
                }
            }
        }

        // 4. Validasi Anti-Clash (Jadwal Bentrok)
        $schedules = DB::table('class_schedules')
            ->whereIn('course_class_id', $classIds)
            ->get();

        for ($i = 0; $i < count($schedules); $i++) {
            for ($j = $i + 1; $j < count($schedules); $j++) {
                $s1 = $schedules[$i];
                $s2 = $schedules[$j];
                if (
                    $s1->day_of_week === $s2->day_of_week &&
                    !$s1->is_online && !$s2->is_online &&
                    $s1->start_time < $s2->end_time &&
                    $s2->start_time < $s1->end_time
                ) {
                    $c1 = DB::table('course_classes')->join('courses', 'course_classes.course_id', '=', 'courses.id')->where('course_classes.id', $s1->course_class_id)->select('courses.name as course_name', 'course_classes.name as class_name')->first();
                    $c2 = DB::table('course_classes')->join('courses', 'course_classes.course_id', '=', 'courses.id')->where('course_classes.id', $s2->course_class_id)->select('courses.name as course_name', 'course_classes.name as class_name')->first();
                    return back()->with('error', "Jadwal bentrok pada hari {$s1->day_of_week} antara {$c1?->course_name} ({$c1?->class_name}) dan {$c2?->course_name} ({$c2?->class_name}). Silakan pilih kelas dengan jadwal lain.");
                }
            }
        }

        // 5. Tentukan Dosen PA secara dinamis
        $advisorId = $user->academic_advisor_id;
        if (!$advisorId) {
            $advisor = DB::table('users')
                ->where('role', 'dosen_pa')
                ->where(function ($q) use ($user) {
                    $q->where('study_program', $user->study_program)
                      ->orWhere('study_program', 'LIKE', "%{$user->study_program}%");
                })
                ->first();
            $advisorId = $advisor?->id ?? 5;
        }

        DB::transaction(function () use ($user, $activePeriod, $classIds, $totalCredits, $advisorId) {
            // 1. Buat / Update Submission KRS
            DB::table('krs_submissions')->updateOrInsert(
                [
                    'student_id' => $user->id,
                    'academic_period_id' => $activePeriod->id,
                ],
                [
                    'total_credits' => $totalCredits,
                    'max_credits_allowed' => 24,
                    'status' => 'DIAJUKAN',
                    'academic_advisor_id' => $advisorId,
                    'submitted_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $submission = DB::table('krs_submissions')
                ->where('student_id', $user->id)
                ->where('academic_period_id', $activePeriod->id)
                ->first();

            // 2. Re-sync items dengan status TERDAFTAR (menunggu persetujuan dosen PA)
            DB::table('krs_items')->where('krs_submission_id', $submission->id)->delete();
            foreach ($classIds as $clsId) {
                DB::table('krs_items')->insert([
                    'krs_submission_id' => $submission->id,
                    'course_class_id' => $clsId,
                    'status' => 'TERDAFTAR',
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
                'details' => json_encode(['total_credits' => $totalCredits, 'class_count' => count($classIds), 'advisor_id' => $advisorId]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', "KRS berhasil diajukan ({$totalCredits} SKS) dan sedang menunggu persetujuan Dosen PA.");
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Tampilan Matriks Penjadwalan & Anti-Clash Scheduler
     */
    public function index(Request $request): Response
    {
        $academicPeriods = DB::table('academic_periods')->orderBy('start_date', 'desc')->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $selectedPeriodId = $request->input('period_id', $activePeriod?->id ?? 1);

        $studyPrograms = DB::table('study_programs')->select('id', 'code', 'name', 'degree')->orderBy('id', 'asc')->get();
        $curricula = DB::table('curricula')->select('id', 'code', 'name', 'study_program_id')->where('is_active', true)->orderBy('id', 'asc')->get();

        // Ambil semua matakuliah untuk dropdown form input cepat
        $courses = DB::table('courses')
            ->select('id', 'code', 'name', 'credits', 'semester_level', 'study_program_id')
            ->orderBy('code', 'asc')
            ->get();

        // Ambil daftar dosen untuk pengawas / pengajar
        $lecturers = DB::table('users')
            ->whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
            ->select('id', 'identity_number', 'name', 'email')
            ->orderBy('name', 'asc')
            ->get();

        // Ambil semua gedung dan ruang
        $buildings = DB::table('buildings')->orderBy('id', 'asc')->get();
        $rooms = DB::table('rooms')
            ->join('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->select('rooms.*', 'buildings.name as building_name')
            ->orderBy('rooms.code', 'asc')
            ->get();

        // Ambil semua kelas kuliah pada periode ini
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
                'courses.study_program_id',
                'lecturers.id as lecturer_id',
                'lecturers.name as lecturer_name',
                'lecturers.identity_number as lecturer_nidn',
                DB::raw('(SELECT COUNT(*) FROM class_enrollments WHERE class_enrollments.course_class_id = course_classes.id) as enrolled_count')
            )
            ->orderBy('courses.code', 'asc')
            ->get();

        // Ambil semua jadwal
        $schedules = DB::table('class_schedules')
            ->join('course_classes', 'class_schedules.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->join('rooms', 'class_schedules.room_id', '=', 'rooms.id')
            ->join('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $selectedPeriodId)
            ->select(
                'class_schedules.*',
                'course_classes.name as class_name',
                'course_classes.code as class_code',
                'course_classes.capacity as class_capacity',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'courses.study_program_id',
                'study_programs.name as study_program_name',
                'study_programs.code as study_program_code',
                'rooms.name as room_name',
                'rooms.code as room_code',
                'rooms.floor_number as room_floor',
                'rooms.capacity as room_capacity',
                'buildings.name as building_name',
                'lecturers.id as lecturer_id',
                'lecturers.name as lecturer_name',
                'lecturers.identity_number as lecturer_nidn',
                DB::raw('(SELECT COUNT(*) FROM class_enrollments WHERE class_enrollments.course_class_id = course_classes.id) as enrolled_count')
            )
            ->orderBy('class_schedules.day_of_week', 'asc')
            ->orderBy('class_schedules.start_time', 'asc')
            ->get();

        // Ambil semua jadwal ujian (UTS / UAS)
        $examSchedules = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->leftJoin('exam_schedules', function ($j) {
                $j->on('course_classes.id', '=', 'exam_schedules.course_class_id');
            })
            ->leftJoin('rooms', 'exam_schedules.room_id', '=', 'rooms.id')
            ->leftJoin('buildings', 'rooms.building_id', '=', 'buildings.id')
            ->leftJoin('users as invigilators', 'exam_schedules.invigilator_id', '=', 'invigilators.id')
            ->where('course_classes.academic_period_id', $selectedPeriodId)
            ->select(
                'course_classes.id as course_class_id',
                'course_classes.name as class_name',
                'course_classes.code as class_code',
                'course_classes.capacity as class_capacity',
                'courses.id as course_id',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'courses.study_program_id',
                'study_programs.name as study_program_name',
                'exam_schedules.id as exam_schedule_id',
                'exam_schedules.exam_type',
                'exam_schedules.exam_date',
                'exam_schedules.start_time as exam_start_time',
                'exam_schedules.end_time as exam_end_time',
                'exam_schedules.room_id',
                'exam_schedules.invigilator_id',
                'exam_schedules.notes as exam_notes',
                'rooms.code as room_code',
                'rooms.name as room_name',
                'rooms.floor_number as room_floor',
                'buildings.name as building_name',
                'invigilators.name as invigilator_name',
                DB::raw('(SELECT COUNT(*) FROM class_enrollments WHERE class_enrollments.course_class_id = course_classes.id) as enrolled_count')
            )
            ->orderBy('courses.code', 'asc')
            ->orderBy('course_classes.name', 'asc')
            ->get();

        // Ambil data presensi kelas untuk Tab 3
        $attendanceClasses = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.academic_period_id', $selectedPeriodId)
            ->select(
                'course_classes.id as course_class_id',
                'course_classes.name as class_name',
                'course_classes.code as class_code',
                'course_classes.capacity as class_capacity',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'courses.study_program_id',
                'study_programs.name as study_program_name',
                'lecturers.name as lecturer_name',
                'lecturers.identity_number as lecturer_nidn',
                DB::raw('(SELECT COUNT(*) FROM class_enrollments WHERE class_enrollments.course_class_id = course_classes.id) as enrolled_count'),
                DB::raw('(SELECT COUNT(*) FROM class_meetings WHERE class_meetings.course_class_id = course_classes.id) as meetings_count'),
                DB::raw('(SELECT COUNT(*) FROM student_attendances sa JOIN class_meetings cm ON sa.class_meeting_id = cm.id WHERE cm.course_class_id = course_classes.id AND sa.status = \'HADIR\') as present_count'),
                DB::raw('(SELECT COUNT(*) FROM student_attendances sa JOIN class_meetings cm ON sa.class_meeting_id = cm.id WHERE cm.course_class_id = course_classes.id) as total_attendance_records')
            )
            ->orderBy('courses.code', 'asc')
            ->orderBy('course_classes.name', 'asc')
            ->get();

        // Kelas aktif untuk Lembar Presensi 16 Pertemuan (sesuai jadwal-presensikelas.png)
        $selectedClassId = $request->input('class_id', $attendanceClasses->first()?->course_class_id ?? null);
        $selectedClass = null;
        $attendanceStudents = collect([]);
        $attendanceMatrix = [];

        if ($selectedClassId) {
            $selectedClass = DB::table('course_classes')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
                ->leftJoin('class_lecturers', function ($j) {
                    $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                      ->where('class_lecturers.is_primary', true);
                })
                ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
                ->leftJoin('class_schedules', 'course_classes.id', '=', 'class_schedules.course_class_id')
                ->leftJoin('rooms', 'class_schedules.room_id', '=', 'rooms.id')
                ->leftJoin('buildings', 'rooms.building_id', '=', 'buildings.id')
                ->where('course_classes.id', $selectedClassId)
                ->select(
                    'course_classes.*',
                    'courses.code as course_code',
                    'courses.name as course_name',
                    'courses.credits',
                    'courses.semester_level',
                    'study_programs.name as study_program_name',
                    'study_programs.code as study_program_code',
                    'lecturers.name as lecturer_name',
                    'lecturers.identity_number as lecturer_nidn',
                    'class_schedules.day_of_week',
                    'class_schedules.start_time',
                    'class_schedules.end_time',
                    'rooms.code as room_code',
                    'rooms.name as room_name',
                    'rooms.floor_number as room_floor',
                    'buildings.name as building_name'
                )
                ->first();

            $attendanceStudents = DB::table('class_enrollments')
                ->join('users', 'class_enrollments.student_id', '=', 'users.id')
                ->where('class_enrollments.course_class_id', $selectedClassId)
                ->select(
                    'users.id as student_id',
                    'users.identity_number as nim',
                    'users.name as student_name',
                    'users.study_program as study_program_name'
                )
                ->orderBy('users.identity_number', 'asc')
                ->get();

            $records = DB::table('student_attendances')
                ->join('class_meetings', 'student_attendances.class_meeting_id', '=', 'class_meetings.id')
                ->where('class_meetings.course_class_id', $selectedClassId)
                ->select('student_attendances.student_id', 'class_meetings.meeting_number', 'student_attendances.status')
                ->get();

            foreach ($records as $r) {
                $short = match ($r->status) {
                    'HADIR' => 'H',
                    'SAKIT' => 'S',
                    'IZIN' => 'I',
                    'ALPA' => 'A',
                    default => '-',
                };
                $attendanceMatrix[$r->student_id][$r->meeting_number] = $short;
            }
        }

        // Deteksi Bentrok (Anti-Clash Engine)
        $conflicts = $this->detectAllConflicts($schedules);

        return Inertia::render('Admin/Schedules/Index', [
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'selectedPeriodId' => (int) $selectedPeriodId,
            'studyPrograms' => $studyPrograms,
            'curricula' => $curricula,
            'courses' => $courses,
            'lecturers' => $lecturers,
            'buildings' => $buildings,
            'rooms' => $rooms,
            'classes' => $classes,
            'schedules' => $schedules,
            'examSchedules' => $examSchedules,
            'attendanceClasses' => $attendanceClasses,
            'selectedClassId' => $selectedClassId ? (int) $selectedClassId : null,
            'selectedClass' => $selectedClass,
            'attendanceStudents' => $attendanceStudents,
            'attendanceMatrix' => $attendanceMatrix,
            'conflicts' => $conflicts,
        ]);
    }

    /**
     * API Cek Bentrok Realtime Sebelum Disimpan
     */
    public function checkConflict(Request $request): JsonResponse
    {
        $roomId = $request->input('room_id');
        $courseClassId = $request->input('course_class_id');
        $day = $request->input('day_of_week');
        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');
        $excludeScheduleId = $request->input('exclude_schedule_id');

        // Ambil info dosen pengajar kelas ini
        $lecturerId = DB::table('class_lecturers')
            ->where('course_class_id', $courseClassId)
            ->where('is_primary', true)
            ->value('lecturer_id');

        // 1. Cek bentrok Ruangan
        $roomClash = DB::table('class_schedules')
            ->join('course_classes', 'class_schedules.course_class_id', '=', 'course_classes.id')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->where('class_schedules.room_id', $roomId)
            ->where('class_schedules.day_of_week', $day)
            ->when($excludeScheduleId, fn($q) => $q->where('class_schedules.id', '!=', $excludeScheduleId))
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($sub) use ($startTime, $endTime) {
                      $sub->where('start_time', '<=', $startTime)
                          ->where('end_time', '>=', $endTime);
                  });
            })
            ->select('class_schedules.*', 'course_classes.name as class_name', 'courses.name as course_name')
            ->first();

        // 2. Cek bentrok Dosen
        $lecturerClash = null;
        if ($lecturerId) {
            $lecturerClash = DB::table('class_schedules')
                ->join('course_classes', 'class_schedules.course_class_id', '=', 'course_classes.id')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->join('class_lecturers', 'course_classes.id', '=', 'class_lecturers.course_class_id')
                ->join('users', 'class_lecturers.lecturer_id', '=', 'users.id')
                ->where('class_lecturers.lecturer_id', $lecturerId)
                ->where('class_schedules.day_of_week', $day)
                ->when($excludeScheduleId, fn($q) => $q->where('class_schedules.id', '!=', $excludeScheduleId))
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->whereBetween('start_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function ($sub) use ($startTime, $endTime) {
                          $sub->where('start_time', '<=', $startTime)
                              ->where('end_time', '>=', $endTime);
                      });
                })
                ->select('class_schedules.*', 'course_classes.name as class_name', 'courses.name as course_name', 'users.name as lecturer_name')
                ->first();
        }

        $hasConflict = $roomClash !== null || $lecturerClash !== null;

        return response()->json([
            'has_conflict' => $hasConflict,
            'room_clash' => $roomClash,
            'lecturer_clash' => $lecturerClash,
            'message' => $hasConflict 
                ? 'Terdeteksi jadwal bentrok pada waktu yang dipilih!' 
                : 'Jadwal aman, tidak ditemukan bentrok ruangan maupun dosen.',
        ]);
    }

    /**
     * Tambah / Plotting Jadwal Perkuliahan
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_class_id' => ['required', 'exists:course_classes,id'],
            'room_id' => ['required', 'exists:rooms,id'],
            'day_of_week' => ['required', 'string', 'in:SENIN,SELASA,RABU,KAMIS,JUMAT,SABTU,AHAD'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_online' => ['nullable', 'boolean'],
            'online_meeting_url' => ['nullable', 'url'],
            'allow_clash_override' => ['nullable', 'boolean'],
        ]);

        // Cek bentrok jika override tidak diizinkan
        if (empty($validated['allow_clash_override'])) {
            $conflictCheck = $this->checkConflict(new Request($validated))->getData();
            if ($conflictCheck->has_conflict) {
                $reason = $conflictCheck->room_clash 
                    ? "Ruangan sudah dipakai oleh {$conflictCheck->room_clash->course_name} ({$conflictCheck->room_clash->start_time}-{$conflictCheck->room_clash->end_time})."
                    : "Dosen pengampu sudah memiliki jadwal mengajar pada jam tersebut ({$conflictCheck->lecturer_clash->course_name}).";
                return back()->with('error', "Gagal menyimpan! Deteksi Bentrok: {$reason}");
            }
        }

        DB::table('class_schedules')->insert([
            'course_class_id' => $validated['course_class_id'],
            'room_id' => $validated['room_id'],
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'] . ':00',
            'end_time' => $validated['end_time'] . ':00',
            'is_online' => $validated['is_online'] ?? false,
            'online_meeting_url' => $validated['online_meeting_url'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Jadwal perkuliahan berhasil diplot dan disimpan.');
    }

    /**
     * Update Plotting Jadwal Perkuliahan
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'course_class_id' => ['required', 'exists:course_classes,id'],
            'room_id' => ['required', 'exists:rooms,id'],
            'day_of_week' => ['required', 'string', 'in:SENIN,SELASA,RABU,KAMIS,JUMAT,SABTU,AHAD'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_online' => ['nullable', 'boolean'],
            'online_meeting_url' => ['nullable', 'url'],
            'allow_clash_override' => ['nullable', 'boolean'],
        ]);

        if (empty($validated['allow_clash_override'])) {
            $checkReq = new Request(array_merge($validated, ['exclude_schedule_id' => $id]));
            $conflictCheck = $this->checkConflict($checkReq)->getData();
            if ($conflictCheck->has_conflict) {
                $reason = $conflictCheck->room_clash 
                    ? "Ruangan sudah dipakai oleh {$conflictCheck->room_clash->course_name} ({$conflictCheck->room_clash->start_time}-{$conflictCheck->room_clash->end_time})."
                    : "Dosen pengampu sudah memiliki jadwal mengajar pada jam tersebut ({$conflictCheck->lecturer_clash->course_name}).";
                return back()->with('error', "Gagal memperbarui! Deteksi Bentrok: {$reason}");
            }
        }

        DB::table('class_schedules')->where('id', $id)->update([
            'course_class_id' => $validated['course_class_id'],
            'room_id' => $validated['room_id'],
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'] . ':00',
            'end_time' => $validated['end_time'] . ':00',
            'is_online' => $validated['is_online'] ?? false,
            'online_meeting_url' => $validated['online_meeting_url'] ?? null,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Jadwal perkuliahan berhasil diperbarui.');
    }

    /**
     * Hapus Jadwal Perkuliahan
     */
    public function destroy($id): RedirectResponse
    {
        DB::table('class_schedules')->where('id', $id)->delete();
        return back()->with('success', 'Jadwal perkuliahan berhasil dihapus.');
    }

    /**
     * Tambah Jadwal Cepat (Sesuai Referensi jadwalkelas.png)
     */
    public function storeQuick(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_period_id' => ['required', 'exists:academic_periods,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'class_code' => ['required', 'string', 'max:64'],
            'capacity' => ['required', 'integer', 'min:1', 'max:200'],
            'room_id' => ['required', 'exists:rooms,id'],
            'day_of_week' => ['required', 'string', 'in:SENIN,SELASA,RABU,KAMIS,JUMAT,SABTU,AHAD'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        // Cari atau buat course_class
        $class = DB::table('course_classes')
            ->where('academic_period_id', $validated['academic_period_id'])
            ->where('course_id', $validated['course_id'])
            ->where('code', $validated['class_code'])
            ->first();

        if (!$class) {
            $classId = DB::table('course_classes')->insertGetId([
                'academic_period_id' => $validated['academic_period_id'],
                'course_id' => $validated['course_id'],
                'code' => $validated['class_code'],
                'name' => 'Kelas ' . $validated['class_code'],
                'capacity' => $validated['capacity'],
                'delivery_mode' => 'TATAP_MUKA',
                'status' => 'AKTIF',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $classId = $class->id;
        }

        // Cek bentrok jadwal
        $checkReq = new Request([
            'room_id' => $validated['room_id'],
            'course_class_id' => $classId,
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);
        $conflictCheck = $this->checkConflict($checkReq)->getData();
        if ($conflictCheck->has_conflict) {
            $reason = $conflictCheck->room_clash 
                ? "Ruangan sudah dipakai oleh {$conflictCheck->room_clash->course_name} ({$conflictCheck->room_clash->start_time}-{$conflictCheck->room_clash->end_time})."
                : "Dosen pengampu sudah memiliki jadwal mengajar pada jam tersebut.";
            return back()->with('error', "Gagal menambahkan jadwal kelas! Deteksi Bentrok: {$reason}");
        }

        DB::table('class_schedules')->insert([
            'course_class_id' => $classId,
            'room_id' => $validated['room_id'],
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'] . ':00',
            'end_time' => $validated['end_time'] . ':00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Jadwal kelas {$validated['class_code']} berhasil ditambahkan ke sistem.");
    }

    /**
     * Plotting / Simpan Jadwal Ujian (UTS / UAS - Sesuai Referensi jadwalujian.png)
     */
    public function storeExam(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_period_id' => ['required', 'exists:academic_periods,id'],
            'course_class_id' => ['required', 'exists:course_classes,id'],
            'exam_type' => ['required', 'in:UTS,UAS'],
            'exam_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'room_id' => ['nullable', 'exists:rooms,id'],
            'invigilator_id' => ['nullable', 'exists:users,id'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        DB::table('exam_schedules')->updateOrInsert(
            [
                'course_class_id' => $validated['course_class_id'],
                'exam_type' => $validated['exam_type'],
            ],
            [
                'academic_period_id' => $validated['academic_period_id'],
                'exam_date' => $validated['exam_date'],
                'start_time' => $validated['start_time'] . ':00',
                'end_time' => $validated['end_time'] . ':00',
                'room_id' => $validated['room_id'] ?? null,
                'invigilator_id' => $validated['invigilator_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'updated_at' => now(),
            ]
        );

        return back()->with('success', "Jadwal Ujian {$validated['exam_type']} berhasil disimpan.");
    }

    /**
     * Hapus Jadwal Ujian
     */
    public function destroyExam($id): RedirectResponse
    {
        DB::table('exam_schedules')->where('id', $id)->delete();
        return back()->with('success', 'Jadwal ujian berhasil dihapus.');
    }

    /**
     * API Data Presensi Mahasiswa per Kelas (Pertemuan 1 - 16)
     */
    public function getAttendanceData($courseClassId): JsonResponse
    {
        $class = DB::table('course_classes')
            ->join('courses', 'course_classes.course_id', '=', 'courses.id')
            ->leftJoin('study_programs', 'courses.study_program_id', '=', 'study_programs.id')
            ->leftJoin('class_lecturers', function ($j) {
                $j->on('course_classes.id', '=', 'class_lecturers.course_class_id')
                  ->where('class_lecturers.is_primary', true);
            })
            ->leftJoin('users as lecturers', 'class_lecturers.lecturer_id', '=', 'lecturers.id')
            ->where('course_classes.id', $courseClassId)
            ->select(
                'course_classes.*',
                'courses.code as course_code',
                'courses.name as course_name',
                'courses.credits',
                'courses.semester_level',
                'study_programs.name as study_program_name',
                'lecturers.name as lecturer_name'
            )
            ->first();

        if (!$class) {
            return response()->json(['error' => 'Kelas tidak ditemukan'], 404);
        }

        // Mahasiswa terdaftar pada kelas ini
        $students = DB::table('class_enrollments')
            ->join('users', 'class_enrollments.student_id', '=', 'users.id')
            ->where('class_enrollments.course_class_id', $courseClassId)
            ->select('users.id', 'users.identity_number as nim', 'users.name', 'users.email')
            ->orderBy('users.identity_number', 'asc')
            ->get();

        // Pertemuan perkuliahan yang telah diinput
        $meetings = DB::table('class_meetings')
            ->where('course_class_id', $courseClassId)
            ->orderBy('meeting_number', 'asc')
            ->get();

        // Rekap catatan kehadiran
        $attendances = DB::table('student_attendances')
            ->join('class_meetings', 'student_attendances.class_meeting_id', '=', 'class_meetings.id')
            ->where('class_meetings.course_class_id', $courseClassId)
            ->select('student_attendances.*', 'class_meetings.meeting_number')
            ->get();

        return response()->json([
            'class' => $class,
            'students' => $students,
            'meetings' => $meetings,
            'attendances' => $attendances,
        ]);
    }

    /**
     * Simpan Presensi Pertemuan Mahasiswa
     */
    public function storeAttendance(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'course_class_id' => ['required', 'exists:course_classes,id'],
            'meeting_number' => ['required', 'integer', 'min:1', 'max:16'],
            'meeting_date' => ['required', 'date'],
            'topic' => ['nullable', 'string', 'max:255'],
            'delivery_mode' => ['required', 'in:TATAP_MUKA,DARING'],
            'attendances' => ['required', 'array'],
            'attendances.*.student_id' => ['required', 'exists:users,id'],
            'attendances.*.status' => ['required', 'in:HADIR,SAKIT,IZIN,ALPA'],
            'attendances.*.notes' => ['nullable', 'string', 'max:255'],
        ]);

        // Cari atau buat pertemuan
        $meeting = DB::table('class_meetings')
            ->where('course_class_id', $validated['course_class_id'])
            ->where('meeting_number', $validated['meeting_number'])
            ->first();

        if ($meeting) {
            $meetingId = $meeting->id;
            DB::table('class_meetings')->where('id', $meetingId)->update([
                'meeting_date' => $validated['meeting_date'],
                'topic' => $validated['topic'] ?? null,
                'delivery_mode' => $validated['delivery_mode'],
                'updated_at' => now(),
            ]);
        } else {
            $meetingId = DB::table('class_meetings')->insertGetId([
                'course_class_id' => $validated['course_class_id'],
                'meeting_number' => $validated['meeting_number'],
                'meeting_date' => $validated['meeting_date'],
                'topic' => $validated['topic'] ?? null,
                'delivery_mode' => $validated['delivery_mode'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Upsert presensi setiap mahasiswa
        foreach ($validated['attendances'] as $att) {
            DB::table('student_attendances')->updateOrInsert(
                [
                    'class_meeting_id' => $meetingId,
                    'student_id' => $att['student_id'],
                ],
                [
                    'status' => $att['status'],
                    'notes' => $att['notes'] ?? null,
                    'updated_at' => now(),
                ]
            );
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Presensi Pertemuan ke-{$validated['meeting_number']} berhasil disimpan."
            ]);
        }

        return back()->with('success', "Presensi Pertemuan ke-{$validated['meeting_number']} berhasil disimpan.");
    }

    /**
     * Simpan Seluruh Matriks Presensi 16 Pertemuan (sesuai jadwal-presensikelas.png)
     */
    public function storeAttendanceMatrix(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'course_class_id' => ['required', 'exists:course_classes,id'],
            'matrix' => ['required', 'array'],
        ]);

        $classId = $validated['course_class_id'];
        $matrix = $validated['matrix'];

        $existingMeetings = DB::table('class_meetings')
            ->where('course_class_id', $classId)
            ->pluck('id', 'meeting_number')
            ->toArray();

        $meetingIds = [];
        for ($m = 1; $m <= 16; $m++) {
            if (isset($existingMeetings[$m])) {
                $meetingIds[$m] = $existingMeetings[$m];
            } else {
                $meetingIds[$m] = DB::table('class_meetings')->insertGetId([
                    'course_class_id' => $classId,
                    'meeting_number' => $m,
                    'meeting_date' => now()->toDateString(),
                    'delivery_mode' => 'TATAP_MUKA',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        foreach ($matrix as $studentId => $meetings) {
            foreach ($meetings as $meetingNum => $status) {
                if (!$status || $status === '-') continue;
                $meetingId = $meetingIds[$meetingNum] ?? null;
                if (!$meetingId) continue;

                $fullStatus = match (strtoupper($status)) {
                    'H', 'HADIR' => 'HADIR',
                    'S', 'SAKIT' => 'SAKIT',
                    'I', 'IZIN' => 'IZIN',
                    'A', 'ALPA', 'ALPHA' => 'ALPA',
                    default => 'HADIR',
                };

                DB::table('student_attendances')->updateOrInsert(
                    [
                        'class_meeting_id' => $meetingId,
                        'student_id' => $studentId,
                    ],
                    [
                        'status' => $fullStatus,
                        'updated_at' => now(),
                    ]
                );
            }
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Data presensi 16 pertemuan berhasil disimpan.']);
        }

        return back()->with('success', 'Data presensi 16 pertemuan berhasil disimpan.');
    }

    /**
     * Anti-Clash Analysis Algorithm
     */
    private function detectAllConflicts($schedules): array
    {
        $conflicts = [];
        $count = count($schedules);

        for ($i = 0; $i < $count; $i++) {
            for ($j = $i + 1; $j < $count; $j++) {
                $a = $schedules[$i];
                $b = $schedules[$j];

                if ($a->day_of_week !== $b->day_of_week) continue;

                // Time overlap condition
                $aStart = strtotime($a->start_time);
                $aEnd = strtotime($a->end_time);
                $bStart = strtotime($b->start_time);
                $bEnd = strtotime($b->end_time);

                $overlap = ($aStart < $bEnd) && ($bStart < $aEnd);

                if ($overlap) {
                    // Check Room clash
                    if ($a->room_id === $b->room_id) {
                        $conflicts[] = [
                            'type' => 'ROOM_CLASH',
                            'day' => $a->day_of_week,
                            'room_name' => $a->room_name,
                            'schedule_a_id' => $a->id,
                            'schedule_b_id' => $b->id,
                            'course_a' => $a->course_name,
                            'course_b' => $b->course_name,
                            'time_a' => "{$a->start_time} - {$a->end_time}",
                            'time_b' => "{$b->start_time} - {$b->end_time}",
                            'message' => "Bentrok Ruang ({$a->room_name}): {$a->course_name} vs {$b->course_name}",
                        ];
                    }

                    // Check Lecturer clash
                    if ($a->lecturer_id && $b->lecturer_id && ($a->lecturer_id === $b->lecturer_id)) {
                        $conflicts[] = [
                            'type' => 'LECTURER_CLASH',
                            'day' => $a->day_of_week,
                            'lecturer_name' => $a->lecturer_name,
                            'schedule_a_id' => $a->id,
                            'schedule_b_id' => $b->id,
                            'course_a' => $a->course_name,
                            'course_b' => $b->course_name,
                            'time_a' => "{$a->start_time} - {$a->end_time}",
                            'time_b' => "{$b->start_time} - {$b->end_time}",
                            'message' => "Bentrok Dosen ({$a->lecturer_name}): Mengajar {$a->course_name} & {$b->course_name} bersamaan",
                        ];
                    }
                }
            }
        }

        return $conflicts;
    }
}

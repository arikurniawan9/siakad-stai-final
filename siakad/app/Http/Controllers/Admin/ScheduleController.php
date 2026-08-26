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
                'lecturers.name as lecturer_name'
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
                'rooms.capacity as room_capacity',
                'buildings.name as building_name',
                'lecturers.id as lecturer_id',
                'lecturers.name as lecturer_name'
            )
            ->orderBy('class_schedules.day_of_week', 'asc')
            ->orderBy('class_schedules.start_time', 'asc')
            ->get();

        // Deteksi Bentrok (Anti-Clash Engine)
        $conflicts = $this->detectAllConflicts($schedules);

        return Inertia::render('Admin/Schedules/Index', [
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'selectedPeriodId' => (int) $selectedPeriodId,
            'studyPrograms' => $studyPrograms,
            'buildings' => $buildings,
            'rooms' => $rooms,
            'classes' => $classes,
            'schedules' => $schedules,
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

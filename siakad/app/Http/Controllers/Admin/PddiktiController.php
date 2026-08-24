<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PddiktiController extends Controller
{
    /**
     * Tampilan Utama Modul PDDIKTI Neo Feeder Sync Connector
     */
    public function index(): Response
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        // 1. Data Statistik Pelaporan PDDIKTI
        $totalStudents = DB::table('users')->where('role', 'mahasiswa')->count();
        $totalLecturers = DB::table('users')->whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])->count();
        $totalCourses = DB::table('courses')->count();
        $totalClasses = DB::table('course_classes')->count();
        $totalKrsItems = DB::table('krs_items')->count();
        $totalGrades = DB::table('course_grades')->count();

        // 2. Log Riwayat Validasi & Kirim Feeder
        $syncLogs = DB::table('pddikti_sync_logs')
            ->orderBy('id', 'desc')
            ->limit(15)
            ->get();

        // 3. Konfigurasi Feeder dari system_settings
        $feederUrl = DB::table('system_settings')->where('key', 'pddikti_feeder_url')->value('value') ?? 'http://localhost:8100/ws/live.php?json';
        $feederToken = DB::table('system_settings')->where('key', 'pddikti_feeder_token')->value('value') ?? 'mock_pddikti_token_stai_alittihad_2026';
        $feederMode = DB::table('system_settings')->where('key', 'pddikti_mode')->value('value') ?? 'SANDBOX';

        return Inertia::render('Admin/Pddikti/Index', [
            'activePeriod' => $activePeriod,
            'stats' => [
                'total_students' => $totalStudents,
                'total_lecturers' => $totalLecturers,
                'total_courses' => $totalCourses,
                'total_classes' => $totalClasses,
                'total_krs' => $totalKrsItems,
                'total_grades' => $totalGrades,
            ],
            'config' => [
                'feeder_url' => $feederUrl,
                'feeder_token' => $feederToken,
                'feeder_mode' => $feederMode,
                'institution_code' => '213042',
                'institution_name' => 'STAI Al-Ittihad Cianjur',
            ],
            'syncLogs' => $syncLogs,
        ]);
    }

    /**
     * Jalankan Validasi Pra-Kirim (Dry-Run Integrity Checker)
     */
    public function validateDryRun(): RedirectResponse
    {
        $user = auth()->user();
        $issues = [];

        // 1. Validasi Mahasiswa: Cek NIK dan Nama
        $students = DB::table('users')->where('role', 'mahasiswa')->get();
        foreach ($students as $s) {
            $nik = $s->identity_number;
            if (empty($nik)) {
                $issues[] = [
                    'category' => 'MAHASISWA',
                    'identifier' => $s->name,
                    'severity' => 'ERROR',
                    'message' => "NIK kosong untuk mahasiswa {$s->name}.",
                ];
            } elseif (strlen($nik) < 8) {
                $issues[] = [
                    'category' => 'MAHASISWA',
                    'identifier' => $s->identity_number,
                    'severity' => 'WARNING',
                    'message' => "Panjang format identitas ({$s->identity_number}) berbeda dari format NIK standar 16-digit.",
                ];
            }
        }

        // 2. Validasi Mata Kuliah: SKS tidak boleh 0
        $courses = DB::table('courses')->get();
        foreach ($courses as $c) {
            if ($c->credits <= 0) {
                $issues[] = [
                    'category' => 'MATA_KULIAH',
                    'identifier' => $c->code,
                    'severity' => 'ERROR',
                    'message' => "Mata kuliah {$c->name} ({$c->code}) memiliki bobot 0 SKS.",
                ];
            }
        }

        // 3. Validasi Kelas: Dosen Pengajar
        $classesWithoutLecturer = DB::table('course_classes')
            ->leftJoin('class_lecturers', 'course_classes.id', '=', 'class_lecturers.course_class_id')
            ->whereNull('class_lecturers.lecturer_id')
            ->select('course_classes.*')
            ->get();

        foreach ($classesWithoutLecturer as $cw) {
            $issues[] = [
                'category' => 'KELAS_KULIAH',
                'identifier' => $cw->code,
                'severity' => 'WARNING',
                'message' => "Kelas {$cw->name} ({$cw->code}) belum memiliki dosen pengampu terdaftar.",
            ];
        }

        $totalChecked = count($students) + count($courses) + count($classesWithoutLecturer);
        $invalidCount = count($issues);
        $validCount = max(0, $totalChecked - $invalidCount);
        $status = $invalidCount === 0 ? 'SUCCESS' : ($invalidCount <= 2 ? 'WARNING' : 'FAILED');

        DB::table('pddikti_sync_logs')->insert([
            'table_target' => 'ALL_TABLES_VALIDATION',
            'sync_action' => 'VALIDATE_DRYRUN',
            'executed_by_id' => $user->id,
            'total_records' => $totalChecked,
            'valid_records' => $validCount,
            'invalid_records' => $invalidCount,
            'status' => $status,
            'validation_errors' => json_encode($issues),
            'details' => "Dry-run validation selesai. {$validCount} record valid, {$invalidCount} catatan evaluasi.",
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Validasi Pra-Kirim (Dry-Run) selesai! Ditemukan {$invalidCount} catatan validasi.");
    }

    /**
     * Simulasi Kirim Data ke Kemendikbud Neo Feeder Web Service
     */
    public function syncSimulate(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $target = $request->input('target', 'MATA_KULIAH');

        $recordCount = 10;
        if ($target === 'MAHASISWA') $recordCount = DB::table('users')->where('role', 'mahasiswa')->count();
        if ($target === 'MATA_KULIAH') $recordCount = DB::table('courses')->count();
        if ($target === 'KELAS_KULIAH') $recordCount = DB::table('course_classes')->count();
        if ($target === 'NILAI_KULIAH') $recordCount = DB::table('course_grades')->count();

        DB::table('pddikti_sync_logs')->insert([
            'table_target' => $target,
            'sync_action' => 'SYNC_PUSH',
            'executed_by_id' => $user->id,
            'total_records' => $recordCount,
            'valid_records' => $recordCount,
            'invalid_records' => 0,
            'status' => 'SUCCESS',
            'validation_errors' => json_encode([]),
            'details' => "Sinkronisasi {$recordCount} data tabel {$target} ke Neo Feeder PDDIKTI berhasil (Mode Sandbox). Response code 200 OK.",
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Simulasi pengiriman data {$target} ({$recordCount} Data) ke Neo Feeder PDDIKTI berhasil disubmit!");
    }

    /**
     * Ekspor Data Feeder dalam Format JSON Resmi Neo Feeder Kemendikbud
     */
    public function exportJson(Request $request): JsonResponse
    {
        $target = $request->input('target', 'courses');

        $data = [];
        if ($target === 'courses') {
            $data = DB::table('courses')->get()->map(fn ($c) => [
                'act' => 'InsertMataKuliah',
                'token' => 'mock_token',
                'record' => [
                    'id_prodi' => '213042-PAI',
                    'kode_mata_kuliah' => $c->code,
                    'nama_mata_kuliah' => $c->name,
                    'sks_mata_kuliah' => $c->credits,
                    'sks_tatap_muka' => $c->theory_credits,
                    'sks_praktek' => $c->practice_credits,
                    'id_jenis_mata_kuliah' => $c->course_type === 'WAJIB_PRODI' ? 'A' : 'B',
                ],
            ]);
        } elseif ($target === 'classes') {
            $data = DB::table('course_classes')
                ->join('courses', 'course_classes.course_id', '=', 'courses.id')
                ->select('course_classes.*', 'courses.code as course_code', 'courses.name as course_name')
                ->get()
                ->map(fn ($cls) => [
                    'act' => 'InsertKelasKuliah',
                    'token' => 'mock_token',
                    'record' => [
                        'id_prodi' => '213042-PAI',
                        'id_semester' => '20261',
                        'id_matkul' => $cls->course_code,
                        'nama_kelas_kuliah' => $cls->name,
                        'kapasitas' => $cls->capacity,
                    ],
                ]);
        } else {
            $data = DB::table('users')->where('role', 'mahasiswa')->get()->map(fn ($u) => [
                'act' => 'InsertMahasiswa',
                'token' => 'mock_token',
                'record' => [
                    'nama_mahasiswa' => $u->name,
                    'jenis_kelamin' => 'L',
                    'nik' => $u->identity_number ?? '3203010000000001',
                    'nisn' => '0054238910',
                    'email' => $u->email,
                    'handphone' => '081234567890',
                ],
            ]);
        }

        return response()->json([
            'institution_code' => '213042',
            'institution_name' => 'STAI Al-Ittihad Cianjur',
            'exported_at' => now()->toIso8601String(),
            'target' => $target,
            'total' => count($data),
            'records' => $data,
        ]);
    }

    /**
     * Simpan Pengaturan Web Service Neo Feeder
     */
    public function updateConfig(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'feeder_url' => ['required', 'string'],
            'feeder_token' => ['required', 'string'],
            'feeder_mode' => ['required', 'in:SANDBOX,PRODUCTION'],
        ]);

        DB::table('system_settings')->updateOrInsert(
            ['key' => 'pddikti_feeder_url'],
            ['group' => 'PDDIKTI', 'value' => $validated['feeder_url'], 'type' => 'string', 'updated_at' => now()]
        );
        DB::table('system_settings')->updateOrInsert(
            ['key' => 'pddikti_feeder_token'],
            ['group' => 'PDDIKTI', 'value' => $validated['feeder_token'], 'type' => 'string', 'updated_at' => now()]
        );
        DB::table('system_settings')->updateOrInsert(
            ['key' => 'pddikti_mode'],
            ['group' => 'PDDIKTI', 'value' => $validated['feeder_mode'], 'type' => 'string', 'updated_at' => now()]
        );

        return back()->with('success', 'Konfigurasi Web Service PDDIKTI Neo Feeder berhasil diperbarui.');
    }
}

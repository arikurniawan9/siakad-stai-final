<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class KrsReferenceSeeder extends Seeder
{
    public function run(): void
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $periodId = $activePeriod?->id ?? 1;

        // 1. Dosen Pengajar dari Screenshot
        $lecturersData = [
            [
                'name' => 'MUHAMMAD RIZAL ZAENULLOH, M.Pd.',
                'identity_number' => '3203040910960002',
                'email' => 'rizal.zaenulloh@staialittihad.ac.id',
                'role' => 'dosen',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'phone_number' => '081234567801',
            ],
            [
                'name' => 'WAHYUDIN, M.Pd.',
                'identity_number' => '3203072705890003',
                'email' => 'wahyudin@staialittihad.ac.id',
                'role' => 'dosen',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'phone_number' => '081234567802',
            ],
            [
                'name' => 'DEDE SULAEMAN, M.Pd.',
                'identity_number' => '2118097202',
                'email' => 'dede.sulaeman@staialittihad.ac.id',
                'role' => 'dosen',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'L',
                'phone_number' => '081234567803',
            ],
            [
                'name' => 'SITI RODIAH, M.Pd.',
                'identity_number' => '2115047803',
                'email' => 'siti.rodiah@staialittihad.ac.id',
                'role' => 'dosen_pa',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'P',
                'phone_number' => '081234567804',
            ],
        ];

        $lecturerMap = [];
        foreach ($lecturersData as $lec) {
            $user = User::updateOrCreate(
                ['identity_number' => $lec['identity_number']],
                [
                    'name' => $lec['name'],
                    'username' => $lec['identity_number'],
                    'email' => $lec['email'],
                    'password' => Hash::make('salam123'),
                    'role' => $lec['role'],
                    'study_program' => $lec['study_program'],
                    'gender' => $lec['gender'],
                    'phone_number' => $lec['phone_number'],
                    'is_active' => true,
                ]
            );
            $lecturerMap[$lec['name']] = $user->id;
        }

        // 2. Ruangan dari Screenshot: "02 - Ruang 2 [Gedung A: Lantai 1]"
        $room = DB::table('rooms')->where('code', 'R-102')->first();
        if ($room) {
            DB::table('rooms')->where('id', $room->id)->update([
                'name' => '02 - Ruang 2 [Gedung A: Lantai 1]',
                'capacity' => 40,
            ]);
            $roomId = $room->id;
        } else {
            $roomId = DB::table('rooms')->insertGetId([
                'code' => 'R-02',
                'name' => '02 - Ruang 2 [Gedung A: Lantai 1]',
                'capacity' => 40,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Kurikulum PIAUD 2023 / 2024
        $curriculum = DB::table('curricula')
            ->where('study_program_id', 1)
            ->where('is_active', true)
            ->first();
        $curriculumId = $curriculum?->id ?? 1;

        // 4. Mata Kuliah PIAUD Semester 2 Sesuai Screenshot
        $coursesData = [
            [
                'code' => 'STAIPD213',
                'name' => 'Bahasa Arab II',
                'credits' => 2,
                'semester_level' => 2,
                'course_type' => 'WAJIB_PRODI',
                'day' => 'Jumat',
                'start' => '14:00:00',
                'end' => '15:00:00',
                'lecturer' => 'MUHAMMAD RIZAL ZAENULLOH, M.Pd.',
            ],
            [
                'code' => 'STAIPD214',
                'name' => 'Bahasa Inggris II',
                'credits' => 2,
                'semester_level' => 2,
                'course_type' => 'WAJIB_PRODI',
                'day' => 'Sabtu',
                'start' => '11:00:00',
                'end' => '12:00:00',
                'lecturer' => 'WAHYUDIN, M.Pd.',
            ],
            [
                'code' => 'STAIPD215',
                'name' => 'Statistika',
                'credits' => 2,
                'semester_level' => 2,
                'course_type' => 'WAJIB_PRODI',
                'day' => 'Sabtu',
                'start' => '08:00:00',
                'end' => '09:00:00',
                'lecturer' => 'DEDE SULAEMAN, M.Pd.',
            ],
            [
                'code' => 'STAIPD216',
                'name' => 'Teknik Penulisan KTI',
                'credits' => 2,
                'semester_level' => 2,
                'course_type' => 'WAJIB_PRODI',
                'day' => 'Sabtu',
                'start' => '11:00:00',
                'end' => '12:00:00',
                'lecturer' => 'SITI RODIAH, M.Pd.',
            ],
            [
                'code' => 'STAIPD217',
                'name' => 'Psikologi Perkembangan Anak Usia Dini',
                'credits' => 3,
                'semester_level' => 2,
                'course_type' => 'WAJIB_PRODI',
                'day' => 'Kamis',
                'start' => '08:30:00',
                'end' => '10:30:00',
                'lecturer' => 'SITI RODIAH, M.Pd.',
            ],
            [
                'code' => 'STAIPD218',
                'name' => 'Konsep Dasar PAUD & Kurikulum Merdeka',
                'credits' => 3,
                'semester_level' => 2,
                'course_type' => 'WAJIB_PRODI',
                'day' => 'Kamis',
                'start' => '10:30:00',
                'end' => '12:30:00',
                'lecturer' => 'DEDE SULAEMAN, M.Pd.',
            ],
        ];

        $classIdsMap = [];

        foreach ($coursesData as $c) {
            // Update or create course
            $course = DB::table('courses')->where('code', $c['code'])->first();
            if ($course) {
                DB::table('courses')->where('id', $course->id)->update([
                    'name' => $c['name'],
                    'credits' => $c['credits'],
                    'semester_level' => $c['semester_level'],
                    'curriculum_id' => $curriculumId,
                    'study_program_id' => 1,
                    'is_active' => true,
                    'updated_at' => now(),
                ]);
                $courseId = $course->id;
            } else {
                $courseId = DB::table('courses')->insertGetId([
                    'curriculum_id' => $curriculumId,
                    'study_program_id' => 1,
                    'code' => $c['code'],
                    'name' => $c['name'],
                    'credits' => $c['credits'],
                    'theory_credits' => $c['credits'],
                    'practice_credits' => 0,
                    'semester_level' => $c['semester_level'],
                    'course_type' => $c['course_type'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Create or update course_class (Kelas PD2)
            $class = DB::table('course_classes')
                ->where('academic_period_id', $periodId)
                ->where('course_id', $courseId)
                ->first();

            if ($class) {
                DB::table('course_classes')->where('id', $class->id)->update([
                    'name' => 'PD2',
                    'capacity' => 40,
                    'status' => 'AKTIF',
                    'updated_at' => now(),
                ]);
                $classId = $class->id;
            } else {
                $classId = DB::table('course_classes')->insertGetId([
                    'academic_period_id' => $periodId,
                    'course_id' => $courseId,
                    'name' => 'PD2',
                    'code' => strtolower("cls-{$c['code']}-pd2"),
                    'capacity' => 40,
                    'delivery_mode' => 'TATAP_MUKA',
                    'status' => 'AKTIF',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $classIdsMap[$c['code']] = $classId;

            // Class Schedule
            DB::table('class_schedules')->updateOrInsert(
                ['course_class_id' => $classId],
                [
                    'room_id' => $roomId,
                    'day_of_week' => $c['day'],
                    'start_time' => $c['start'],
                    'end_time' => $c['end'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Class Lecturer
            $lecId = $lecturerMap[$c['lecturer']] ?? 6;
            DB::table('class_lecturers')->updateOrInsert(
                [
                    'course_class_id' => $classId,
                    'lecturer_id' => $lecId,
                ],
                [
                    'is_primary' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 5. Mahasiswa Sesuai Screenshot:
        // Mahasiswa 1: Cantika Siti Samsiah (NIM: 25893604) -> Belum KRS
        $cantika = User::updateOrCreate(
            ['identity_number' => '25893604'],
            [
                'name' => 'Cantika Siti Samsiah',
                'username' => '25893604',
                'email' => 'cantika.siti@staialittihad.ac.id',
                'password' => Hash::make('salam123'),
                'role' => 'mahasiswa',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'P',
                'phone_number' => '081234567891',
                'is_active' => true,
                'academic_advisor_id' => $lecturerMap['SITI RODIAH, M.Pd.'] ?? 5,
                'created_at' => '2025-08-15 09:00:00',
            ]
        );

        // Mahasiswa 2: Alleisya Hani Pasyala (NIM: 25893601) -> Telah Disetujui dengan 4 MK (8 SKS)
        $alleisya = User::updateOrCreate(
            ['identity_number' => '25893601'],
            [
                'name' => 'Alleisya Hani Pasyala',
                'username' => '25893601',
                'email' => 'alleisya.hani@staialittihad.ac.id',
                'password' => Hash::make('salam123'),
                'role' => 'mahasiswa',
                'study_program' => 'Pendidikan Islam Anak Usia Dini (S1)',
                'gender' => 'P',
                'phone_number' => '081234567892',
                'is_active' => true,
                'academic_advisor_id' => $lecturerMap['SITI RODIAH, M.Pd.'] ?? 5,
                'created_at' => '2025-08-15 09:00:00',
            ]
        );

        // Pastikan Alleisya memiliki submission KRS Disetujui dengan 4 mata kuliah pertama
        $alleisyaSub = DB::table('krs_submissions')->updateOrInsert(
            [
                'student_id' => $alleisya->id,
                'academic_period_id' => $periodId,
            ],
            [
                'total_credits' => 8.00,
                'max_credits_allowed' => 24,
                'status' => 'DISETUJUI',
                'academic_advisor_id' => $lecturerMap['SITI RODIAH, M.Pd.'] ?? 5,
                'submitted_at' => now()->subDays(3),
                'approved_at' => now()->subDay(),
                'created_at' => now()->subDays(3),
                'updated_at' => now(),
            ]
        );

        $alleisyaSubRecord = DB::table('krs_submissions')
            ->where('student_id', $alleisya->id)
            ->where('academic_period_id', $periodId)
            ->first();

        // 4 Kelas yang diambil Alleisya di rencanastudi.png:
        // STAIPD213, STAIPD214, STAIPD215, STAIPD216
        DB::table('krs_items')->where('krs_submission_id', $alleisyaSubRecord->id)->delete();
        $alleisyaCodes = ['STAIPD213', 'STAIPD214', 'STAIPD215', 'STAIPD216'];

        foreach ($alleisyaCodes as $code) {
            if (isset($classIdsMap[$code])) {
                $clsId = $classIdsMap[$code];
                DB::table('krs_items')->insert([
                    'krs_submission_id' => $alleisyaSubRecord->id,
                    'course_class_id' => $clsId,
                    'status' => 'DISETUJUI',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('class_enrollments')->updateOrInsert(
                    [
                        'course_class_id' => $clsId,
                        'student_id' => $alleisya->id,
                    ],
                    [
                        'status' => 'TERDAFTAR',
                        'enrolled_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}

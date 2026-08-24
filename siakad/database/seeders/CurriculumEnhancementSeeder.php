<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CurriculumEnhancementSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Reset PostgreSQL sequences to avoid collision
        try {
            DB::statement("SELECT setval(pg_get_serial_sequence('study_programs', 'id'), coalesce(max(id),0) + 1, false) FROM study_programs");
            DB::statement("SELECT setval(pg_get_serial_sequence('curricula', 'id'), coalesce(max(id),0) + 1, false) FROM curricula");
            DB::statement("SELECT setval(pg_get_serial_sequence('courses', 'id'), coalesce(max(id),0) + 1, false) FROM courses");
        } catch (\Exception $e) {}

        // 1. Pastikan Prodi memiliki national_code
        DB::table('study_programs')->where('code', 'PAI')->update(['national_code' => '86208', 'name' => 'Pendidikan Agama Islam']);
        DB::table('study_programs')->where('code', 'MPI')->update(['national_code' => '86201', 'name' => 'Manajemen Pendidikan Islam']);
        DB::table('study_programs')->where('code', 'HES')->update(['national_code' => '74201', 'name' => 'Hukum Ekonomi Syariah']);
        DB::table('study_programs')->where('code', 'PGMI')->update(['national_code' => '86205', 'name' => 'Pendidikan Guru Madrasah Ibtidaiyah']);
        DB::table('study_programs')->where('code', 'ESY')->update(['national_code' => '60202', 'name' => 'Ekonomi Syariah']);

        // Tambahkan PIAUD jika belum ada
        $piaud = DB::table('study_programs')->where('code', 'PIAUD')->first();
        if (!$piaud) {
            $piaudId = DB::table('study_programs')->insertGetId([
                'faculty_id' => 1,
                'code' => 'PIAUD',
                'national_code' => '86236',
                'name' => 'Pendidikan Islam Anak Usia Dini',
                'degree' => 'S1',
                'accreditation' => 'Baik Sekali',
                'sk_number' => 'SK-BAN-PT-PIAUD-2024',
                'head_of_program_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            $piaudId = $piaud->id;
            DB::table('study_programs')->where('id', $piaudId)->update(['national_code' => '86236', 'name' => 'Pendidikan Islam Anak Usia Dini']);
        }

        $esyProdi = DB::table('study_programs')->where('code', 'ESY')->first();
        $paiProdi = DB::table('study_programs')->where('code', 'PAI')->first();

        // 2. SEED KURIKULUM LENGKAP
        // PIAUD
        $kurPiaud2019 = DB::table('curricula')->where('code', 'KUR-PIAUD-2019')->first();
        if (!$kurPiaud2019) {
            DB::table('curricula')->insert([
                'study_program_id' => $piaudId,
                'code' => 'KUR-PIAUD-2019',
                'name' => 'Kurikulum 2019 PIAUD STAI Al-Ittihad',
                'start_year' => 2019,
                'total_credits_required' => 154,
                'ideal_semesters' => 8,
                'mandatory_credits' => 146,
                'elective_credits' => 8,
                'is_active' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $kurPiaud2023 = DB::table('curricula')->where('code', 'KUR-PIAUD-2023')->first();
        if (!$kurPiaud2023) {
            DB::table('curricula')->insert([
                'study_program_id' => $piaudId,
                'code' => 'KUR-PIAUD-2023',
                'name' => 'KURIKULUM PIAUD 2023 STAI AL ITTIHAD CIANJUR',
                'start_year' => 2023,
                'total_credits_required' => 144,
                'ideal_semesters' => 8,
                'mandatory_credits' => 88,
                'elective_credits' => 50,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Ekonomi Syariah
        if ($esyProdi) {
            $kurEsy2019 = DB::table('curricula')->where('code', 'KUR-ESY-2019')->first();
            if (!$kurEsy2019) {
                $kurEsy2019Id = DB::table('curricula')->insertGetId([
                    'study_program_id' => $esyProdi->id,
                    'code' => 'KUR-ESY-2019',
                    'name' => 'Kurikulum 2019 ES STAI Al-Ittihad',
                    'start_year' => 2019,
                    'total_credits_required' => 148,
                    'ideal_semesters' => 8,
                    'mandatory_credits' => 140,
                    'elective_credits' => 8,
                    'is_active' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } else {
                $kurEsy2019Id = $kurEsy2019->id;
            }

            $kurEsy2023 = DB::table('curricula')->where('code', 'KUR-ESY-2023')->first();
            if (!$kurEsy2023) {
                $kurEsy2023Id = DB::table('curricula')->insertGetId([
                    'study_program_id' => $esyProdi->id,
                    'code' => 'KUR-ESY-2023',
                    'name' => 'Kurikulum 2023 ES STAI Al-Ittihad',
                    'start_year' => 2023,
                    'total_credits_required' => 144,
                    'ideal_semesters' => 8,
                    'mandatory_credits' => 124,
                    'elective_credits' => 20,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            } else {
                $kurEsy2023Id = $kurEsy2023->id;
            }

            // 3. SEED MATA KULIAH EKONOMI SYARIAH (PERSIS SEPERTI GAMBAR matakuliah.png)
            $esyCourses = [
                ['code' => 'STAIES111', 'name' => 'Ahlussunnah Wal Jamaah', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 1, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES105', 'name' => 'Akhlaq Tashawuf', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 1, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES765', 'name' => 'Akuntansi Keuangan Syariah', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 3, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES331', 'name' => 'Akuntansi Lanjutan (Manajemen & Biaya)', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 3, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES329', 'name' => 'Ayat Dan Hadits Ekonomi', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 2, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES103', 'name' => 'Bahasa Arab I', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 1, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES212', 'name' => 'Bahasa Arab II', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 2, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES324', 'name' => 'Bahasa Arab III', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 3, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES110', 'name' => 'Bahasa Indonesia', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 1, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES220', 'name' => 'Bahasa Inggris Bisnis', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 2, 'type' => 'Wajib', 'group' => 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)'],
                ['code' => 'STAIES401', 'name' => 'Manajemen Perbankan Syariah', 'credits' => 3, 'theory' => 3, 'practice' => 0, 'field' => 0, 'smt' => 4, 'type' => 'Wajib', 'group' => 'MKK (Mata Kuliah Keahlian)'],
                ['code' => 'STAIES402', 'name' => 'Fiqih Muamalah Kontemporer', 'credits' => 3, 'theory' => 3, 'practice' => 0, 'field' => 0, 'smt' => 4, 'type' => 'Wajib', 'group' => 'MKK (Mata Kuliah Keahlian)'],
                ['code' => 'STAIES501', 'name' => 'Pasar Modal Syariah', 'credits' => 2, 'theory' => 2, 'practice' => 0, 'field' => 0, 'smt' => 5, 'type' => 'Pilihan', 'group' => 'MKB (Mata Kuliah Keahlian Berkarya)'],
            ];

            foreach ($esyCourses as $c) {
                $exists2019 = DB::table('courses')->where('curriculum_id', $kurEsy2019Id)->where('code', $c['code'])->first();
                if ($exists2019) {
                    DB::table('courses')->where('id', $exists2019->id)->update([
                        'study_program_id' => $esyProdi->id,
                        'name' => $c['name'],
                        'credits' => $c['credits'],
                        'theory_credits' => $c['theory'],
                        'practice_credits' => $c['practice'],
                        'field_credits' => $c['field'],
                        'semester_level' => $c['smt'],
                        'course_type' => $c['type'],
                        'course_group' => $c['group'],
                        'is_active' => true,
                        'updated_at' => $now,
                    ]);
                } else {
                    DB::table('courses')->insert([
                        'curriculum_id' => $kurEsy2019Id,
                        'study_program_id' => $esyProdi->id,
                        'code' => $c['code'],
                        'name' => $c['name'],
                        'credits' => $c['credits'],
                        'theory_credits' => $c['theory'],
                        'practice_credits' => $c['practice'],
                        'field_credits' => $c['field'],
                        'semester_level' => $c['smt'],
                        'course_type' => $c['type'],
                        'course_group' => $c['group'],
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                $exists2023 = DB::table('courses')->where('curriculum_id', $kurEsy2023Id)->where('code', $c['code'])->first();
                if ($exists2023) {
                    DB::table('courses')->where('id', $exists2023->id)->update([
                        'study_program_id' => $esyProdi->id,
                        'name' => $c['name'],
                        'credits' => $c['credits'],
                        'theory_credits' => $c['theory'],
                        'practice_credits' => $c['practice'],
                        'field_credits' => $c['field'],
                        'semester_level' => $c['smt'],
                        'course_type' => $c['type'],
                        'course_group' => $c['group'],
                        'is_active' => true,
                        'updated_at' => $now,
                    ]);
                } else {
                    DB::table('courses')->insert([
                        'curriculum_id' => $kurEsy2023Id,
                        'study_program_id' => $esyProdi->id,
                        'code' => $c['code'],
                        'name' => $c['name'],
                        'credits' => $c['credits'],
                        'theory_credits' => $c['theory'],
                        'practice_credits' => $c['practice'],
                        'field_credits' => $c['field'],
                        'semester_level' => $c['smt'],
                        'course_type' => $c['type'],
                        'course_group' => $c['group'],
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }
}

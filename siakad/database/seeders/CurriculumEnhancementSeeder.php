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

        $piaud = DB::table('study_programs')->where('code', 'PIAUD')->first();
        $mpi = DB::table('study_programs')->where('code', 'MPI')->first();
        $es = DB::table('study_programs')->where('code', 'ES')->orWhere('code', 'ESY')->first();
        $bki = DB::table('study_programs')->where('code', 'BKI')->first();

        // 1. KURIKULUM & MATAKULIAH PIAUD
        if ($piaud) {
            $kurPiaud2019 = DB::table('curricula')->where('study_program_id', $piaud->id)->where('code', 'KUR-PIAUD-2019')->first();
            if (!$kurPiaud2019) {
                DB::table('curricula')->insert([
                    'study_program_id' => $piaud->id,
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

            $kurPiaud2023 = DB::table('curricula')->where('study_program_id', $piaud->id)->where('code', 'KUR-PIAUD-2023')->first();
            if (!$kurPiaud2023) {
                DB::table('curricula')->insert([
                    'study_program_id' => $piaud->id,
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
        }

        // 2. KURIKULUM & MATAKULIAH EKONOMI SYARIAH
        if ($es) {
            $kurEs2019 = DB::table('curricula')->where('study_program_id', $es->id)->where('code', 'KUR-ES-2019')->first();
            if (!$kurEs2019) {
                $kurEs2019Id = DB::table('curricula')->insertGetId([
                    'study_program_id' => $es->id,
                    'code' => 'KUR-ES-2019',
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
                $kurEs2019Id = $kurEs2019->id;
            }

            $kurEs2023 = DB::table('curricula')->where('study_program_id', $es->id)->where('code', 'KUR-ES-2023')->first();
            if (!$kurEs2023) {
                $kurEs2023Id = DB::table('curricula')->insertGetId([
                    'study_program_id' => $es->id,
                    'code' => 'KUR-ES-2023',
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
                $kurEs2023Id = $kurEs2023->id;
            }

            // SEED MATA KULIAH EKONOMI SYARIAH
            $esCourses = [
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

            foreach ($esCourses as $c) {
                $exists2019 = DB::table('courses')->where('curriculum_id', $kurEs2019Id)->where('code', $c['code'])->first();
                if ($exists2019) {
                    DB::table('courses')->where('id', $exists2019->id)->update([
                        'study_program_id' => $es->id,
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
                        'curriculum_id' => $kurEs2019Id,
                        'study_program_id' => $es->id,
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

                $exists2023 = DB::table('courses')->where('curriculum_id', $kurEs2023Id)->where('code', $c['code'])->first();
                if ($exists2023) {
                    DB::table('courses')->where('id', $exists2023->id)->update([
                        'study_program_id' => $es->id,
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
                        'curriculum_id' => $kurEs2023Id,
                        'study_program_id' => $es->id,
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

        // 3. KURIKULUM & MATAKULIAH MPI
        if ($mpi) {
            $kurMpi2024 = DB::table('curricula')->where('study_program_id', $mpi->id)->where('code', 'KUR-MPI-2024')->first();
            if (!$kurMpi2024) {
                DB::table('curricula')->insert([
                    'study_program_id' => $mpi->id,
                    'code' => 'KUR-MPI-2024',
                    'name' => 'Kurikulum Merdeka OBE MPI 2024',
                    'start_year' => 2024,
                    'total_credits_required' => 144,
                    'ideal_semesters' => 8,
                    'mandatory_credits' => 130,
                    'elective_credits' => 14,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 4. KURIKULUM & MATAKULIAH BKI
        if ($bki) {
            $kurBki2024 = DB::table('curricula')->where('study_program_id', $bki->id)->where('code', 'KUR-BKI-2024')->first();
            if (!$kurBki2024) {
                DB::table('curricula')->insert([
                    'study_program_id' => $bki->id,
                    'code' => 'KUR-BKI-2024',
                    'name' => 'Kurikulum Merdeka OBE BKI 2024',
                    'start_year' => 2024,
                    'total_credits_required' => 144,
                    'ideal_semesters' => 8,
                    'mandatory_credits' => 130,
                    'elective_credits' => 14,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}

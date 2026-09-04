<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AcademicSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. SEED SKALA NILAI UNTUK SEMUA PROGRAM STUDI (1: PIAUD, 2: MPI, 3: ES, 4: BKI)
        $standardScales = [
            ['grade_letter' => 'A', 'min_score' => 85.00, 'max_score' => 100.00, 'grade_point' => 4.00, 'predicate' => 'Sangat Baik (Istimewa)', 'is_passing' => true],
            ['grade_letter' => 'A-', 'min_score' => 80.00, 'max_score' => 84.99, 'grade_point' => 3.75, 'predicate' => 'Sangat Baik', 'is_passing' => true],
            ['grade_letter' => 'B+', 'min_score' => 75.00, 'max_score' => 79.99, 'grade_point' => 3.50, 'predicate' => 'Baik Sekali', 'is_passing' => true],
            ['grade_letter' => 'B', 'min_score' => 70.00, 'max_score' => 74.99, 'grade_point' => 3.00, 'predicate' => 'Baik', 'is_passing' => true],
            ['grade_letter' => 'C+', 'min_score' => 65.00, 'max_score' => 69.99, 'grade_point' => 2.50, 'predicate' => 'Cukup Baik', 'is_passing' => true],
            ['grade_letter' => 'C', 'min_score' => 60.00, 'max_score' => 64.99, 'grade_point' => 2.00, 'predicate' => 'Cukup (Batas Kelulusan KKM)', 'is_passing' => true],
            ['grade_letter' => 'D', 'min_score' => 50.00, 'max_score' => 59.99, 'grade_point' => 1.00, 'predicate' => 'Kurang (Wajib Mengulang)', 'is_passing' => false],
            ['grade_letter' => 'E', 'min_score' => 0.00, 'max_score' => 49.99, 'grade_point' => 0.00, 'predicate' => 'Gagal / Tidak Lulus', 'is_passing' => false],
        ];

        $scaleRows = [];
        $scaleId = 1;
        // Skala standar institusi (study_program_id null)
        foreach ($standardScales as $s) {
            $scaleRows[] = array_merge($s, [
                'id' => $scaleId++,
                'study_program_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Skala per prodi (1: PIAUD, 2: MPI, 3: ES, 4: BKI)
        for ($pId = 1; $pId <= 4; $pId++) {
            foreach ($standardScales as $s) {
                $scaleRows[] = array_merge($s, [
                    'id' => $scaleId++,
                    'study_program_id' => $pId,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
        DB::table('grading_scales')->insertOrIgnore($scaleRows);

        // 2. SEED KOMPOSISI BOBOT NILAI
        DB::table('grade_weights')->insertOrIgnore([
            [
                'id' => 1,
                'component_code' => 'ATTENDANCE',
                'component_name' => 'Presensi / Kehadiran Kuliah',
                'weight_percentage' => 10.00,
                'min_attendance_percentage' => 75.00,
                'description' => 'Evaluasi kehadiran mahasiswa pada sesi perkuliahan tatap muka & daring (Ambang batas minimal 75% untuk kelayakan UAS).',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'component_code' => 'ASSIGNMENT',
                'component_name' => 'Tugas Terstruktur & Makalah OBE',
                'weight_percentage' => 20.00,
                'min_attendance_percentage' => 75.00,
                'description' => 'Pengumpulan tugas perkuliahan, makalah, resume literatur turats, dan rubrik asesmen OBE.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'component_code' => 'QUIZ',
                'component_name' => 'Kuis Daring & Keaktifan Diskusi',
                'weight_percentage' => 15.00,
                'min_attendance_percentage' => 75.00,
                'description' => 'Evaluasi berkala CBT daring, kuis formatif per pertemuan, dan partisipasi aktif dalam forum kelas.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'component_code' => 'MID_EXAM',
                'component_name' => 'Ujian Tengah Semester (UTS)',
                'weight_percentage' => 25.00,
                'min_attendance_percentage' => 75.00,
                'description' => 'Ujian capaian pembelajaran tengah semester (Pertemuan ke-8).',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'component_code' => 'FINAL_EXAM',
                'component_name' => 'Ujian Akhir Semester (UAS)',
                'weight_percentage' => 30.00,
                'min_attendance_percentage' => 75.00,
                'description' => 'Evaluasi komprehensif capaian akhir semester (Pertemuan ke-16).',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 3. SEED BATAS BEBAN SKS MAKSIMUM (1: PIAUD, 2: MPI, 3: ES, 4: BKI)
        $standardSksLimits = [
            ['min_ips' => 3.50, 'max_ips' => 4.00, 'max_sks' => 24, 'category' => 'REGULER', 'description' => 'Prestasi Sangat Memuaskan (IPS ≥ 3.50): Beban maksimum 24 SKS.'],
            ['min_ips' => 3.00, 'max_ips' => 3.49, 'max_sks' => 22, 'category' => 'REGULER', 'description' => 'Prestasi Memuaskan (IPS 3.00 – 3.49): Beban maksimum 22 SKS.'],
            ['min_ips' => 2.50, 'max_ips' => 2.99, 'max_sks' => 20, 'category' => 'REGULER', 'description' => 'Prestasi Baik (IPS 2.50 – 2.99): Beban maksimum 20 SKS.'],
            ['min_ips' => 2.00, 'max_ips' => 2.49, 'max_sks' => 18, 'category' => 'REGULER', 'description' => 'Prestasi Cukup (IPS 2.00 – 2.49): Beban maksimum 18 SKS.'],
            ['min_ips' => 0.00, 'max_ips' => 1.99, 'max_sks' => 15, 'category' => 'REGULER', 'description' => 'Perhatian Akademik (IPS < 2.00): Beban dibatasi maksimum 15 SKS dengan pembinaan Dosen PA.'],
            ['min_ips' => 0.00, 'max_ips' => 4.00, 'max_sks' => 20, 'category' => 'MAHASISWA_BARU', 'description' => 'Paket Mahasiswa Baru Semester 1 & 2: Otomatis 20 SKS.'],
            ['min_ips' => 0.00, 'max_ips' => 4.00, 'max_sks' => 9, 'category' => 'SEMESTER_PENDEK', 'description' => 'Semester Antara / Pendek (Remedial & Akselerasi): Beban maksimum 9 SKS.'],
        ];

        $sksRows = [];
        $sksId = 1;
        // Template standar institusi (study_program_id null)
        foreach ($standardSksLimits as $lim) {
            $sksRows[] = array_merge($lim, [
                'id' => $sksId++,
                'study_program_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Skema per prodi (1: PIAUD, 2: MPI, 3: ES, 4: BKI)
        for ($pId = 1; $pId <= 4; $pId++) {
            foreach ($standardSksLimits as $lim) {
                $sksRows[] = array_merge($lim, [
                    'id' => $sksId++,
                    'study_program_id' => $pId,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
        DB::table('sks_limits')->insertOrIgnore($sksRows);

        // 4. SEED PREDIKAT KELULUSAN YUDISIUM
        DB::table('graduation_predicates')->insertOrIgnore([
            [
                'id' => 1,
                'predicate_name' => 'Dengan Pujian (Cum Laude)',
                'min_gpa' => 3.51,
                'max_gpa' => 4.00,
                'max_semesters' => 8,
                'requires_no_repeat' => true,
                'predicate_en' => 'With Praise (Cum Laude)',
                'description' => 'IPK 3.51 - 4.00, masa studi maksimal 8 semester (4 tahun), dan tidak ada nilai mengulang (C/D/E).',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'predicate_name' => 'Sangat Memuaskan',
                'min_gpa' => 3.01,
                'max_gpa' => 3.50,
                'max_semesters' => 14,
                'requires_no_repeat' => false,
                'predicate_en' => 'Highly Satisfactory',
                'description' => 'IPK 3.01 - 3.50 dalam masa studi yang berlaku.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'predicate_name' => 'Memuaskan',
                'min_gpa' => 2.76,
                'max_gpa' => 3.00,
                'max_semesters' => 14,
                'requires_no_repeat' => false,
                'predicate_en' => 'Satisfactory',
                'description' => 'IPK 2.76 - 3.00.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'predicate_name' => 'Lulus (Cukup)',
                'min_gpa' => 2.00,
                'max_gpa' => 2.75,
                'max_semesters' => 14,
                'requires_no_repeat' => false,
                'predicate_en' => 'Passed',
                'description' => 'IPK 2.00 - 2.75 (Batas IPK minimal kelulusan Sarjana).',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 5. SEED GELAR KELULUSAN PROGRAM STUDI
        $programs = DB::table('study_programs')->get();
        foreach ($programs as $prog) {
            $shortTitle = 'S.Pd.';
            $fullTitle = 'Sarjana Pendidikan';
            $fullTitleEn = 'Bachelor of Islamic Education';
            $shortTitleEn = 'B.Ed.';

            if ($prog->code === 'ES' || $prog->code === 'ESY') {
                $shortTitle = 'S.E.';
                $fullTitle = 'Sarjana Ekonomi';
                $fullTitleEn = 'Bachelor of Economics';
                $shortTitleEn = 'B.Econ.';
            } elseif ($prog->code === 'BKI' || $prog->code === 'KPI' || $prog->code === 'MD') {
                $shortTitle = 'S.Sos.';
                $fullTitle = 'Sarjana Sosial';
                $fullTitleEn = 'Bachelor of Social Science';
                $shortTitleEn = 'B.Soc.Sc.';
            }

            DB::table('study_program_degrees')->insertOrIgnore([
                'study_program_id' => $prog->id,
                'degree_level' => 'S1',
                'degree_full_title' => $fullTitle,
                'degree_short_title' => $shortTitle,
                'degree_full_title_en' => $fullTitleEn,
                'degree_short_title_en' => $shortTitleEn,
                'total_credits_required' => 144,
                'max_study_semesters' => 14,
                'sk_accreditation_number' => 'SK-LAMDIK-2024/098/BAN-PT',
                'accreditation_valid_until' => '2029-12-31',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 6. SEED DATA PEJABAT PENGESAH DOKUMEN RESMI
        DB::table('institutional_signatories')->insertOrIgnore([
            [
                'id' => 1,
                'document_type' => 'SURAT_KETERANGAN',
                'document_title' => 'Surat Keterangan Aktif Kuliah & Bebas Masalah',
                'position_code' => 'WAKET_1',
                'position_title' => 'Wakil Ketua I Bidang Akademik & Kelembagaan',
                'user_id' => 6,
                'signatory_name' => 'Dr. H. M. Ridwan, M.Ag',
                'signatory_nip_nidn' => 'NIDN: 2112087501',
                'include_qr_seal' => true,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'document_type' => 'KHS',
                'document_title' => 'Kartu Hasil Studi (KHS) Digital Mahasiswa',
                'position_code' => 'KAPRODI',
                'position_title' => 'Ketua Program Studi & Pembimbing Akademik',
                'user_id' => 4,
                'signatory_name' => "Dr. Ahmad Syafi'i, M.Ag",
                'signatory_nip_nidn' => 'NIDN: 2118097201',
                'include_qr_seal' => true,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'document_type' => 'TRANSKRIP',
                'document_title' => 'Transkrip Akademik Digital & Ijazah Kelulusan',
                'position_code' => 'KETUA',
                'position_title' => 'Ketua STAI Al-Ittihad Cianjur',
                'user_id' => 1,
                'signatory_name' => 'Prof. Dr. KH. Abdul Halim, M.A.',
                'signatory_nip_nidn' => 'NIDN: 2111056501',
                'include_qr_seal' => true,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'document_type' => 'DPNA_NILAI',
                'document_title' => 'Daftar Peserta & Nilai Akhir (DPNA) Perkuliahan',
                'position_code' => 'WAKET_1',
                'position_title' => 'Wakil Ketua I & Dosen Pengampu',
                'user_id' => 6,
                'signatory_name' => 'Dr. H. M. Ridwan, M.Ag',
                'signatory_nip_nidn' => 'NIDN: 2112087501',
                'include_qr_seal' => true,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'document_type' => 'BEBAS_KEUANGAN',
                'document_title' => 'Surat Keterangan Bebas Tagihan UKT/SPP',
                'position_code' => 'KEUANGAN',
                'position_title' => 'Kepala Biro Administrasi Keuangan (BAK)',
                'user_id' => 3,
                'signatory_name' => 'H. Ridwan Kamil, S.E.',
                'signatory_nip_nidn' => 'NIP: 198203152008011003',
                'include_qr_seal' => true,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 6,
                'document_type' => 'KRS',
                'document_title' => 'Kartu Rencana Studi (KRS) & Validasi PA',
                'position_code' => 'DOSEN_PA',
                'position_title' => 'Dosen Pembimbing Akademik (Dosen Wali)',
                'user_id' => 5,
                'signatory_name' => 'Dra. Hj. Siti Maryam, M.Pd.I',
                'signatory_nip_nidn' => 'NIDN: 2115047802',
                'include_qr_seal' => true,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 7. SEED DATA STRUKTURAL & PEJABAT KAMPUS
        DB::table('structural_positions')->insertOrIgnore([
            ['id' => 1, 'code' => 'KETUA', 'name' => 'Ketua STAI Al-Ittihad', 'level' => 1, 'can_approve_krs' => false, 'can_sign_transcripts' => true, 'can_manage_finance' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 2, 'code' => 'WAKET_1', 'name' => 'Wakil Ketua I Bidang Akademik & Kelembagaan', 'level' => 2, 'can_approve_krs' => true, 'can_sign_transcripts' => true, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3, 'code' => 'WAKET_2', 'name' => 'Wakil Ketua II Bidang Keuangan & Administrasi Umum', 'level' => 2, 'can_approve_krs' => false, 'can_sign_transcripts' => false, 'can_manage_finance' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 4, 'code' => 'WAKET_3', 'name' => 'Wakil Ketua III Bidang Kemahasiswaan & Kerjasama', 'level' => 2, 'can_approve_krs' => false, 'can_sign_transcripts' => false, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 5, 'code' => 'KEPALA_BAAK', 'name' => 'Kepala Biro Administrasi Akademik & Kemahasiswaan (BAAK)', 'level' => 3, 'can_approve_krs' => true, 'can_sign_transcripts' => false, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 6, 'code' => 'KAPRODI_PIAUD', 'name' => 'Ketua Program Studi S1 Pendidikan Islam Anak Usia Dini', 'level' => 3, 'can_approve_krs' => true, 'can_sign_transcripts' => false, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 7, 'code' => 'KAPRODI_MPI', 'name' => 'Ketua Program Studi S1 Manajemen Pendidikan Islam', 'level' => 3, 'can_approve_krs' => true, 'can_sign_transcripts' => false, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 8, 'code' => 'KAPRODI_ES', 'name' => 'Ketua Program Studi S1 Ekonomi Syariah', 'level' => 3, 'can_approve_krs' => true, 'can_sign_transcripts' => false, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 9, 'code' => 'KAPRODI_BKI', 'name' => 'Ketua Program Studi S1 Bimbingan Konseling Islam', 'level' => 3, 'can_approve_krs' => true, 'can_sign_transcripts' => false, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('lecturer_positions')->insertOrIgnore([
            [
                'id' => 1,
                'user_id' => 1, // superadmin
                'position_id' => 1, // KETUA
                'study_program_id' => null,
                'sk_number' => 'SK.001/YAYASAN-ITTH/KP/2024',
                'start_date' => '2024-01-01',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'user_id' => 6, // Dr. H. M. Ridwan, M.Ag
                'position_id' => 2, // WAKET_1
                'study_program_id' => 1,
                'sk_number' => 'SK.002/STAI-ITTH/KP/2024',
                'start_date' => '2024-01-01',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'user_id' => 3, // H. Ridwan Kamil, S.E.
                'position_id' => 3, // WAKET_2
                'study_program_id' => null,
                'sk_number' => 'SK.003/STAI-ITTH/KP/2024',
                'start_date' => '2024-01-01',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'user_id' => 4, // Dr. Ahmad Syafi'i, M.Ag
                'position_id' => 6, // KAPRODI_PIAUD
                'study_program_id' => 1,
                'sk_number' => 'SK.004/STAI-ITTH/KP/2024',
                'start_date' => '2024-01-01',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'user_id' => 5, // Dra. Hj. Siti Maryam, M.Pd.I
                'position_id' => 7, // KAPRODI_MPI
                'study_program_id' => 2,
                'sk_number' => 'SK.005/STAI-ITTH/KP/2024',
                'start_date' => '2024-01-01',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 6,
                'user_id' => 2, // Budi Santoso, S.Kom
                'position_id' => 5, // KEPALA_BAAK
                'study_program_id' => null,
                'sk_number' => 'SK.006/STAI-ITTH/KP/2024',
                'start_date' => '2024-01-01',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}

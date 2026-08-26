<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $passwordHash = Hash::make('salam123');
        $now = Carbon::now();

        // 1. SEED USERS (7 ROLES RESMI)
        DB::table('users')->insertOrIgnore([
            [
                'id' => 1,
                'username' => 'superadmin',
                'name' => 'Super Administrator',
                'identity_number' => 'SA-001',
                'email' => 'superadmin@staialittihad.ac.id',
                'password' => $passwordHash,
                'role' => 'superadmin',
                'phone_number' => '081234567890',
                'study_program' => 'Pusat Komputer & Sistem Informasi',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'username' => 'adminakademik',
                'name' => 'Budi Santoso, S.Kom',
                'identity_number' => '198504122010011002',
                'email' => 'budi.santoso@staialittihad.ac.id',
                'password' => $passwordHash,
                'role' => 'admin_akademik',
                'phone_number' => '081234567891',
                'study_program' => 'Biro Administrasi Akademik (BAAK)',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'username' => 'keuangan',
                'name' => 'H. Ridwan Kamil, S.E.',
                'identity_number' => '198203152008011003',
                'email' => 'keuangan@staialittihad.ac.id',
                'password' => $passwordHash,
                'role' => 'keuangan',
                'phone_number' => '081234567892',
                'study_program' => 'Biro Keuangan & Perbankan BSI',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'username' => '2118097201',
                'name' => "Dr. Ahmad Syafi'i, M.Ag",
                'identity_number' => '2118097201',
                'email' => 'kaprodi.pai@staialittihad.ac.id',
                'password' => $passwordHash,
                'role' => 'kaprodi',
                'phone_number' => '081234567893',
                'study_program' => 'Program Studi S1 PAI',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'username' => '2115047802',
                'name' => 'Dra. Hj. Siti Maryam, M.Pd.I',
                'identity_number' => '2115047802',
                'email' => 'siti.maryam.pa@staialittihad.ac.id',
                'password' => $passwordHash,
                'role' => 'dosen_pa',
                'phone_number' => '081234567894',
                'study_program' => 'Fakultas Tarbiyah (Dosen Wali PA)',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 6,
                'username' => '2112087501',
                'name' => 'Dr. H. M. Ridwan, M.Ag',
                'identity_number' => '2112087501',
                'email' => 'm.ridwan@staialittihad.ac.id',
                'password' => $passwordHash,
                'role' => 'dosen',
                'phone_number' => '081234567895',
                'study_program' => 'Fakultas Tarbiyah / PAI',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 7,
                'username' => '21010042',
                'name' => 'Ahmad Fauzi Rahman',
                'identity_number' => '21.01.0042',
                'email' => 'ahmad.fauzi@staialittihad.ac.id',
                'password' => $passwordHash,
                'role' => 'mahasiswa',
                'phone_number' => '081234567896',
                'study_program' => 'Pendidikan Agama Islam (S1)',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 2. SEED GEDUNG & RUANG KELAS
        DB::table('buildings')->insertOrIgnore([
            [
                'id' => 1,
                'code' => 'G-UTAMA',
                'name' => 'Gedung Rektorat & Kuliah Utama',
                'total_floors' => 3,
                'address' => 'Jl. Bojong Herang No. 12, Cianjur',
                'description' => 'Gedung pusat administrasi rektorat, BAAK, dan ruang perkuliahan teori.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'code' => 'G-TARBIYAH',
                'name' => 'Gedung Fakultas Tarbiyah & Laboratorium',
                'total_floors' => 2,
                'address' => 'Kampus 1 STAI Al-Ittihad Cianjur',
                'description' => 'Gedung perkuliahan prodi PAI, MPI, PGMI, dan lab microteaching.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('rooms')->insertOrIgnore([
            [
                'id' => 1,
                'building_id' => 1,
                'code' => 'R-101',
                'name' => 'Ruang Kuliah 101 (Teori)',
                'floor_number' => 1,
                'capacity' => 35,
                'exam_capacity' => 20,
                'room_type' => 'TEORI',
                'facilities' => json_encode(['AC', 'Proyektor LCD', 'Sound System', 'CCTV', 'Whiteboard']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'building_id' => 1,
                'code' => 'R-102',
                'name' => 'Ruang Kuliah 102 (Teori)',
                'floor_number' => 1,
                'capacity' => 40,
                'exam_capacity' => 25,
                'room_type' => 'TEORI',
                'facilities' => json_encode(['AC', 'Proyektor LCD', 'Whiteboard']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'building_id' => 2,
                'code' => 'LAB-KOMP',
                'name' => 'Laboratorium Komputer & CBT Center',
                'floor_number' => 2,
                'capacity' => 30,
                'exam_capacity' => 30,
                'room_type' => 'LAB_KOMPUTER',
                'facilities' => json_encode(['30 PC All-in-One', 'AC 2 PK', 'Gigabit LAN Switch', 'CCTV 360']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'building_id' => 1,
                'code' => 'AUDITORIUM',
                'name' => 'Auditorium Utama Al-Ittihad',
                'floor_number' => 3,
                'capacity' => 250,
                'exam_capacity' => 150,
                'room_type' => 'AUDITORIUM',
                'facilities' => json_encode(['Videotron LED', 'Line Array Sound System', 'Central AC', 'VIP Stage']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 3. SEED TAHUN AKADEMIK & PERIODE
        DB::table('academic_years')->insertOrIgnore([
            [
                'id' => 1,
                'code' => '2026/2027',
                'name' => 'Tahun Akademik 2026/2027',
                'start_date' => '2026-09-01',
                'end_date' => '2027-08-31',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('academic_periods')->insertOrIgnore([
            [
                'id' => 1,
                'academic_year_id' => 1,
                'code' => '20261',
                'name' => 'Semester Ganjil 2026/2027',
                'semester_type' => 'GANJIL',
                'start_date' => '2026-09-01',
                'end_date' => '2027-01-31',
                'krs_start_date' => '2026-08-15',
                'krs_end_date' => '2026-09-10',
                'krs_revision_end_date' => '2026-09-17',
                'payment_start_date' => '2026-08-01',
                'payment_end_date' => '2026-09-05',
                'grading_start_date' => '2027-01-10',
                'grading_end_date' => '2027-02-05',
                'edom_start_date' => '2026-12-15',
                'edom_end_date' => '2027-01-15',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 4. SEED FAKULTAS & 5 PRODI
        DB::table('faculties')->insertOrIgnore([
            [
                'id' => 1,
                'code' => 'TARBIYAH',
                'name' => 'Fakultas Tarbiyah dan Keguruan',
                'dean_name' => "Prof. Dr. KH. Abdul Halim, M.A.",
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'code' => 'SYARIAH',
                'name' => 'Fakultas Syariah dan Ekonomi Islam',
                'dean_name' => "Dr. H. M. Ridwan, M.Ag",
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('study_programs')->insertOrIgnore([
            [
                'id' => 1,
                'faculty_id' => 1,
                'code' => 'PAI',
                'name' => 'Pendidikan Agama Islam (S1)',
                'degree' => 'S1',
                'accreditation' => 'Unggul',
                'sk_number' => 'SK-BAN-PT-PAI-2024',
                'head_of_program_id' => 4, // Dr. Ahmad Syafi'i
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'faculty_id' => 1,
                'code' => 'MPI',
                'name' => 'Manajemen Pendidikan Islam (S1)',
                'degree' => 'S1',
                'accreditation' => 'Baik Sekali',
                'sk_number' => 'SK-BAN-PT-MPI-2024',
                'head_of_program_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'faculty_id' => 2,
                'code' => 'HES',
                'name' => 'Hukum Ekonomi Syariah (S1)',
                'degree' => 'S1',
                'accreditation' => 'Baik Sekali',
                'sk_number' => 'SK-BAN-PT-HES-2024',
                'head_of_program_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'faculty_id' => 1,
                'code' => 'PGMI',
                'name' => 'Pendidikan Guru Madrasah Ibtidaiyah (S1)',
                'degree' => 'S1',
                'accreditation' => 'B',
                'sk_number' => 'SK-BAN-PT-PGMI-2024',
                'head_of_program_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'faculty_id' => 2,
                'code' => 'ESY',
                'name' => 'Ekonomi Syariah (S1)',
                'degree' => 'S1',
                'accreditation' => 'B',
                'sk_number' => 'SK-BAN-PT-ESY-2024',
                'head_of_program_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 5. SEED KURIKULUM & MATA KULIAH
        DB::table('curricula')->insertOrIgnore([
            [
                'id' => 1,
                'study_program_id' => 1,
                'code' => 'KUR-PAI-2024',
                'name' => 'Kurikulum Merdeka OBE PAI 2024',
                'start_year' => 2024,
                'total_credits_required' => 144,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('courses')->insertOrIgnore([
            [
                'id' => 1,
                'curriculum_id' => 1,
                'code' => 'PAI-301',
                'name' => 'Fiqih Mawaris',
                'name_en' => 'Islamic Inheritance Law',
                'credits' => 3,
                'theory_credits' => 3,
                'practice_credits' => 0,
                'semester_level' => 3,
                'course_type' => 'WAJIB_PRODI',
                'description' => 'Kajian hukum waris Islam, ashabul furudh, ashabah, hijab, dan kalkulasi pembagian tirkah.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'curriculum_id' => 1,
                'code' => 'PAI-101',
                'name' => "Ulumul Qur'an",
                'name_en' => 'Quranic Sciences',
                'credits' => 2,
                'theory_credits' => 2,
                'practice_credits' => 0,
                'semester_level' => 1,
                'course_type' => 'WAJIB_INSTITUSI',
                'description' => 'Kajian asbabun nuzul, makkiyyah-madaniyyah, nasikh-mansukh, dan kaidah tafsir.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'curriculum_id' => 1,
                'code' => 'MKU-101',
                'name' => 'Bahasa Arab Dasar',
                'name_en' => 'Basic Arabic Language',
                'credits' => 2,
                'theory_credits' => 1,
                'practice_credits' => 1,
                'semester_level' => 1,
                'course_type' => 'WAJIB_INSTITUSI',
                'description' => 'Penguasaan dasar qawaid nahwu sharaf dan muhadatsah sehari-hari.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'curriculum_id' => 1,
                'code' => 'PAI-202',
                'name' => 'Fiqih Ibadah & Muamalah',
                'name_en' => 'Islamic Jurisprudence',
                'credits' => 3,
                'theory_credits' => 3,
                'practice_credits' => 0,
                'semester_level' => 2,
                'course_type' => 'WAJIB_PRODI',
                'description' => 'Kajian mendalam fiqih thaharah, shalat, zakat, puasa, haji, dan transaksi muamalah kontemporer.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 5,
                'curriculum_id' => 1,
                'code' => 'PAI-401',
                'name' => 'Metodologi Penelitian Pendidikan Islam',
                'name_en' => 'Islamic Educational Research Methodology',
                'credits' => 3,
                'theory_credits' => 2,
                'practice_credits' => 1,
                'semester_level' => 4,
                'course_type' => 'WAJIB_PRODI',
                'description' => 'Metode kuantitatif, kualitatif, R&D, dan penulisan karya ilmiah/skripsi bidang PAI.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 6,
                'curriculum_id' => 1,
                'code' => 'MPI-101',
                'name' => 'Dasar-Dasar Manajemen Pendidikan Islam',
                'name_en' => 'Fundamentals of Islamic Educational Management',
                'credits' => 2,
                'theory_credits' => 2,
                'practice_credits' => 0,
                'semester_level' => 1,
                'course_type' => 'WAJIB_PRODI',
                'description' => 'Prinsip kepemimpinan, perencanaan, dan pengorganisasian lembaga pendidikan Islam.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 5b. SEED MATAKULIAH PRASYARAT
        DB::table('course_prerequisites')->insertOrIgnore([
            [
                'id' => 1,
                'course_id' => 1, // PAI-301 Fiqih Mawaris
                'prerequisite_course_id' => 4, // PAI-202 Fiqih Ibadah & Muamalah
                'minimum_grade' => 'C',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'course_id' => 5, // PAI-401 Metodologi Penelitian
                'prerequisite_course_id' => 2, // PAI-101 Ulumul Qur'an
                'minimum_grade' => 'C',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // 6. SEED JABATAN STRUKTURAL
        DB::table('structural_positions')->insertOrIgnore([
            ['id' => 1, 'code' => 'KETUA', 'name' => 'Ketua STAI Al-Ittihad', 'level' => 1, 'can_approve_krs' => false, 'can_sign_transcripts' => true, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 2, 'code' => 'WAKET_1', 'name' => 'Wakil Ketua I Bidang Akademik', 'level' => 2, 'can_approve_krs' => true, 'can_sign_transcripts' => true, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3, 'code' => 'WAKET_2', 'name' => 'Wakil Ketua II Bidang Keuangan', 'level' => 2, 'can_approve_krs' => false, 'can_sign_transcripts' => false, 'can_manage_finance' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 4, 'code' => 'KAPRODI', 'name' => 'Ketua Program Studi', 'level' => 3, 'can_approve_krs' => true, 'can_sign_transcripts' => false, 'can_manage_finance' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('pmb_periods')->insertOrIgnore([
            [
                'id' => 1,
                'academic_year_id' => 1,
                'batch_number' => 1,
                'name' => 'PMB Gelombang 1 TA 2026/2027',
                'start_date' => '2026-03-01',
                'end_date' => '2026-06-30',
                'registration_fee' => 250000,
                'quota' => 250,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('pmb_applicants')->insertOrIgnore([
            [
                'id' => 1,
                'pmb_period_id' => 1,
                'registration_number' => 'PMB-2026-0001',
                'full_name' => 'Muhammad Rizky Pratama',
                'mother_name' => 'Siti Khodijah',
                'nik' => '3203011204040001',
                'phone_number' => '081234567890',
                'email' => 'rizky.pratama@gmail.com',
                'gender' => 'L',
                'birth_place' => 'Cianjur',
                'birth_date' => '2004-04-12',
                'address' => 'Jl. Raya Cipanas No. 45 Cianjur',
                'previous_school' => 'MAN 1 Cianjur',
                'nisn' => '0041234567',
                'first_choice_program_id' => 1, // PAI
                'second_choice_program_id' => 2, // MPI
                'pathway' => 'REGULER',
                'status' => 'LULUS_SELEKSI',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'pmb_period_id' => 1,
                'registration_number' => 'PMB-2026-0002',
                'full_name' => 'Nurul Aisyah Zahra',
                'mother_name' => 'Hj. Halimah',
                'nik' => '3203015508050002',
                'phone_number' => '085721345678',
                'email' => 'nurul.zahra@gmail.com',
                'gender' => 'P',
                'birth_place' => 'Bandung',
                'birth_date' => '2005-08-15',
                'address' => 'Komplek Griya Ittihad No. 12 Cianjur',
                'previous_school' => 'SMA Plus Al-Ittihad',
                'nisn' => '0059876543',
                'first_choice_program_id' => 2, // MPI
                'second_choice_program_id' => 1, // PAI
                'pathway' => 'TAHFIDZ',
                'status' => 'TERVERIFIKASI',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'pmb_period_id' => 1,
                'registration_number' => 'PMB-2026-0003',
                'full_name' => 'Fajar Hidayatullah',
                'mother_name' => 'Maryam Sulaeman',
                'nik' => '3203012211040003',
                'phone_number' => '087899887766',
                'email' => 'fajar.hidayat@gmail.com',
                'gender' => 'L',
                'birth_place' => 'Sukabumi',
                'birth_date' => '2004-11-22',
                'address' => 'Kp. Cijedil RT 02/04 Cugenang Cianjur',
                'previous_school' => 'SMA Negeri 2 Cianjur',
                'nisn' => '0045566778',
                'first_choice_program_id' => 3, // HES
                'second_choice_program_id' => 5, // ESY
                'pathway' => 'REGULER',
                'status' => 'MENUNGGU_PEMBAYARAN',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('student_invoices')->insertOrIgnore([
            [
                'id' => 2,
                'invoice_number' => 'INV-PMB-20260301-0001',
                'user_id' => null,
                'pmb_applicant_id' => 1,
                'fee_type_id' => 1,
                'academic_period_id' => 1,
                'amount' => 250000,
                'discount_amount' => 0,
                'penalty_amount' => 0,
                'final_amount' => 250000,
                'due_date' => '2026-06-30 23:59:59',
                'status' => 'LUNAS',
                'paid_at' => '2026-03-05 14:20:00',
                'payment_method' => 'VA_BSI',
                'notes' => 'Pembayaran Biaya PMB Online - Muhammad Rizky Pratama',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'invoice_number' => 'INV-PMB-20260302-0002',
                'user_id' => null,
                'pmb_applicant_id' => 2,
                'fee_type_id' => 1,
                'academic_period_id' => 1,
                'amount' => 250000,
                'discount_amount' => 0,
                'penalty_amount' => 0,
                'final_amount' => 250000,
                'due_date' => '2026-06-30 23:59:59',
                'status' => 'LUNAS',
                'paid_at' => '2026-03-06 09:10:00',
                'payment_method' => 'VA_BSI',
                'notes' => 'Pembayaran Biaya PMB Online - Nurul Aisyah Zahra',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'invoice_number' => 'INV-PMB-20260303-0003',
                'user_id' => null,
                'pmb_applicant_id' => 3,
                'fee_type_id' => 1,
                'academic_period_id' => 1,
                'amount' => 250000,
                'discount_amount' => 0,
                'penalty_amount' => 0,
                'final_amount' => 250000,
                'due_date' => '2026-06-30 23:59:59',
                'status' => 'BELUM_BAYAR',
                'paid_at' => null,
                'payment_method' => null,
                'notes' => 'Pembayaran Biaya PMB Online - Fajar Hidayatullah',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('va_bsi_transactions')->insertOrIgnore([
            [
                'id' => 2,
                'student_invoice_id' => 2,
                'va_number' => '99280126000001',
                'channel' => 'BSI_MOBILE',
                'amount' => 250000,
                'status' => 'PAID',
                'bsi_reference_no' => 'BSI-PMB-20260305-001',
                'payment_datetime' => '2026-03-05 14:20:00',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'student_invoice_id' => 3,
                'va_number' => '99280126000002',
                'channel' => 'BSI_MOBILE',
                'amount' => 250000,
                'status' => 'PAID',
                'bsi_reference_no' => 'BSI-PMB-20260306-002',
                'payment_datetime' => '2026-03-06 09:10:00',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'student_invoice_id' => 4,
                'va_number' => '99280126000003',
                'channel' => 'BSI_MOBILE',
                'amount' => 250000,
                'status' => 'PENDING',
                'bsi_reference_no' => null,
                'payment_datetime' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('fee_types')->insertOrIgnore([
            ['id' => 1, 'code' => 'PMB', 'name' => 'Biaya Pendaftaran PMB', 'va_bill_code' => '01', 'default_amount' => 250000, 'is_periodic' => false, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 2, 'code' => 'SPP_UKT', 'name' => 'UKT / SPP Semesteran', 'va_bill_code' => '02', 'default_amount' => 2500000, 'is_periodic' => true, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 3, 'code' => 'PRAKTIKUM', 'name' => 'Biaya Praktikum & Laboratorium', 'va_bill_code' => '03', 'default_amount' => 350000, 'is_periodic' => false, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 4, 'code' => 'SIDANG_SKRIPSI', 'name' => 'Ujian Sidang Munaqasyah Skripsi', 'va_bill_code' => '04', 'default_amount' => 1500000, 'is_periodic' => false, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 5, 'code' => 'WISUDA', 'name' => 'Biaya Wisuda & Ijazah', 'va_bill_code' => '05', 'default_amount' => 2000000, 'is_periodic' => false, 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 8. SEED INVOICE SPP MAHASISWA & VA BSI
        DB::table('student_invoices')->insertOrIgnore([
            [
                'id' => 1,
                'invoice_number' => 'INV-202608-0042',
                'user_id' => 7, // Ahmad Fauzi Rahman
                'pmb_applicant_id' => null,
                'fee_type_id' => 2, // SPP_UKT
                'academic_period_id' => 1,
                'amount' => 2500000,
                'discount_amount' => 0,
                'penalty_amount' => 0,
                'final_amount' => 2500000,
                'due_date' => '2026-09-05 23:59:59',
                'status' => 'LUNAS',
                'paid_at' => '2026-08-20 10:15:30',
                'payment_method' => 'VA_BSI',
                'notes' => 'Pembayaran lunas via BSI Mobile Banking.',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('va_bsi_transactions')->insertOrIgnore([
            [
                'id' => 1,
                'student_invoice_id' => 1,
                'va_number' => '99280221010042',
                'channel' => 'BSI_MOBILE',
                'amount' => 2500000,
                'status' => 'PAID',
                'bsi_reference_no' => 'BSI-JRN-202608200019284',
                'payment_datetime' => '2026-08-20 10:15:30',
                'raw_callback_payload' => json_encode(['status' => 'SUCCESS', 'amount' => 2500000, 'journal' => 'BSI-JRN-202608200019284']),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 9. SEED KELAS & JADWAL PERKULIAHAN (ANTI-CLASH TESTBED)
        DB::table('course_classes')->insertOrIgnore([
            [
                'id' => 1,
                'academic_period_id' => 1,
                'course_id' => 1, // Fiqih Mawaris
                'name' => 'PAI-301 (Kelas A)',
                'code' => 'cls-20261-pai301-a',
                'capacity' => 35,
                'delivery_mode' => 'TATAP_MUKA',
                'status' => 'AKTIF',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'academic_period_id' => 1,
                'course_id' => 2, // Ulumul Qur'an
                'name' => 'PAI-101 (Kelas A)',
                'code' => 'cls-20261-pai101-a',
                'capacity' => 40,
                'delivery_mode' => 'TATAP_MUKA',
                'status' => 'AKTIF',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'academic_period_id' => 1,
                'course_id' => 3, // Bahasa Arab Dasar
                'name' => 'MKU-101 (Kelas A)',
                'code' => 'cls-20261-mku101-a',
                'capacity' => 35,
                'delivery_mode' => 'TATAP_MUKA',
                'status' => 'AKTIF',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'academic_period_id' => 1,
                'course_id' => 4, // Fiqih Ibadah & Muamalah
                'name' => 'PAI-202 (Kelas A)',
                'code' => 'cls-20261-pai202-a',
                'capacity' => 35,
                'delivery_mode' => 'TATAP_MUKA',
                'status' => 'AKTIF',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('class_schedules')->insertOrIgnore([
            [
                'id' => 1,
                'course_class_id' => 1,
                'room_id' => 1, // R-101
                'day_of_week' => 'SENIN',
                'start_time' => '08:00:00',
                'end_time' => '09:40:00',
                'is_online' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'course_class_id' => 2,
                'room_id' => 2, // R-102
                'day_of_week' => 'SENIN',
                'start_time' => '10:00:00',
                'end_time' => '11:40:00',
                'is_online' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'course_class_id' => 3,
                'room_id' => 1, // R-101
                'day_of_week' => 'SELASA',
                'start_time' => '08:00:00',
                'end_time' => '09:40:00',
                'is_online' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'course_class_id' => 4,
                'room_id' => 3, // LAB-KOMP
                'day_of_week' => 'RABU',
                'start_time' => '13:00:00',
                'end_time' => '15:30:00',
                'is_online' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('class_lecturers')->insertOrIgnore([
            [
                'id' => 1,
                'course_class_id' => 1,
                'lecturer_id' => 6, // Dr. H. M. Ridwan, M.Ag
                'is_primary' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'course_class_id' => 2,
                'lecturer_id' => 4, // Dr. Ahmad Syafi'i, M.Ag
                'is_primary' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'course_class_id' => 3,
                'lecturer_id' => 5, // Dra. Hj. Siti Maryam, M.Pd.I
                'is_primary' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'course_class_id' => 4,
                'lecturer_id' => 6, // Dr. H. M. Ridwan, M.Ag
                'is_primary' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('class_enrollments')->insertOrIgnore([
            [
                'id' => 1,
                'course_class_id' => 1,
                'student_id' => 7, // Ahmad Fauzi
                'status' => 'TERDAFTAR',
                'enrolled_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'course_class_id' => 2,
                'student_id' => 7, // Ahmad Fauzi
                'status' => 'TERDAFTAR',
                'enrolled_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'course_class_id' => 3,
                'student_id' => 7, // Ahmad Fauzi
                'status' => 'TERDAFTAR',
                'enrolled_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 10. SEED KONVERSI NILAI MBKM & TRANSFER
        DB::table('transfer_grade_conversions')->insertOrIgnore([
            [
                'id' => 1,
                'student_id' => 7,
                'target_course_id' => 3, // Bahasa Arab Dasar
                'conversion_type' => 'MBKM_KAMPUS_MENGAJAR',
                'origin_institution' => 'Kemendikbudristek Kampus Mengajar Batch 6',
                'origin_course_name' => 'Penguatan Literasi & Bahasa Arab Terapan',
                'origin_credits' => 3,
                'origin_grade_letter' => 'A',
                'converted_grade_letter' => 'A',
                'converted_grade_point' => 4.00,
                'sk_number' => 'SK-REKOGNISI-MBKM-2026/042',
                'status' => 'DISETUJUI',
                'approved_by_id' => 4, // Kaprodi
                'notes' => 'Konversi ekuivalensi program Kampus Mengajar Kemendikbudristek.',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 11. SEED SISTEM SETTINGS & PDDIKTI FEEDER CONFIG
        DB::table('system_settings')->insertOrIgnore([
            ['key' => 'institution_name', 'group' => 'INSTITUTION', 'value' => 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'institution_code', 'group' => 'INSTITUTION', 'value' => '213042', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'bsi_prefix', 'group' => 'BSI', 'value' => '9928', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'bsi_merchant_id', 'group' => 'BSI', 'value' => 'stai_alittihad_bsi_client_2026', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'lms_gateway_url', 'group' => 'LMS', 'value' => 'http://localhost:5000/api/v1', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'pddikti_feeder_url', 'group' => 'PDDIKTI', 'value' => 'http://localhost:8100/ws/live.php?json', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'pddikti_feeder_token', 'group' => 'PDDIKTI', 'value' => 'mock_pddikti_token_stai_alittihad_2026', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'pddikti_mode', 'group' => 'PDDIKTI', 'value' => 'SANDBOX', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 12. SEED SETUP TARIF BIAYA PER TAHUN AKADEMIK & PRODI
        DB::table('fee_tariffs')->insertOrIgnore([
            // TA 2026/2027 (Tahun Akademik Id: 1)
            ['academic_year_id' => 1, 'study_program_id' => 1, 'fee_type_id' => 2, 'amount' => 2500000, 'description' => 'SPP/UKT Semesteran PAI (TA 2026/2027)', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => 2, 'fee_type_id' => 2, 'amount' => 2400000, 'description' => 'SPP/UKT Semesteran MPI (TA 2026/2027)', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => 3, 'fee_type_id' => 2, 'amount' => 2450000, 'description' => 'SPP/UKT Semesteran HES (TA 2026/2027)', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => 4, 'fee_type_id' => 2, 'amount' => 2350000, 'description' => 'SPP/UKT Semesteran PGMI (TA 2026/2027)', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => 5, 'fee_type_id' => 2, 'amount' => 2400000, 'description' => 'SPP/UKT Semesteran ESY (TA 2026/2027)', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => null, 'fee_type_id' => 1, 'amount' => 300000, 'description' => 'Biaya Registrasi PMB Mahasiswa Baru', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => null, 'fee_type_id' => 3, 'amount' => 450000, 'description' => 'Biaya Praktikum Laboratorium & Microteaching', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => null, 'fee_type_id' => 4, 'amount' => 1250000, 'description' => 'Biaya Ujian Munaqasyah & Sidang Skripsi', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['academic_year_id' => 1, 'study_program_id' => null, 'fee_type_id' => 5, 'amount' => 1750000, 'description' => 'Biaya Wisuda, Toga & Ijazah Digital Ber-QR', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // 13. SEED AUDIT LOGS AKTIVITAS KEAMANAN
        DB::table('audit_logs')->insertOrIgnore([
            [
                'user_id' => 1,
                'action' => 'LOGIN',
                'target_entity' => 'User',
                'target_id' => '1',
                'details' => json_encode(['user_name' => 'Super Administrator', 'user_role' => 'superadmin', 'device' => 'Windows / Chrome 128']),
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subMinutes(45),
                'updated_at' => $now->copy()->subMinutes(45),
            ],
            [
                'user_id' => 1,
                'action' => 'IMPERSONATE_START',
                'target_entity' => 'User',
                'target_id' => '2',
                'details' => json_encode(['user_name' => 'Super Administrator', 'user_role' => 'superadmin', 'target_user_name' => 'Budi Santoso, S.Kom', 'target_role' => 'admin_akademik']),
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subMinutes(30),
                'updated_at' => $now->copy()->subMinutes(30),
            ],
            [
                'user_id' => 5,
                'action' => 'GRADE_UPDATE',
                'target_entity' => 'GradeDistribution',
                'target_id' => '1',
                'details' => json_encode(['user_name' => 'Dr. H. M. Ridwan, M.Ag', 'user_role' => 'dosen', 'course' => 'Fiqih Mawaris', 'action_detail' => 'Input Nilai Akhir DPNA Mahasiswa']),
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subMinutes(20),
                'updated_at' => $now->copy()->subMinutes(20),
            ],
            [
                'user_id' => 2,
                'action' => 'KRS_APPROVE',
                'target_entity' => 'KrsSubmission',
                'target_id' => '1',
                'details' => json_encode(['user_name' => 'Budi Santoso, S.Kom', 'user_role' => 'admin_akademik', 'student_name' => 'Ahmad Fauzi Rahman', 'total_sks' => 21]),
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subMinutes(15),
                'updated_at' => $now->copy()->subMinutes(15),
            ],
            [
                'user_id' => null,
                'action' => 'BSI_PAYMENT_CALLBACK',
                'target_entity' => 'StudentInvoice',
                'target_id' => '1',
                'details' => json_encode(['va_number' => '99280221010042', 'amount' => 2500000, 'channel' => 'BSI_MOBILE', 'status' => 'LUNAS', 'reference_no' => 'BSI-JRN-202608200019284']),
                'ip_address' => '103.144.12.5',
                'user_agent' => 'BSI-H2H-Gateway-Client/2.0',
                'created_at' => $now->copy()->subMinutes(10),
                'updated_at' => $now->copy()->subMinutes(10),
            ],
        ]);

        // 14. SEED PENGUMUMAN BROADCAST CIVITAS
        DB::table('announcements')->insertOrIgnore([
            [
                'id' => 1,
                'title' => 'Pengumuman Jadwal Pengisian KRS Online Semester Ganjil TA 2026/2027',
                'content' => 'Diberitahukan kepada seluruh mahasiswa STAI Al-Ittihad bahwa pengisian KRS Online semester ganjil dibuka tanggal 1 s.d. 10 September 2026. Pastikan telah melunasi tagihan SPP via Virtual Account BSI.',
                'type' => 'INFO',
                'target_role' => 'MAHASISWA',
                'target_study_program_id' => null,
                'target_batch_year' => null,
                'is_pinned' => true,
                'is_active' => true,
                'created_by_id' => 2,
                'start_date' => '2026-08-25',
                'end_date' => '2026-09-15',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'title' => 'Batas Akhir Input Nilai Akhir Semester (DPNA) oleh Dosen Pengampu',
                'content' => 'Batas akhir penginputan nilai dan penguncian lembar DPNA pada sistem SIAKAD adalah tanggal 30 Agustus 2026 pukul 23:59 WIB. Mohon segera melengkapi nilai tugas, UTS, dan UAS.',
                'type' => 'WARNING',
                'target_role' => 'DOSEN',
                'target_study_program_id' => null,
                'target_batch_year' => null,
                'is_pinned' => true,
                'is_active' => true,
                'created_by_id' => 2,
                'start_date' => '2026-08-20',
                'end_date' => '2026-08-30',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'title' => 'Pendaftaran Sidang Munaqasyah & Yudisium Sarjana Periode I Telah Dibuka',
                'content' => 'Bagi mahasiswa semester akhir yang telah menyelesaikan naskah skripsi dan bebas administrasi perpustakaan serta keuangan, pendaftaran yudisium dapat diajukan melalui portal akademik.',
                'type' => 'EVENT',
                'target_role' => 'ALL',
                'target_study_program_id' => null,
                'target_batch_year' => null,
                'is_pinned' => false,
                'is_active' => true,
                'created_by_id' => 1,
                'start_date' => '2026-08-01',
                'end_date' => '2026-09-30',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 15. SEED PERIODE YUDISIUM & PESERTA
        DB::table('yudisium_periods')->insertOrIgnore([
            [
                'id' => 1,
                'academic_year_id' => 1,
                'name' => 'Yudisium Sarjana Strata-1 (S1) Periode I TA 2026/2027',
                'event_date' => '2026-10-15',
                'registration_deadline' => '2026-09-30',
                'sk_number' => 'SK-YUDISIUM-STAI-2026/089',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        DB::table('yudisium_applicants')->insertOrIgnore([
            [
                'id' => 1,
                'yudisium_period_id' => 1,
                'student_id' => 7, // Ahmad Fauzi Rahman
                'gpa' => 3.85,
                'total_credits' => 146,
                'predicate' => 'DENGAN PUJIAN (CUMLAUDE)',
                'thesis_title' => 'Implementasi Metode Pembelajaran Fiqih Berbasis Digital di Madrasah Aliyah Cianjur',
                'is_library_free' => true,
                'is_finance_free' => true,
                'status' => 'LOLOS_VERIFIKASI',
                'certificate_hash' => 'YUD-2026-PAI-007-8892',
                'notes' => 'Memenuhi seluruh syarat kelulusan dan bebas administrasi.',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);
    }
}

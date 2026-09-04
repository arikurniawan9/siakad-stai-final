-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 006: STUDENT MANAGEMENT ENHANCEMENT
-- =========================================================================

-- 1. Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nim VARCHAR(32) UNIQUE NOT NULL,
  study_program_id VARCHAR(64) REFERENCES study_programs(id) ON DELETE SET NULL,
  academic_advisor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  entry_year INT NOT NULL DEFAULT 2024,
  entry_semester VARCHAR(32) NOT NULL DEFAULT 'Ganjil',
  current_semester INT NOT NULL DEFAULT 1,
  academic_status VARCHAR(32) NOT NULL DEFAULT 'AKTIF', -- 'AKTIF', 'CUTI', 'LULUS', 'DROP_OUT', 'NONAKTIF'
  gpa NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  total_credits_earned INT NOT NULL DEFAULT 0,
  gender VARCHAR(16) DEFAULT 'Laki-laki', -- 'Laki-laki', 'Perempuan'
  birth_place VARCHAR(64) DEFAULT 'Cianjur',
  birth_date DATE DEFAULT '2004-01-01',
  phone_number VARCHAR(32) DEFAULT '081234567890',
  address TEXT DEFAULT 'Jl. Raya Cianjur-Bandung, Jawa Barat',
  guardian_name VARCHAR(128) DEFAULT 'Orang Tua / Wali',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Mahasiswa Users & Profiles
-- Password hash default for 'salam2026!': '$2b$10$wE8Pq4Vf8kH2N6D9X.m.beY1J9P8o5G8Z2g4R3p9k1Q6Z8w4T2l5G'
INSERT INTO users (id, username, password_hash, name, identity_number, email, role, study_program, is_active)
VALUES
  -- 1. PAI Students
  ('usr-mhs-01', 'mahasiswa', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Ahmad Fauzi', '21.01.0042', 'ahmad.fauzi@student.stai-alittihad.ac.id', 'mahasiswa', 'Pendidikan Agama Islam (PAI)', TRUE),
  ('usr-mhs-02', 'mhs.fatimah', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Siti Fatimah Zahra', '22.01.0015', 'fatimah.zahra@student.stai-alittihad.ac.id', 'mahasiswa', 'Pendidikan Agama Islam (PAI)', TRUE),
  ('usr-mhs-03', 'mhs.habib', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Habibullah Al-Habsyi', '23.01.0028', 'habibullah@student.stai-alittihad.ac.id', 'mahasiswa', 'Pendidikan Agama Islam (PAI)', TRUE),

  -- 2. MPI Students
  ('usr-mhs-04', 'mhs.ridwan', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Muhammad Ridwan Nur', '22.02.0008', 'm.ridwan.nur@student.stai-alittihad.ac.id', 'mahasiswa', 'Manajemen Pendidikan Islam (MPI)', TRUE),
  ('usr-mhs-05', 'mhs.aulia', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Aulia Rahmawati', '23.02.0019', 'aulia.rahma@student.stai-alittihad.ac.id', 'mahasiswa', 'Manajemen Pendidikan Islam (MPI)', TRUE),

  -- 3. HES Students
  ('usr-mhs-06', 'mhs.haidar', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Ali Haidar Rasyid', '22.03.0012', 'ali.haidar@student.stai-alittihad.ac.id', 'mahasiswa', 'Hukum Ekonomi Syariah (Muamalah)', TRUE),
  ('usr-mhs-07', 'mhs.nurul', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Nurul Izzah Fitriani', '23.03.0033', 'nurul.izzah@student.stai-alittihad.ac.id', 'mahasiswa', 'Hukum Ekonomi Syariah (Muamalah)', TRUE),

  -- 4. PGMI Students
  ('usr-mhs-08', 'mhs.zahid', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Zahid Abdul Malik', '23.04.0005', 'zahid.malik@student.stai-alittihad.ac.id', 'mahasiswa', 'Pendidikan Guru Madrasah Ibtidaiyah (PGMI)', TRUE),
  ('usr-mhs-09', 'mhs.salma', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Salma Mutmainnah', '24.04.0022', 'salma.mutmainnah@student.stai-alittihad.ac.id', 'mahasiswa', 'Pendidikan Guru Madrasah Ibtidaiyah (PGMI)', TRUE),

  -- 5. ESY Students
  ('usr-mhs-10', 'mhs.farhan', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Farhan Ramadhan', '23.05.0014', 'farhan.ramadhan@student.stai-alittihad.ac.id', 'mahasiswa', 'Ekonomi Syariah (ESY)', TRUE),
  ('usr-mhs-11', 'mhs.nabilah', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Nabilah Husna', '24.05.0009', 'nabilah.husna@student.stai-alittihad.ac.id', 'mahasiswa', 'Ekonomi Syariah (ESY)', TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  identity_number = EXCLUDED.identity_number,
  email = EXCLUDED.email,
  study_program = EXCLUDED.study_program,
  is_active = EXCLUDED.is_active;

-- 3. Seed student_profiles
INSERT INTO student_profiles (
  id, user_id, nim, study_program_id, academic_advisor_id, 
  entry_year, entry_semester, current_semester, academic_status, 
  gpa, total_credits_earned, gender, birth_place, birth_date, phone_number
)
VALUES
  ('prof-mhs-01', 'usr-mhs-01', '21.01.0042', 'prodi-pai', 'usr-dsn-pa', 2022, 'Ganjil', 5, 'AKTIF', 3.78, 88, 'Laki-laki', 'Cianjur', '2004-03-15', '081234567801'),
  ('prof-mhs-02', 'usr-mhs-02', '22.01.0015', 'prodi-pai', 'usr-dsn-pa', 2022, 'Ganjil', 5, 'AKTIF', 3.85, 92, 'Perempuan', 'Bandung', '2004-06-20', '081234567802'),
  ('prof-mhs-03', 'usr-mhs-03', '23.01.0028', 'prodi-pai', 'usr-dsn-01', 2023, 'Ganjil', 3, 'AKTIF', 3.65, 48, 'Laki-laki', 'Sukabumi', '2005-01-10', '081234567803'),

  ('prof-mhs-04', 'usr-mhs-04', '22.02.0008', 'prodi-mpi', 'usr-dsn-pa', 2022, 'Ganjil', 5, 'AKTIF', 3.72, 86, 'Laki-laki', 'Cianjur', '2004-08-12', '081234567804'),
  ('prof-mhs-05', 'usr-mhs-05', '23.02.0019', 'prodi-mpi', 'usr-dsn-01', 2023, 'Ganjil', 3, 'AKTIF', 3.90, 52, 'Perempuan', 'Bogor', '2005-04-25', '081234567805'),

  ('prof-mhs-06', 'usr-mhs-06', '22.03.0012', 'prodi-hes', 'usr-dsn-01', 2022, 'Ganjil', 5, 'AKTIF', 3.68, 84, 'Laki-laki', 'Cianjur', '2004-02-18', '081234567806'),
  ('prof-mhs-07', 'usr-mhs-07', '23.03.0033', 'prodi-hes', 'usr-dsn-pa', 2023, 'Ganjil', 3, 'AKTIF', 3.82, 50, 'Perempuan', 'Garut', '2005-09-05', '081234567807'),

  ('prof-mhs-08', 'usr-mhs-08', '23.04.0005', 'prodi-pgmi', 'usr-dsn-01', 2023, 'Ganjil', 3, 'AKTIF', 3.60, 46, 'Laki-laki', 'Cianjur', '2005-11-30', '081234567808'),
  ('prof-mhs-09', 'usr-mhs-09', '24.04.0022', 'prodi-pgmi', 'usr-dsn-pa', 2024, 'Ganjil', 1, 'AKTIF', 3.75, 20, 'Perempuan', 'Cianjur', '2006-05-14', '081234567809'),

  ('prof-mhs-10', 'usr-mhs-10', '23.05.0014', 'prodi-esy', 'usr-dsn-01', 2023, 'Ganjil', 3, 'AKTIF', 3.70, 48, 'Laki-laki', 'Jakarta', '2005-07-22', '081234567810'),
  ('prof-mhs-11', 'usr-mhs-11', '24.05.0009', 'prodi-esy', 'usr-dsn-pa', 2024, 'Ganjil', 1, 'AKTIF', 3.88, 22, 'Perempuan', 'Cianjur', '2006-02-08', '081234567811')
ON CONFLICT (id) DO UPDATE SET
  nim = EXCLUDED.nim,
  study_program_id = EXCLUDED.study_program_id,
  academic_advisor_id = EXCLUDED.academic_advisor_id,
  entry_year = EXCLUDED.entry_year,
  current_semester = EXCLUDED.current_semester,
  academic_status = EXCLUDED.academic_status,
  gpa = EXCLUDED.gpa,
  total_credits_earned = EXCLUDED.total_credits_earned,
  gender = EXCLUDED.gender,
  birth_place = EXCLUDED.birth_place,
  birth_date = EXCLUDED.birth_date,
  phone_number = EXCLUDED.phone_number,
  updated_at = CURRENT_TIMESTAMP;

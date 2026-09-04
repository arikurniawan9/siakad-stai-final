-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 007: LECTURER MANAGEMENT ENHANCEMENT
-- =========================================================================

-- 1. Create lecturer_profiles table
CREATE TABLE IF NOT EXISTS lecturer_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nidn VARCHAR(32) UNIQUE NOT NULL,
  nuptk VARCHAR(32),
  title_prefix VARCHAR(32),
  title_suffix VARCHAR(64),
  academic_rank VARCHAR(64) NOT NULL DEFAULT 'Lektor', -- 'Tenaga Pengajar', 'Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'
  highest_education VARCHAR(32) NOT NULL DEFAULT 'S2', -- 'S2', 'S3', 'Profesi'
  employment_status VARCHAR(64) NOT NULL DEFAULT 'TETAP', -- 'TETAP', 'LB', 'KONTRAK'
  homebase_prodi_id VARCHAR(64) REFERENCES study_programs(id) ON DELETE SET NULL,
  is_academic_advisor BOOLEAN NOT NULL DEFAULT TRUE,
  max_advisory_quota INT NOT NULL DEFAULT 30,
  specialization VARCHAR(128) DEFAULT 'Ilmu Pendidikan & Syariah',
  phone_number VARCHAR(32) DEFAULT '081234567890',
  address TEXT DEFAULT 'Jl. Raya Cianjur-Bandung, Jawa Barat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed / Upsert Dosen Users
-- Password hash default for 'salam2026!': '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m'
INSERT INTO users (id, username, password_hash, name, identity_number, email, role, study_program, is_active)
VALUES
  -- 1. PAI Faculty
  ('usr-dsn-01', 'dosen', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. H. M. Ridwan, M.Ag', '2108198501', 'm.ridwan@stai-alittihad.ac.id', 'dosen', 'Pendidikan Agama Islam (PAI)', TRUE),
  ('usr-dsn-pa', 'dosen_pa', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. Siti Maryam, M.Pd.I', '2112198002', 'siti.maryam@stai-alittihad.ac.id', 'dosen_pa', 'Pendidikan Agama Islam (PAI)', TRUE),
  ('usr-kaprodi', 'kaprodi', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. Ahmad Subagja, M.Pd', '2105197803', 'kaprodi.pai@stai-alittihad.ac.id', 'kaprodi', 'Pendidikan Agama Islam (PAI)', TRUE),

  -- 2. MPI Faculty
  ('usr-dsn-04', 'dsn.dedi', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. KH. Dedi Supriyadi, M.Ag', '2115048201', 'dedi.supriyadi@stai-alittihad.ac.id', 'dosen', 'Manajemen Pendidikan Islam (MPI)', TRUE),
  ('usr-dsn-05', 'dsn.nuraini', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. Hj. Nur Aini, M.M.Pd', '2120098402', 'nur.aini@stai-alittihad.ac.id', 'dosen', 'Manajemen Pendidikan Islam (MPI)', TRUE),

  -- 3. HES Faculty
  ('usr-dsn-06', 'dsn.syukri', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. Muhammad Syukri, M.H.I', '2107038101', 'm.syukri@stai-alittihad.ac.id', 'dosen', 'Hukum Ekonomi Syariah (Muamalah)', TRUE),
  ('usr-dsn-07', 'dsn.fikri', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'H. Fikri Amrullah, S.H.I., M.E', '2119118902', 'fikri.amrullah@stai-alittihad.ac.id', 'dosen', 'Hukum Ekonomi Syariah (Muamalah)', TRUE),

  -- 4. PGMI Faculty
  ('usr-dsn-08', 'dsn.endang', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. Hj. Endang Sulistyowati, M.Pd', '2114068301', 'endang.sulistyowati@stai-alittihad.ac.id', 'dosen', 'Pendidikan Guru Madrasah Ibtidaiyah (PGMI)', TRUE),
  ('usr-dsn-09', 'dsn.fauzan', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'H. Ahmad Fauzan, M.Pd.I', '2125089002', 'ahmad.fauzan@stai-alittihad.ac.id', 'dosen', 'Pendidikan Guru Madrasah Ibtidaiyah (PGMI)', TRUE),

  -- 5. ESY Faculty
  ('usr-dsn-10', 'dsn.faisal', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Dr. H. Faisal Rahman, M.E.Sy', '2109028001', 'faisal.rahman@stai-alittihad.ac.id', 'dosen', 'Ekonomi Syariah (ESY)', TRUE),
  ('usr-dsn-11', 'dsn.maisaroh', '$2b$10$iMhA52g94b/7Lq74J6k9n.3BwK/4vI9K5qB1i/h5Gz8L1r4f/1u7m', 'Siti Maisaroh, S.E.I., M.E', '2130109102', 'siti.maisaroh@stai-alittihad.ac.id', 'dosen', 'Ekonomi Syariah (ESY)', TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  identity_number = EXCLUDED.identity_number,
  email = EXCLUDED.email,
  study_program = EXCLUDED.study_program,
  is_active = EXCLUDED.is_active;

-- 3. Seed lecturer_profiles
INSERT INTO lecturer_profiles (
  id, user_id, nidn, nuptk, title_prefix, title_suffix,
  academic_rank, highest_education, employment_status, 
  homebase_prodi_id, is_academic_advisor, max_advisory_quota, specialization, phone_number
)
VALUES
  ('prof-dsn-01', 'usr-dsn-01', '2108198501', '98765432101', 'Dr. H.', 'M.Ag', 'Lektor Kepala', 'S3', 'TETAP', 'prodi-pai', TRUE, 30, 'Studi Al-Qur''an & Tafsir Tarbawi', '081234567001'),
  ('prof-dsn-02', 'usr-dsn-pa', '2112198002', '98765432102', 'Dr.', 'M.Pd.I', 'Lektor', 'S3', 'TETAP', 'prodi-pai', TRUE, 30, 'Metodologi Pembelajaran PAI & Evaluasi', '081234567002'),
  ('prof-dsn-03', 'usr-kaprodi', '2105197803', '98765432103', 'Dr.', 'M.Pd', 'Lektor Kepala', 'S3', 'TETAP', 'prodi-pai', TRUE, 25, 'Kebijakan & Kurikulum Pendidikan Islam', '081234567003'),

  ('prof-dsn-04', 'usr-dsn-04', '2115048201', '98765432104', 'Dr. KH.', 'M.Ag', 'Lektor Kepala', 'S3', 'TETAP', 'prodi-mpi', TRUE, 30, 'Kepemimpinan Lembaga Pendidikan Islam', '081234567004'),
  ('prof-dsn-05', 'usr-dsn-05', '2120098402', '98765432105', 'Dr. Hj.', 'M.M.Pd', 'Lektor', 'S3', 'TETAP', 'prodi-mpi', TRUE, 30, 'Manajemen Mutu & Supervisi Pendidikan', '081234567005'),

  ('prof-dsn-06', 'usr-dsn-06', '2107038101', '98765432106', 'Dr.', 'M.H.I', 'Lektor', 'S3', 'TETAP', 'prodi-hes', TRUE, 30, 'Fiqih Muamalah Kontemporer & Hukum Bisnis', '081234567006'),
  ('prof-dsn-07', 'usr-dsn-07', '2119118902', '98765432107', 'H.', 'S.H.I., M.E', 'Asisten Ahli', 'S2', 'TETAP', 'prodi-hes', TRUE, 25, 'Hukum Perbankan & Lembaga Keuangan Syariah', '081234567007'),

  ('prof-dsn-08', 'usr-dsn-08', '2114068301', '98765432108', 'Dr. Hj.', 'M.Pd', 'Lektor', 'S3', 'TETAP', 'prodi-pgmi', TRUE, 30, 'Pendidikan Dasar Islam & Pembelajaran Tematik', '081234567008'),
  ('prof-dsn-09', 'usr-dsn-09', '2125089002', '98765432109', 'H.', 'M.Pd.I', 'Asisten Ahli', 'S2', 'TETAP', 'prodi-pgmi', TRUE, 25, 'Media & Teknologi Pembelajaran MI/SD', '081234567009'),

  ('prof-dsn-10', 'usr-dsn-10', '2109028001', '98765432110', 'Dr. H.', 'M.E.Sy', 'Lektor', 'S3', 'TETAP', 'prodi-esy', TRUE, 30, 'Mikro & Makro Ekonomi Islam, Filantropi Islam', '081234567010'),
  ('prof-dsn-11', 'usr-dsn-11', '2130109102', '98765432111', '', 'S.E.I., M.E', 'Asisten Ahli', 'S2', 'TETAP', 'prodi-esy', TRUE, 25, 'Pasar Modal Syariah & Manajemen Investasi', '081234567011')
ON CONFLICT (id) DO UPDATE SET
  nidn = EXCLUDED.nidn,
  nuptk = EXCLUDED.nuptk,
  title_prefix = EXCLUDED.title_prefix,
  title_suffix = EXCLUDED.title_suffix,
  academic_rank = EXCLUDED.academic_rank,
  highest_education = EXCLUDED.highest_education,
  employment_status = EXCLUDED.employment_status,
  homebase_prodi_id = EXCLUDED.homebase_prodi_id,
  is_academic_advisor = EXCLUDED.is_academic_advisor,
  max_advisory_quota = EXCLUDED.max_advisory_quota,
  specialization = EXCLUDED.specialization,
  phone_number = EXCLUDED.phone_number,
  updated_at = CURRENT_TIMESTAMP;

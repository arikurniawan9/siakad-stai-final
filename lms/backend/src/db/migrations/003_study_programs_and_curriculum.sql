-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 003: STUDY PROGRAMS & CURRICULUM
-- =========================================================================

-- 1. Enhance study_programs table with institutional profile columns
ALTER TABLE study_programs
  ADD COLUMN IF NOT EXISTS head_of_program VARCHAR(128),
  ADD COLUMN IF NOT EXISTS head_nidn VARCHAR(64),
  ADD COLUMN IF NOT EXISTS accreditation VARCHAR(32) DEFAULT 'Baik',
  ADD COLUMN IF NOT EXISTS sk_number VARCHAR(128),
  ADD COLUMN IF NOT EXISTS sk_date DATE,
  ADD COLUMN IF NOT EXISTS degree_title VARCHAR(64) DEFAULT 'Sarjana Pendidikan (S.Pd.)',
  ADD COLUMN IF NOT EXISTS total_credits_required INT NOT NULL DEFAULT 144,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS email VARCHAR(128),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Create curriculums table
CREATE TABLE IF NOT EXISTS curriculums (
  id VARCHAR(64) PRIMARY KEY,
  study_program_id VARCHAR(64) NOT NULL REFERENCES study_programs(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  year INT NOT NULL DEFAULT 2024,
  total_credits INT NOT NULL DEFAULT 144,
  mandatory_credits INT NOT NULL DEFAULT 130,
  elective_credits INT NOT NULL DEFAULT 14,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(32) NOT NULL DEFAULT 'AKTIF', -- 'DRAF', 'AKTIF', 'DIARSIPKAN'
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_curriculums_prodi ON curriculums(study_program_id);
CREATE INDEX IF NOT EXISTS idx_curriculums_active ON curriculums(is_active);

-- 3. Create Graduates Learning Outcomes (Capaian Pembelajaran Lulusan / CPL) Table
CREATE TABLE IF NOT EXISTS program_learning_outcomes (
  id VARCHAR(64) PRIMARY KEY,
  study_program_id VARCHAR(64) NOT NULL REFERENCES study_programs(id) ON DELETE CASCADE,
  curriculum_id VARCHAR(64) REFERENCES curriculums(id) ON DELETE SET NULL,
  code VARCHAR(32) NOT NULL, -- e.g. "CPL-S-01", "CPL-P-02", "CPL-KU-01", "CPL-KK-01"
  category VARCHAR(32) NOT NULL DEFAULT 'PENGETAHUAN', -- 'SIKAP', 'PENGETAHUAN', 'KETERAMPILAN_UMUM', 'KETERAMPILAN_KHUSUS'
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cpl_prodi ON program_learning_outcomes(study_program_id);

-- 4. Seed Official Study Programs for STAI AL-ITTIHAD
INSERT INTO study_programs (
  id, code, name, degree, head_of_program, head_nidn, accreditation, 
  sk_number, sk_date, degree_title, total_credits_required, is_active, description, email
)
VALUES 
  (
    'prodi-pai', 'PAI', 'Pendidikan Agama Islam', 'S1', 
    'Dr. H. Ahmad Fauzi, M.Pd.I.', '2105088201', 'Unggul',
    'SK BAN-PT No. 4921/SK/BAN-PT/Akred/S/VIII/2024', '2024-08-10', 'Sarjana Pendidikan (S.Pd.)',
    144, TRUE, 'Mencetak sarjana pendidikan Islam yang berakhlak mulia, unggul dalam pedagogik digital dan metodologi pengajaran kontemporer.',
    'pai@stai-alittihad.ac.id'
  ),
  (
    'prodi-mpi', 'MPI', 'Manajemen Pendidikan Islam', 'S1', 
    'Dr. Hj. Siti Maryam, M.M.Pd.', '2112047802', 'Baik Sekali',
    'SK LAMDIK No. 1024/SK/LAMDIK/Ak/S/VI/2024', '2024-06-15', 'Sarjana Pendidikan (S.Pd.)',
    144, TRUE, 'Mempersiapkan manajer dan administrator lembaga pendidikan Islam yang profesional, akuntabel, dan berdaya saing global.',
    'mpi@stai-alittihad.ac.id'
  ),
  (
    'prodi-hes', 'HES', 'Hukum Ekonomi Syariah (Muamalah)', 'S1', 
    'H. Ridwan Malik, M.H.I.', '2123098503', 'Baik Sekali',
    'SK BAN-PT No. 3120/SK/BAN-PT/Akred/S/V/2024', '2024-05-20', 'Sarjana Hukum (S.H.)',
    144, TRUE, 'Menghasilkan ahli hukum ekonomi Islam, konsultan perbankan syariah, dan praktisi kepatuhan syariah yang berintegritas.',
    'hes@stai-alittihad.ac.id'
  ),
  (
    'prodi-pgmi', 'PGMI', 'Pendidikan Guru Madrasah Ibtidaiyah', 'S1', 
    'Ustadzah Nurul Hidayah, M.Pd.', '2118018904', 'Baik',
    'SK LAMDIK No. 892/SK/LAMDIK/Ak/S/IX/2023', '2023-09-12', 'Sarjana Pendidikan (S.Pd.)',
    144, TRUE, 'Mendidik calon guru kelas MI/SD Islam yang kompeten, kreatif, teladan, serta menguasai teknologi pembelajaran interaktif.',
    'pgmi@stai-alittihad.ac.id'
  ),
  (
    'prodi-esy', 'ESY', 'Ekonomi Syariah', 'S1', 
    'H. Fikri Pratama, S.E., M.E.', '2107069105', 'Baik',
    'SK BAN-PT No. 2450/SK/BAN-PT/Akred/S/XI/2023', '2023-11-05', 'Sarjana Ekonomi (S.E.)',
    144, TRUE, 'Mencetak technopreneur dan analis keuangan syariah yang menguasai ekosistem industri halal dan tata kelola bisnis Islam.',
    'esy@stai-alittihad.ac.id'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  head_of_program = EXCLUDED.head_of_program,
  head_nidn = EXCLUDED.head_nidn,
  accreditation = EXCLUDED.accreditation,
  sk_number = EXCLUDED.sk_number,
  sk_date = EXCLUDED.sk_date,
  degree_title = EXCLUDED.degree_title,
  total_credits_required = EXCLUDED.total_credits_required,
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description,
  email = EXCLUDED.email,
  updated_at = CURRENT_TIMESTAMP;

-- 5. Seed Curriculums for Programs
INSERT INTO curriculums (
  id, study_program_id, code, name, year, total_credits, mandatory_credits, elective_credits, is_active, status, description
)
VALUES
  (
    'cur-pai-2024', 'prodi-pai', 'KUR-PAI-2024', 'Kurikulum OBE Berbasis Karakter PAI 2024', 2024,
    144, 130, 14, TRUE, 'AKTIF', 'Kurikulum Outcome-Based Education dengan integrasi teknologi multimedia dan fiqh kontemporer.'
  ),
  (
    'cur-mpi-2024', 'prodi-mpi', 'KUR-MPI-2024', 'Kurikulum Merdeka Manajemen Lembaga Islam 2024', 2024,
    144, 128, 16, TRUE, 'AKTIF', 'Fokus pada digitalisasi tata kelola madrasah, kepemimpinan transformatif, dan kewirausahaan pendidikan.'
  ),
  (
    'cur-hes-2024', 'prodi-hes', 'KUR-HES-2024', 'Kurikulum Standar Industri Keuangan Syariah 2024', 2024,
    144, 132, 12, TRUE, 'AKTIF', 'Menghubungkan teori muamalah fiqhiyyah dengan regulasi fintech syariah dan audit perbankan syariah.'
  ),
  (
    'cur-pgmi-2024', 'prodi-pgmi', 'KUR-PGMI-2024', 'Kurikulum Pedagogik MI Interaktif 2024', 2024,
    144, 134, 10, TRUE, 'AKTIF', 'Fokus pada microteaching tematik, literasi numerasi dasar, dan penguatan nilai-nilai keislaman anak.'
  ),
  (
    'cur-esy-2024', 'prodi-esy', 'KUR-ESY-2024', 'Kurikulum Bisnis & Halal Value Chain 2024', 2024,
    144, 128, 16, TRUE, 'AKTIF', 'Pengembangan inkubasi bisnis halal, akuntansi syariah, dan instrumen filantropi Islam (ZISWAF).'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  year = EXCLUDED.year,
  total_credits = EXCLUDED.total_credits,
  mandatory_credits = EXCLUDED.mandatory_credits,
  elective_credits = EXCLUDED.elective_credits,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- 6. Seed Sample CPL (Capaian Pembelajaran Lulusan) for PAI
INSERT INTO program_learning_outcomes (id, study_program_id, curriculum_id, code, category, description)
VALUES
  ('cpl-pai-01', 'prodi-pai', 'cur-pai-2024', 'CPL-S-01', 'SIKAP', 'Bertaqwa kepada Allah SWT dan mampu menunjukkan sikap religius serta menjunjung tinggi nilai kemanusiaan.'),
  ('cpl-pai-02', 'prodi-pai', 'cur-pai-2024', 'CPL-P-01', 'PENGETAHUAN', 'Menguasai konsep teoretis ilmu pendidikan Islam, psikologi perkembangan anak, dan metodologi pembelajaran aktif.'),
  ('cpl-pai-03', 'prodi-pai', 'cur-pai-2024', 'CPL-KU-01', 'KETERAMPILAN_UMUM', 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan IPTEK bidang pendidikan Islam.'),
  ('cpl-pai-04', 'prodi-pai', 'cur-pai-2024', 'CPL-KK-01', 'KETERAMPILAN_KHUSUS', 'Mampu merancang, melaksanakan, dan mengevaluasi pembelajaran PAI berbasis multimedia interaktif secara kreatif dan inklusif.')
ON CONFLICT (id) DO NOTHING;

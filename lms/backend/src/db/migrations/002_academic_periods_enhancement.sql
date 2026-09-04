-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 002: ACADEMIC PERIODS ENHANCEMENT
-- =========================================================================

-- ENUM PERIOD STATUS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'period_status_enum') THEN
    CREATE TYPE period_status_enum AS ENUM (
      'DRAF',
      'AKTIF',
      'SELESAI',
      'DIARSIPKAN'
    );
  END IF;
END $$;

-- Enhance Academic Years Table
ALTER TABLE academic_years 
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'AKTIF',
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Enhance Semesters Table
ALTER TABLE semesters
  ADD COLUMN IF NOT EXISTS name VARCHAR(128),
  ADD COLUMN IF NOT EXISTS krs_start_date DATE,
  ADD COLUMN IF NOT EXISTS krs_end_date DATE,
  ADD COLUMN IF NOT EXISTS uts_start_date DATE,
  ADD COLUMN IF NOT EXISTS uts_end_date DATE,
  ADD COLUMN IF NOT EXISTS uas_start_date DATE,
  ADD COLUMN IF NOT EXISTS uas_end_date DATE,
  ADD COLUMN IF NOT EXISTS grade_deadline DATE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'AKTIF',
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT FALSE;

-- Indexes for Period Queries
CREATE INDEX IF NOT EXISTS idx_academic_years_active ON academic_years(is_active);
CREATE INDEX IF NOT EXISTS idx_semesters_active ON semesters(is_active);
CREATE INDEX IF NOT EXISTS idx_semesters_year ON semesters(academic_year_id);

-- Seed Essential Academic Periods if not present
INSERT INTO academic_years (id, name, start_date, end_date, is_active, status, description)
VALUES 
  ('ay-2025-2026', 'Tahun Akademik 2025/2026', '2025-09-01', '2026-08-31', FALSE, 'SELESAI', 'Tahun Akademik Reguler STAI AL-ITTIHAD 2025/2026'),
  ('ay-2026-2027', 'Tahun Akademik 2026/2027', '2026-09-01', '2027-08-31', TRUE, 'AKTIF', 'Tahun Akademik Reguler STAI AL-ITTIHAD 2026/2027')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status;

INSERT INTO semesters (
  id, academic_year_id, semester_type, name, start_date, end_date, 
  krs_start_date, krs_end_date, uts_start_date, uts_end_date, uas_start_date, uas_end_date, grade_deadline, 
  is_active, is_current, status
)
VALUES 
  (
    'sem-2025-genap', 'ay-2025-2026', 'GENAP', 'Semester Genap 2025/2026', '2026-02-16', '2026-07-31',
    '2026-02-01', '2026-02-14', '2026-04-13', '2026-04-24', '2026-06-22', '2026-07-03', '2026-07-17',
    FALSE, FALSE, 'SELESAI'
  ),
  (
    'sem-2026-ganjil', 'ay-2026-2027', 'GANJIL', 'Semester Ganjil 2026/2027', '2026-09-01', '2027-01-31',
    '2026-08-15', '2026-08-31', '2026-10-26', '2026-11-06', '2027-01-04', '2027-01-15', '2027-01-29',
    TRUE, TRUE, 'AKTIF'
  ),
  (
    'sem-2026-genap', 'ay-2026-2027', 'GENAP', 'Semester Genap 2026/2027', '2027-02-15', '2027-07-31',
    '2027-02-01', '2027-02-14', '2027-04-12', '2027-04-23', '2027-06-21', '2027-07-02', '2027-07-16',
    FALSE, FALSE, 'DRAF'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  krs_start_date = EXCLUDED.krs_start_date,
  krs_end_date = EXCLUDED.krs_end_date,
  status = EXCLUDED.status;

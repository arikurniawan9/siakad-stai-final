-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 008: GRADES AND TRANSCRIPTS ENHANCEMENT
-- =========================================================================

-- 1. Create course_grades table
CREATE TABLE IF NOT EXISTS course_grades (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE CASCADE,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  presence_score NUMERIC(5,2) NOT NULL DEFAULT 90.00, -- 10%
  assignment_score NUMERIC(5,2) NOT NULL DEFAULT 85.00, -- 20%
  quiz_score NUMERIC(5,2) NOT NULL DEFAULT 85.00, -- 15%
  midterm_score NUMERIC(5,2) NOT NULL DEFAULT 85.00, -- 25%
  final_exam_score NUMERIC(5,2) NOT NULL DEFAULT 88.00, -- 30%
  final_score NUMERIC(5,2) NOT NULL DEFAULT 86.65, -- 0 - 100
  letter_grade VARCHAR(4) NOT NULL DEFAULT 'A', -- 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'
  grade_point NUMERIC(3,2) NOT NULL DEFAULT 4.00, -- 4.00, 3.75, 3.50, 3.00, 2.75, 2.00, 1.00, 0.00
  status VARCHAR(32) NOT NULL DEFAULT 'DITERBITKAN', -- 'DRAF', 'FINALISASI', 'DITERBITKAN', 'DIKUNCI'
  graded_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  is_synced_to_siakad BOOLEAN NOT NULL DEFAULT TRUE,
  synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_class_student_grade UNIQUE (class_id, student_id)
);

-- 2. Seed Initial Grades for Enrolled Students
INSERT INTO course_grades (
  id, class_id, student_id, presence_score, assignment_score, quiz_score,
  midterm_score, final_exam_score, final_score, letter_grade, grade_point,
  status, graded_by
)
VALUES
  -- 1. Ahmad Fauzi (PAI)
  ('grd-01', 'cls-pai301-a', 'usr-mhs-01', 95.00, 90.00, 88.00, 92.00, 94.00, 92.20, 'A', 4.00, 'DITERBITKAN', 'usr-dsn-01'),
  ('grd-02', 'cls-pai101-a', 'usr-mhs-01', 90.00, 88.00, 85.00, 86.00, 90.00, 87.85, 'A-', 3.75, 'DITERBITKAN', 'usr-dsn-01'),

  -- 2. Siti Fatimah Zahra (PAI)
  ('grd-03', 'cls-pai301-a', 'usr-mhs-02', 100.00, 94.00, 95.00, 92.00, 96.00, 94.85, 'A', 4.00, 'DITERBITKAN', 'usr-dsn-01'),
  ('grd-04', 'cls-pai101-a', 'usr-mhs-02', 95.00, 92.00, 90.00, 94.00, 95.00, 93.40, 'A', 4.00, 'DITERBITKAN', 'usr-dsn-01'),

  -- 3. Muhammad Ridwan Nur (MPI)
  ('grd-05', 'cls-mpi101-a', 'usr-mhs-04', 90.00, 86.00, 84.00, 88.00, 89.00, 87.50, 'A-', 3.75, 'DITERBITKAN', 'usr-dsn-04'),

  -- 4. Ali Haidar Rasyid (HES)
  ('grd-06', 'cls-hes101-a', 'usr-mhs-06', 90.00, 85.00, 82.00, 84.00, 88.00, 85.70, 'A-', 3.75, 'DITERBITKAN', 'usr-dsn-06'),

  -- 5. Habibullah Al-Habsyi (PAI)
  ('grd-07', 'cls-pai301-b', 'usr-mhs-03', 85.00, 82.00, 80.00, 84.00, 86.00, 83.70, 'B+', 3.50, 'DITERBITKAN', 'usr-dsn-01'),

  -- 6. Aulia Rahmawati (MPI)
  ('grd-08', 'cls-mpi101-a', 'usr-mhs-05', 95.00, 94.00, 92.00, 95.00, 96.00, 94.65, 'A', 4.00, 'DITERBITKAN', 'usr-dsn-04'),

  -- 7. Zahid Abdul Malik (PGMI)
  ('grd-09', 'cls-mku101-a', 'usr-mhs-08', 85.00, 80.00, 78.00, 82.00, 85.00, 82.20, 'B+', 3.50, 'DITERBITKAN', 'usr-dsn-08'),

  -- 8. Farhan Ramadhan (ESY)
  ('grd-10', 'cls-mku101-a', 'usr-mhs-10', 90.00, 85.00, 84.00, 86.00, 88.00, 86.50, 'A-', 3.75, 'DITERBITKAN', 'usr-dsn-10')
ON CONFLICT (class_id, student_id) DO UPDATE SET
  presence_score = EXCLUDED.presence_score,
  assignment_score = EXCLUDED.assignment_score,
  quiz_score = EXCLUDED.quiz_score,
  midterm_score = EXCLUDED.midterm_score,
  final_exam_score = EXCLUDED.final_exam_score,
  final_score = EXCLUDED.final_score,
  letter_grade = EXCLUDED.letter_grade,
  grade_point = EXCLUDED.grade_point,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

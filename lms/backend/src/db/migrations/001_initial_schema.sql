-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 001: INITIAL RELATIONAL SCHEMA
-- =========================================================================

-- ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM (
      'mahasiswa',
      'dosen',
      'dosen_pa',
      'kaprodi',
      'admin_akademik',
      'pimpinan',
      'administrator_sistem'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publish_status_enum') THEN
    CREATE TYPE publish_status_enum AS ENUM (
      'DRAF',
      'TERJADWAL',
      'DITERBITKAN',
      'DIARSIPKAN'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_submission_status_enum') THEN
    CREATE TYPE assignment_submission_status_enum AS ENUM (
      'BELUM_DIKUMPULKAN',
      'SUDAH_DIKUMPULKAN',
      'TERLAMBAT',
      'PERLU_REVISI',
      'SUDAH_DINILAI'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_attempt_status_enum') THEN
    CREATE TYPE quiz_attempt_status_enum AS ENUM (
      'SEDANG_DIKERJAKAN',
      'DIKUMPULKAN',
      'DINILAI'
    );
  END IF;
END $$;

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(128) NOT NULL,
  identity_number VARCHAR(64) NOT NULL, -- NIM atau NIDN/NIP
  email VARCHAR(128) UNIQUE NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'mahasiswa',
  study_program VARCHAR(128),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_identity_number ON users(identity_number);

-- 2. PROGRAM STUDI & KURIKULUM
CREATE TABLE IF NOT EXISTS study_programs (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  degree VARCHAR(16) NOT NULL DEFAULT 'S1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_years (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL, -- e.g. "2026/2027"
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS semesters (
  id VARCHAR(64) PRIMARY KEY,
  academic_year_id VARCHAR(64) NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
  semester_type VARCHAR(16) NOT NULL, -- 'GANJIL' / 'GENAP'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. MATA KULIAH & KELAS PERKULIAHAN
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  credits INT NOT NULL DEFAULT 3,
  study_program_id VARCHAR(64) REFERENCES study_programs(id) ON DELETE RESTRICT,
  semester_recommended INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_classes (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  semester_id VARCHAR(64) NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
  class_name VARCHAR(64) NOT NULL, -- e.g. "Kelas A"
  academic_year VARCHAR(32) NOT NULL,
  source_system VARCHAR(64) NOT NULL DEFAULT 'SIAKAD_ALITTIHAD',
  external_id VARCHAR(64),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_class_external UNIQUE (source_system, external_id)
);

CREATE TABLE IF NOT EXISTS class_lecturers (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  lecturer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_class_lecturer UNIQUE (class_id, lecturer_id)
);

CREATE TABLE IF NOT EXISTS class_enrollments (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(32) NOT NULL DEFAULT 'TERDAFTAR',
  source_system VARCHAR(64) NOT NULL DEFAULT 'SIAKAD_ALITTIHAD',
  external_id VARCHAR(64),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_student_class_enrollment UNIQUE (class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_class ON class_enrollments(class_id);

-- 4. JADWAL KULIAH
CREATE TABLE IF NOT EXISTS schedules (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  day_of_week VARCHAR(16) NOT NULL, -- 'SENIN', 'SELASA', etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(64) NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. RPS & PERTEMUAN KELAS
CREATE TABLE IF NOT EXISTS course_rps (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL UNIQUE REFERENCES course_classes(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  teaching_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  assessment_weights JSONB NOT NULL DEFAULT '[]'::jsonb,
  references_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  document_url TEXT,
  document_name VARCHAR(255),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_meetings (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  meeting_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  order_index INT NOT NULL,
  status publish_status_enum NOT NULL DEFAULT 'DRAF',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_class_meeting_number UNIQUE (class_id, meeting_number)
);

CREATE INDEX IF NOT EXISTS idx_meetings_class ON course_meetings(class_id);

-- 6. MATERI PEMBELAJARAN
CREATE TABLE IF NOT EXISTS materials (
  id VARCHAR(64) PRIMARY KEY,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'DOKUMEN', 'PRESENTASI', 'BUKU_ELEKTRONIK', 'TAUTAN', 'TEKS'
  description TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  external_url TEXT,
  status publish_status_enum NOT NULL DEFAULT 'DRAF',
  allow_download BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_access_logs (
  id VARCHAR(64) PRIMARY KEY,
  material_id VARCHAR(64) NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  first_accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  access_count INT NOT NULL DEFAULT 1,
  total_duration_seconds INT NOT NULL DEFAULT 0,
  CONSTRAINT uq_student_material_access UNIQUE (material_id, student_id)
);

-- 7. VIDEO PEMBELAJARAN INTERAKTIF
CREATE TABLE IF NOT EXISTS interactive_videos (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  duration_seconds INT NOT NULL,
  min_watched_percentage INT NOT NULL DEFAULT 80,
  allow_fast_forward BOOLEAN NOT NULL DEFAULT FALSE,
  status publish_status_enum NOT NULL DEFAULT 'DRAF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS video_checkpoints (
  id VARCHAR(64) PRIMARY KEY,
  video_id VARCHAR(64) NOT NULL REFERENCES interactive_videos(id) ON DELETE RESTRICT,
  timestamp_seconds INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'PILIHAN_GANDA', 'BENAR_SALAH', 'JAWABAN_SINGKAT'
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer_text TEXT,
  explanation TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  allow_retry BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_video_progress (
  id VARCHAR(64) PRIMARY KEY,
  video_id VARCHAR(64) NOT NULL REFERENCES interactive_videos(id) ON DELETE RESTRICT,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  last_position_seconds INT NOT NULL DEFAULT 0,
  max_watched_position_seconds INT NOT NULL DEFAULT 0,
  watched_segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  effective_watched_percentage INT NOT NULL DEFAULT 0,
  answered_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_student_video_progress UNIQUE (video_id, student_id)
);

-- 8. KUIS DARING & BANK SOAL
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  max_attempts INT NOT NULL DEFAULT 1,
  passing_score INT NOT NULL DEFAULT 75,
  status publish_status_enum NOT NULL DEFAULT 'DRAF',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_questions (
  id VARCHAR(64) PRIMARY KEY,
  course_code VARCHAR(32) NOT NULL,
  category VARCHAR(64) NOT NULL,
  question_text TEXT NOT NULL,
  type VARCHAR(32) NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer_text TEXT,
  explanation TEXT,
  points INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(64) PRIMARY KEY,
  quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE RESTRICT,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  attempt_number INT NOT NULL,
  status quiz_attempt_status_enum NOT NULL DEFAULT 'SEDANG_DIKERJAKAN',
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_earned_points NUMERIC(6,2) NOT NULL DEFAULT 0,
  final_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  is_passed BOOLEAN NOT NULL DEFAULT FALSE,
  needs_manual_grading BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_quiz_student_attempt UNIQUE (quiz_id, student_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- 9. TUGAS, RUBRIK & PENGUMPULAN
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  instructions TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  max_score INT NOT NULL DEFAULT 100,
  allow_late_submission BOOLEAN NOT NULL DEFAULT TRUE,
  late_penalty_percentage INT NOT NULL DEFAULT 10,
  max_file_size_mb INT NOT NULL DEFAULT 10,
  allowed_file_extensions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status publish_status_enum NOT NULL DEFAULT 'DRAF',
  rubric JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id VARCHAR(64) PRIMARY KEY,
  assignment_id VARCHAR(64) NOT NULL REFERENCES assignments(id) ON DELETE RESTRICT,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_mime_type VARCHAR(128) NOT NULL,
  student_notes TEXT,
  version INT NOT NULL DEFAULT 1,
  status assignment_submission_status_enum NOT NULL DEFAULT 'SUDAH_DIKUMPULKAN',
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMPTZ,
  grader_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
  raw_score NUMERIC(6,2),
  penalty_points NUMERIC(6,2) NOT NULL DEFAULT 0,
  final_score NUMERIC(6,2),
  feedback_notes TEXT,
  rubric_evaluations JSONB,
  version_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT uq_assignment_student_submission UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);

-- 10. FORUM DISKUSI
CREATE TABLE IF NOT EXISTS discussion_threads (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  meeting_id VARCHAR(64) REFERENCES course_meetings(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discussion_posts (
  id VARCHAR(64) PRIMARY KEY,
  thread_id VARCHAR(64) NOT NULL REFERENCES discussion_threads(id) ON DELETE RESTRICT,
  parent_post_id VARCHAR(64) REFERENCES discussion_posts(id) ON DELETE RESTRICT,
  author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  is_best_answer BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  upvotes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_thread ON discussion_posts(thread_id);

-- 11. PROGRES BELAJAR & COMPLETION RULES
CREATE TABLE IF NOT EXISTS learning_activities (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  meeting_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'MATERI', 'VIDEO_INTERAKTIF', 'KUIS', 'TUGAS', 'FORUM_DISKUSI'
  resource_id VARCHAR(64) NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  rule JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_activity_progress (
  id VARCHAR(64) PRIMARY KEY,
  activity_id VARCHAR(64) NOT NULL REFERENCES learning_activities(id) ON DELETE RESTRICT,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_type VARCHAR(16) NOT NULL DEFAULT 'OTOMATIS', -- 'OTOMATIS' | 'MANUAL'
  progress_percentage INT NOT NULL DEFAULT 0,
  details TEXT,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_student_activity_progress UNIQUE (activity_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_activity_progress ON student_activity_progress(student_id);

-- 12. NOTIFIKASI & AGENDA KALENDER
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(32) NOT NULL, -- 'AKADEMIK', 'PERKULIAHAN', 'TUGAS', 'NILAI', 'DISKUSI', 'PENGUMUMAN'
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  deep_link_path VARCHAR(255) NOT NULL,
  action_label VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS campus_calendar_events (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  course_name VARCHAR(128),
  type VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(128),
  description TEXT,
  deep_link_path VARCHAR(255),
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. AUDIT LOGS & SYNC LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(128) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(64) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45) NOT NULL,
  status VARCHAR(16) NOT NULL, -- 'SUKSES', 'GAGAL', 'DITOLAK'
  request_id VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

CREATE TABLE IF NOT EXISTS academic_sync_logs (
  id VARCHAR(64) PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source_system VARCHAR(64) NOT NULL,
  total_received INT NOT NULL,
  created_count INT NOT NULL,
  updated_count INT NOT NULL,
  skipped_count INT NOT NULL,
  failed_count INT NOT NULL,
  status VARCHAR(16) NOT NULL,
  details TEXT
);

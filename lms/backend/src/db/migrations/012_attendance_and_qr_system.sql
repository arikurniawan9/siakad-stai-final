-- =========================================================================
-- MIGRATION 012: MODUL PRESENSI & KEHADIRAN PERKULIAHAN (QR CODE DINAMIS & BAP)
-- SALAM LMS — STAI AL-ITTIHAD CIANJUR
-- =========================================================================

-- 1. ENUM TIPE STATUS SESI PRESENSI
DO $$ BEGIN
  CREATE TYPE attendance_session_status_enum AS ENUM ('BELUM_DIBUKA', 'DIBUKA', 'DITUTUP');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. ENUM STATUS KEHADIRAN MAHASISWA
DO $$ BEGIN
  CREATE TYPE attendance_status_enum AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. ENUM METODE PEMBELAJARAN PERTEMUAN
DO $$ BEGIN
  CREATE TYPE learning_delivery_mode_enum AS ENUM ('TATAP_MUKA', 'DARING', 'HYBRID');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. TABEL SESI PRESENSI PERTEMUAN (MEETING ATTENDANCE SESSIONS)
CREATE TABLE IF NOT EXISTS meeting_attendance_sessions (
  id VARCHAR(64) PRIMARY KEY,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  lecturer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  session_status attendance_session_status_enum NOT NULL DEFAULT 'BELUM_DIBUKA',
  delivery_mode learning_delivery_mode_enum NOT NULL DEFAULT 'TATAP_MUKA',
  qr_token VARCHAR(255),
  qr_expires_at TIMESTAMPTZ,
  passcode VARCHAR(16),
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  teaching_journal TEXT, -- Berita Acara Perkuliahan (BAP) / Realisasi Materi
  journal_notes TEXT,
  student_attendance_rate NUMERIC(5, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_session_meeting UNIQUE (meeting_id)
);

CREATE INDEX IF NOT EXISTS idx_att_sessions_class ON meeting_attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_att_sessions_meeting ON meeting_attendance_sessions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_att_sessions_lecturer ON meeting_attendance_sessions(lecturer_id);

-- 5. TABEL PRESENSI MAHASISWA (STUDENT ATTENDANCES)
CREATE TABLE IF NOT EXISTS student_attendances (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL REFERENCES meeting_attendance_sessions(id) ON DELETE RESTRICT,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  student_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status attendance_status_enum NOT NULL DEFAULT 'ALPA',
  method VARCHAR(32) NOT NULL DEFAULT 'MANUAL_DOSEN', -- 'QR_SCAN', 'PASSCODE', 'MANUAL_DOSEN', 'SURAT_IZIN'
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  attachment_url TEXT,
  device_info VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_meeting_student_att UNIQUE (meeting_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_att_session ON student_attendances(session_id);
CREATE INDEX IF NOT EXISTS idx_student_att_class ON student_attendances(class_id);
CREATE INDEX IF NOT EXISTS idx_student_att_student ON student_attendances(student_id);

-- 6. TABEL PRESENSI DOSEN & LOG BAP (LECTURER ATTENDANCES)
CREATE TABLE IF NOT EXISTS lecturer_attendances (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL REFERENCES meeting_attendance_sessions(id) ON DELETE RESTRICT,
  meeting_id VARCHAR(64) NOT NULL REFERENCES course_meetings(id) ON DELETE RESTRICT,
  class_id VARCHAR(64) NOT NULL REFERENCES course_classes(id) ON DELETE RESTRICT,
  lecturer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(32) NOT NULL DEFAULT 'HADIR', -- 'HADIR', 'PENGGANTI', 'TIDAK_HADIR'
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out_at TIMESTAMPTZ,
  bap_summary TEXT,
  verified_by_kaprodi BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_meeting_lecturer_att UNIQUE (meeting_id, lecturer_id)
);

CREATE INDEX IF NOT EXISTS idx_lecturer_att_session ON lecturer_attendances(session_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_att_class ON lecturer_attendances(class_id);

-- 7. SEED DATA SESI PRESENSI AWAL (CONTOH KELAS AKTIF)
INSERT INTO meeting_attendance_sessions (
  id, meeting_id, class_id, lecturer_id, session_status, delivery_mode, qr_token, passcode, opened_at, closed_at, teaching_journal, student_attendance_rate
)
SELECT 
  'ses-' || m.id,
  m.id,
  m.class_id,
  cl.lecturer_id,
  CASE 
    WHEN m.meeting_number = 1 THEN 'DITUTUP'::attendance_session_status_enum
    WHEN m.meeting_number = 2 THEN 'DIBUKA'::attendance_session_status_enum
    ELSE 'BELUM_DIBUKA'::attendance_session_status_enum
  END,
  'TATAP_MUKA'::learning_delivery_mode_enum,
  'QR_TOKEN_STAI_' || m.id,
  '849201',
  CASE WHEN m.meeting_number <= 2 THEN CURRENT_TIMESTAMP - INTERVAL '2 hours' ELSE NULL END,
  CASE WHEN m.meeting_number = 1 THEN CURRENT_TIMESTAMP - INTERVAL '30 minutes' ELSE NULL END,
  'Materi bahasan: ' || m.topic || '. Mahasiswa aktif berdiskusi dan memahami kaidah pokok.',
  CASE WHEN m.meeting_number = 1 THEN 95.00 WHEN m.meeting_number = 2 THEN 85.00 ELSE 0.00 END
FROM course_meetings m
JOIN class_lecturers cl ON cl.class_id = m.class_id AND cl.is_primary = true
ON CONFLICT (meeting_id) DO NOTHING;

-- 8. SEED DATA KEHADIRAN MAHASISWA AWAL UNTUK PERTEMUAN 1 & 2
INSERT INTO student_attendances (
  id, session_id, meeting_id, class_id, student_id, status, method, recorded_at, notes
)
SELECT 
  'att-' || m.id || '-' || u.id,
  'ses-' || m.id,
  m.id,
  m.class_id,
  u.id,
  'HADIR'::attendance_status_enum,
  'QR_SCAN',
  CURRENT_TIMESTAMP - INTERVAL '1 hour',
  'Presensi berhasil tervalidasi melalui QR Code'
FROM course_meetings m
CROSS JOIN users u
WHERE m.meeting_number IN (1, 2) AND u.role = 'mahasiswa'
ON CONFLICT (meeting_id, student_id) DO NOTHING;


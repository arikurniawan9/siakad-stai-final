-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 004: COURSES & CLASSES ENHANCEMENT
-- =========================================================================

-- 1. Enhance courses table
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS course_type VARCHAR(32) NOT NULL DEFAULT 'WAJIB_PRODI', -- 'WAJIB_INSTITUSI', 'WAJIB_PRODI', 'PILIHAN', 'MKDU'
  ADD COLUMN IF NOT EXISTS theory_credits INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS practical_credits INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Enhance course_classes table
ALTER TABLE course_classes
  ADD COLUMN IF NOT EXISTS capacity INT NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS room VARCHAR(64) DEFAULT 'Ruang Kuliah Gedung A',
  ADD COLUMN IF NOT EXISTS day_of_week VARCHAR(16) DEFAULT 'Senin',
  ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '08:00:00',
  ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '10:30:00',
  ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(32) DEFAULT 'HYBRID', -- 'TATAP_MUKA', 'DARING', 'HYBRID'
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'AKTIF',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Seed Essential Courses for STAI AL-ITTIHAD
INSERT INTO courses (id, code, name, credits, study_program_id, semester_recommended, course_type, theory_credits, practical_credits, is_active, description)
VALUES
  -- PAI
  ('crs-pai101', 'PAI-101', 'Ilmu Pendidikan Islam', 3, 'prodi-pai', 1, 'WAJIB_PRODI', 2, 1, TRUE, 'Landasan filosofis, ontologis, dan epistemologis pendidikan Islam dalam pengembangan kurikulum madrasah.'),
  ('crs-pai102', 'PAI-102', 'Studi Al-Qur''an dan Hadis Tarbawi', 3, 'prodi-pai', 1, 'WAJIB_PRODI', 2, 1, TRUE, 'Kajian tematik ayat dan riwayat hadits terkait metodologi pengajaran dan karakter pendidik.'),
  ('crs-pai201', 'PAI-201', 'Metodologi Pembelajaran PAI Interaktif', 3, 'prodi-pai', 3, 'WAJIB_PRODI', 2, 1, TRUE, 'Teknik perencanaan, microteaching, dan pemanfaatan media digital dalam proses belajar mengajar PAI.'),
  ('crs-pai301', 'PAI-301', 'Ushul Fiqih & Qawaid Fiqhiyyah', 3, 'prodi-pai', 5, 'WAJIB_PRODI', 2, 1, TRUE, 'Kaidah-kaidah hukum Islam dan istinbath hukum dalam merespons persoalan kontemporer.'),
  ('crs-pai401', 'PAI-401', 'Evaluasi & Asesmen Pembelajaran PAI', 3, 'prodi-pai', 7, 'WAJIB_PRODI', 2, 1, TRUE, 'Penyusunan instrumen tes kognitif, afektif, dan psikomotorik berbasis taksonomi Bloom dan HOTS.'),

  -- MPI
  ('crs-mpi101', 'MPI-101', 'Dasar-Dasar Manajemen Pendidikan', 3, 'prodi-mpi', 1, 'WAJIB_PRODI', 2, 1, TRUE, 'Prinsip POAC (Planning, Organizing, Actuating, Controlling) dalam tata kelola institusi pendidikan Islam.'),
  ('crs-mpi201', 'MPI-201', 'Sistem Informasi Manajemen Madrasah', 3, 'prodi-mpi', 3, 'WAJIB_PRODI', 1, 2, TRUE, 'Pengelolaan data akademik, e-learning, dan administrasi sekolah berbasis teknologi informasi.'),
  ('crs-mpi301', 'MPI-301', 'Kepemimpinan & Supervisi Pendidikan Islam', 3, 'prodi-mpi', 5, 'WAJIB_PRODI', 2, 1, TRUE, 'Model kepemimpinan profetik dan teknik supervisi klinis untuk peningkatan mutu pengajaran guru.'),

  -- HES
  ('crs-hes101', 'HES-101', 'Pengantar Fiqh Muamalah Kontemporer', 3, 'prodi-hes', 1, 'WAJIB_PRODI', 2, 1, TRUE, 'Prinsip akad syariah: murabahah, mudharabah, musyarakah, ijarah, dan salam dalam transaksi modern.'),
  ('crs-hes201', 'HES-201', 'Hukum Perbankan & Lembaga Keuangan Syariah', 3, 'prodi-hes', 3, 'WAJIB_PRODI', 2, 1, TRUE, 'Regulasi OJK, DSN-MUI, dan kepatuhan hukum pada bank syariah, BMT, dan asuransi takaful.'),
  ('crs-hes301', 'HES-301', 'Legal Drafting & Kontrak Bisnis Syariah', 3, 'prodi-hes', 5, 'WAJIB_PRODI', 1, 2, TRUE, 'Penyusunan klausul perjanjian, mitigasi risiko sengketa, dan arbitrase syariah di BASYARNAS.'),

  -- PGMI
  ('crs-pgm101', 'PGM-101', 'Konsep Dasar Pendidikan Anak Usia MI/SD', 3, 'prodi-pgmi', 1, 'WAJIB_PRODI', 2, 1, TRUE, 'Psikologi perkembangan anak usia 6-12 tahun dan pendekatan pembelajaran ramah anak.'),
  ('crs-pgm201', 'PGM-201', 'Pembelajaran Tematik Terpadu di MI', 3, 'prodi-pgmi', 3, 'WAJIB_PRODI', 1, 2, TRUE, 'Integrasi muatan sains, sosial, dan nilai Islam dalam format modul ajar kurikulum merdeka.'),

  -- ESY
  ('crs-esy101', 'ESY-101', 'Mikro & Makro Ekonomi Islam', 3, 'prodi-esy', 1, 'WAJIB_PRODI', 2, 1, TRUE, 'Perilaku konsumen Islami, fungsi pasar tanpa distorsi, dan kebijakan moneter bebas riba.'),
  ('crs-esy201', 'ESY-201', 'Manajemen Zakat, Infaq, Shadaqah & Wakaf (ZISWAF)', 3, 'prodi-esy', 3, 'WAJIB_PRODI', 2, 1, TRUE, 'Penghimpunan dan pendayagunaan dana sosial Islam untuk pemberdayaan ekonomi umat.'),

  -- MKDU / Wajib Institusi STAI AL-ITTIHAD
  ('crs-mku101', 'MKU-101', 'Pancasila & Kewarganegaraan', 2, NULL, 1, 'WAJIB_INSTITUSI', 2, 0, TRUE, 'Pendidikan nilai kebangsaan, moderasi beragama, dan integritas konstitusi Republik Indonesia.'),
  ('crs-mku102', 'MKU-102', 'Bahasa Arab Akademik & Turats', 2, NULL, 1, 'WAJIB_INSTITUSI', 1, 1, TRUE, 'Kemahiran membaca kitab kuning, tata bahasa Nahwu-Sharaf dasar, dan percakapan tematik.'),
  ('crs-mku103', 'MKU-103', 'Teknologi Informasi & Literasi Digital', 2, NULL, 2, 'WAJIB_INSTITUSI', 1, 1, TRUE, 'Kecakapan pemanfaatan AI, keamanan data civitas, dan etika komunikasi daring institusional.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  credits = EXCLUDED.credits,
  study_program_id = EXCLUDED.study_program_id,
  semester_recommended = EXCLUDED.semester_recommended,
  course_type = EXCLUDED.course_type,
  theory_credits = EXCLUDED.theory_credits,
  practical_credits = EXCLUDED.practical_credits,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- 4. Seed Course Classes for Active Semester (2026/2027 Ganjil)
INSERT INTO course_classes (id, course_id, semester_id, class_name, academic_year, source_system, external_id, capacity, room, day_of_week, start_time, end_time, delivery_mode, is_active, status)
VALUES
  ('cls-pai301-a', 'crs-pai301', 'sem-2026-ganjil', 'Kelas A', '2026/2027 Ganjil', 'SIAKAD_ALITTIHAD', 'EXT-PAI301-A', 40, 'Ruang Al-Ghazali (Gedung A-201)', 'Senin', '08:00:00', '10:30:00', 'HYBRID', TRUE, 'AKTIF'),
  ('cls-pai301-b', 'crs-pai301', 'sem-2026-ganjil', 'Kelas B', '2026/2027 Ganjil', 'SIAKAD_ALITTIHAD', 'EXT-PAI301-B', 40, 'Ruang Ibnu Khaldun (Gedung A-202)', 'Senin', '13:00:00', '15:30:00', 'HYBRID', TRUE, 'AKTIF'),
  ('cls-pai101-a', 'crs-pai101', 'sem-2026-ganjil', 'Kelas A', '2026/2027 Ganjil', 'SIAKAD_ALITTIHAD', 'EXT-PAI101-A', 45, 'Auditorium Utama STAI Al-Ittihad', 'Selasa', '08:00:00', '10:30:00', 'TATAP_MUKA', TRUE, 'AKTIF'),
  ('cls-mpi101-a', 'crs-mpi101', 'sem-2026-ganjil', 'Kelas A', '2026/2027 Ganjil', 'SIAKAD_ALITTIHAD', 'EXT-MPI101-A', 35, 'Ruang Smart Classroom B-101', 'Rabu', '09:30:00', '12:00:00', 'HYBRID', TRUE, 'AKTIF'),
  ('cls-hes101-a', 'crs-hes101', 'sem-2026-ganjil', 'Kelas A', '2026/2027 Ganjil', 'SIAKAD_ALITTIHAD', 'EXT-HES101-A', 35, 'Ruang Laboratorium Syariah B-102', 'Kamis', '08:00:00', '10:30:00', 'TATAP_MUKA', TRUE, 'AKTIF'),
  ('cls-mku101-a', 'crs-mku101', 'sem-2026-ganjil', 'Kelas A Reguler', '2026/2027 Ganjil', 'SIAKAD_ALITTIHAD', 'EXT-MKU101-A', 50, 'Ruang Multimedia Gedung C-301', 'Jumat', '08:00:00', '09:40:00', 'DARING', TRUE, 'AKTIF')
ON CONFLICT (id) DO UPDATE SET
  class_name = EXCLUDED.class_name,
  capacity = EXCLUDED.capacity,
  room = EXCLUDED.room,
  day_of_week = EXCLUDED.day_of_week,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  delivery_mode = EXCLUDED.delivery_mode,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- 5. Seed Class Lecturers
INSERT INTO class_lecturers (id, class_id, lecturer_id, is_primary)
VALUES
  ('cl-pai301-a', 'cls-pai301-a', 'usr-dsn-01', TRUE),
  ('cl-pai301-b', 'cls-pai301-b', 'usr-dsn-01', TRUE),
  ('cl-pai101-a', 'cls-pai101-a', 'usr-dsn-01', TRUE),
  ('cl-mpi101-a', 'cls-mpi101-a', 'usr-dsn-01', TRUE),
  ('cl-hes101-a', 'cls-hes101-a', 'usr-dsn-01', TRUE),
  ('cl-mku101-a', 'cls-mku101-a', 'usr-dsn-01', TRUE)
ON CONFLICT (class_id, lecturer_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;

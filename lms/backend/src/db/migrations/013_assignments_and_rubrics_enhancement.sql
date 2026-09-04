-- =========================================================================
-- MIGRATION 013: PENINGKATAN MODUL TUGAS & RUBRIK PENILAIAN (ASSIGNMENTS & RUBRICS)
-- SALAM LMS — STAI AL-ITTIHAD CIANJUR
-- =========================================================================

-- 1. Penambahan Kolom pada Tabel assignments
ALTER TABLE assignments 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS open_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS max_resubmissions INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS submission_type VARCHAR(32) DEFAULT 'BERKAS_UNGGAHAN',
  ADD COLUMN IF NOT EXISTS max_file_size_bytes BIGINT DEFAULT 10485760;

-- 2. Penambahan Kolom pada Tabel assignment_submissions
ALTER TABLE assignment_submissions 
  ADD COLUMN IF NOT EXISTS text_content TEXT,
  ADD COLUMN IF NOT EXISTS penalty_deduction NUMERIC(6,2) DEFAULT 0;

-- Pastikan kolom berkas dapat bernilai NULL jika pengumpulan berupa TEKS murni
ALTER TABLE assignment_submissions ALTER COLUMN file_url DROP NOT NULL;
ALTER TABLE assignment_submissions ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE assignment_submissions ALTER COLUMN file_size_bytes DROP NOT NULL;
ALTER TABLE assignment_submissions ALTER COLUMN file_mime_type DROP NOT NULL;

-- 3. Indeks Performa untuk Pencarian & Filter
CREATE INDEX IF NOT EXISTS idx_assignments_class_meeting ON assignments(class_id, meeting_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

-- 4. Seed Contoh Data Tugas Berbasis Rubrik Berkualitas
INSERT INTO assignments (
  id, class_id, meeting_id, title, description, instructions, attachment_name, attachment_url,
  open_date, due_date, max_score, allow_late_submission, late_penalty_percentage,
  allow_resubmission, max_resubmissions, submission_type, allowed_file_extensions,
  max_file_size_bytes, status, rubric
) VALUES (
  'asg-pai301-01',
  'cls-pai301-a',
  'mtg-pai301a-03',
  'Tugas Analisis Literatur: Studi Kasus Istinbath Hukum Kontemporer',
  'Menyusun makalah analisis penerapan kaidah Ushul Fiqih dalam menyelesaikan problematika fatwa Dewan Syariah Nasional (DSN-MUI).',
  '1. Makalah ditulis dalam format ilmiah (minimal 5 halaman, maksimal 12 halaman).\n2. Format berkas wajib berupa PDF (.pdf) atau Word Document (.docx).\n3. Sertakan minimal 3 rujukan kitab turats ushul fiqih dan 2 jurnal ilmiah terakreditasi.\n4. Pengumpulan melewati batas waktu akan dikenakan pemotongan nilai 10%.',
  'Panduan_Format_Makalah_PAI301.pdf',
  '/api/v1/storage/files/templates/Panduan_Format_Makalah_PAI301.pdf',
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '14 days',
  100,
  TRUE,
  10,
  TRUE,
  2,
  'BERKAS_UNGGAHAN',
  '["pdf", "docx", "zip"]'::jsonb,
  10485760,
  'DITERBITKAN',
  '{
    "id": "rbk-01",
    "title": "Rubrik Penilaian Analisis Makalah Ushul Fiqih",
    "criteria": [
      {
        "id": "crit-1",
        "title": "Ketepatan Penerapan Kaidah Ushuliyah",
        "description": "Menganalisis penggunaan kaidah am/khas, amar/nahyi, atau qiyas pada kasus yang diangkat.",
        "weightPercentage": 40,
        "maxPoints": 100,
        "levels": [
          { "id": "lvl-1a", "title": "Sangat Baik (100)", "points": 100, "description": "Analisis kaidah sangat tajam, runtut, dan sesuai metodologi ushul madzhab." },
          { "id": "lvl-1b", "title": "Baik (80)", "points": 80, "description": "Analisis kaidah tepat namun terdapat sedikit kekurangan pada argumentasi." },
          { "id": "lvl-1c", "title": "Cukup (60)", "points": 60, "description": "Analisis kaidah bersifat umum dan belum mendalam." },
          { "id": "lvl-1d", "title": "Kurang (40)", "points": 40, "description": "Penerapan kaidah keliru atau tidak relevan dengan kasus." }
        ]
      },
      {
        "id": "crit-2",
        "title": "Kelengkapan & Otoritas Kepustakaan",
        "description": "Rujukan primer dari kitab turats mu''tabarah dan jurnal bereputasi.",
        "weightPercentage": 30,
        "maxPoints": 100,
        "levels": [
          { "id": "lvl-2a", "title": "Sangat Lengkap (100)", "points": 100, "description": "Memuat >= 3 kitab turats primer dan >= 2 jurnal ilmiah." },
          { "id": "lvl-2b", "title": "Lengkap (80)", "points": 80, "description": "Memuat 2 kitab turats dan jurnal ilmiah." },
          { "id": "lvl-2c", "title": "Cukup (60)", "points": 60, "description": "Hanya menggunakan buku sekunder / artikel web." },
          { "id": "lvl-2d", "title": "Kurang (40)", "points": 40, "description": "Daftar pustaka minim atau tidak valid." }
        ]
      },
      {
        "id": "crit-3",
        "title": "Sistematika Penulisan & Kaidah Akademik",
        "description": "Tata tulis ilmiah, kerapian bahasa, dan bebas dari plagiasi.",
        "weightPercentage": 30,
        "maxPoints": 100,
        "levels": [
          { "id": "lvl-3a", "title": "Sangat Rapi (100)", "points": 100, "description": "Format standar sempurna, bahasa baku, sitasi konsisten." },
          { "id": "lvl-3b", "title": "Rapi (80)", "points": 80, "description": "Format baik dengan sedikit kesalahan tipografi minor." },
          { "id": "lvl-3c", "title": "Cukup (60)", "points": 60, "description": "Banyak kesalahan ejaan dan format tidak konsisten." },
          { "id": "lvl-3d", "title": "Kurang (40)", "points": 40, "description": "Tidak mengikuti template yang diinstruksikan." }
        ]
      }
    ]
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  instructions = EXCLUDED.instructions,
  rubric = EXCLUDED.rubric;

-- Seed Contoh Submission Mahasiswa
INSERT INTO assignment_submissions (
  id, assignment_id, student_id, file_url, file_name, file_size_bytes, file_mime_type,
  student_notes, version, status, is_late, submitted_at, final_score, raw_score,
  penalty_deduction, feedback_notes, rubric_evaluations
) VALUES (
  'sub-demo-01',
  'asg-pai301-01',
  'usr-mhs-01',
  '/api/v1/storage/files/submissions/Makalah_Ushul_Fiqih_Ahmad_Fauzi.pdf',
  'Makalah_Ushul_Fiqih_Ahmad_Fauzi.pdf',
  2456000,
  'application/pdf',
  'Bismillah, berikut pengumpulan tugas makalah analisis kaidah Ushul Fiqih pada fatwa DSN-MUI tentang Fintech Syariah. Mohon koreksinya Ustadz.',
  1,
  'SUDAH_DINILAI',
  FALSE,
  NOW() - INTERVAL '3 days',
  92.00,
  92.00,
  0.00,
  'Makalah disusun dengan sangat baik dan analisis kaidah ushuliyah runtut. Pertahankan kualitas argumentasi akademiknya.',
  '[
    { "criterionId": "crit-1", "selectedLevelId": "lvl-1a", "awardedScore": 95 },
    { "criterionId": "crit-2", "selectedLevelId": "lvl-2a", "awardedScore": 90 },
    { "criterionId": "crit-3", "selectedLevelId": "lvl-3a", "awardedScore": 90 }
  ]'::jsonb
) ON CONFLICT (assignment_id, student_id) DO NOTHING;

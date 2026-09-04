-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 010: SYSTEM SETTINGS ENHANCEMENT
-- =========================================================================

-- 1. Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(128) PRIMARY KEY,
  category VARCHAR(64) NOT NULL, -- 'INSTITUSI', 'AKADEMIK', 'PENYIMPANAN', 'KEAMANAN', 'SIAKAD', 'NOTIFIKASI'
  value JSONB NOT NULL,
  data_type VARCHAR(32) NOT NULL DEFAULT 'STRING',
  description TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Initial System Settings for STAI AL-ITTIHAD
INSERT INTO system_settings (key, category, value, data_type, description, is_public)
VALUES
  -- 1. INSTITUSI
  ('institution_profile', 'INSTITUSI', '{
    "campusName": "STAI AL-ITTIHAD CIANJUR",
    "campusCode": "213010",
    "motto": "Integrity, Intellect, & Islamic Values",
    "address": "Jl. Raya Bandung KM. 03, Bojong, Karangtengah, Cianjur, Jawa Barat 43281",
    "email": "akademik@stai-alittihad.ac.id",
    "phone": "+62 263 228 1234",
    "helpdeskWhatsapp": "081234567890",
    "timezone": "Asia/Jakarta",
    "academicYearActive": "2026/2027",
    "semesterActive": "Ganjil"
  }'::jsonb, 'JSON', 'Profil identitas institusi dan informasi kontak resmi kampus.', true),

  -- 2. AKADEMIK
  ('academic_grading_policy', 'AKADEMIK', '{
    "presenceWeight": 10,
    "assignmentWeight": 20,
    "quizWeight": 15,
    "midtermWeight": 25,
    "finalExamWeight": 30,
    "minAttendancePercent": 75,
    "passingGradePoint": 2.00,
    "maxQuizDurationMinutes": 120,
    "allowRemedial": true
  }'::jsonb, 'JSON', 'Struktur pembobotan komponen nilai akhir dan ambang batas kelulusan.', true),

  -- 3. PENYIMPANAN
  ('storage_configuration', 'PENYIMPANAN', '{
    "driver": "minio",
    "endpoint": "http://salam-minio-storage:9000",
    "bucket": "salam-uploads",
    "maxAssignmentSizeBytes": 26214400,
    "maxMaterialSizeBytes": 52428800,
    "allowedExtensions": [".pdf", ".docx", ".pptx", ".xlsx", ".zip", ".mp4", ".png", ".jpg"]
  }'::jsonb, 'JSON', 'Konfigurasi penyimpanan berkas materi, tugas, dan video interaktif.', false),

  -- 4. KEAMANAN
  ('security_policy', 'KEAMANAN', '{
    "jwtExpirationDays": 7,
    "minPasswordLength": 8,
    "maxLoginAttempts": 5,
    "lockoutDurationMinutes": 15,
    "enforceStrongPassword": true,
    "auditLoggingEnabled": true,
    "sessionInactivityTimeoutMinutes": 120
  }'::jsonb, 'JSON', 'Kebijakan keamanan autentikasi, kedaluwarsa sesi, dan proteksi login.', false),

  -- 5. SIAKAD
  ('siakad_integration', 'SIAKAD', '{
    "gatewayUrl": "https://siakad.stai-alittihad.ac.id/api/v1",
    "autoSyncEnabled": true,
    "syncIntervalHours": 6,
    "lastSyncAt": "2026-08-17T08:00:00Z",
    "syncEntities": ["mahasiswa", "dosen", "mata_kuliah", "jadwal", "nilai"]
  }'::jsonb, 'JSON', 'Parameter integrasi sinkronisasi dua arah dengan sistem informasi akademik induk.', false),

  -- 6. NOTIFIKASI
  ('notification_preferences', 'NOTIFIKASI', '{
    "assignmentReminderHours": 24,
    "atRiskAdvisorAlert": true,
    "emailNotificationEnabled": true,
    "systemAnnouncementEnabled": true
  }'::jsonb, 'JSON', 'Preferensi otomasi pengingat tugas dan notifikasi pembinaan akademik.', false)
ON CONFLICT (key) DO UPDATE SET
  category = EXCLUDED.category,
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

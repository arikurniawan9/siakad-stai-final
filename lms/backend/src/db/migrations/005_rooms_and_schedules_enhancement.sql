-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 005: ROOMS & SCHEDULES ENHANCEMENT
-- =========================================================================

-- 1. Create master rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  building VARCHAR(64) NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  capacity INT NOT NULL DEFAULT 40,
  room_type VARCHAR(32) NOT NULL DEFAULT 'TEORI', -- 'TEORI', 'LABORATORIUM', 'SMART_CLASS', 'AUDITORIUM', 'STUDIO'
  facilities TEXT[] DEFAULT ARRAY['Pendingin Udara (AC)', 'Proyektor HD', 'Sound System', 'Wi-Fi Cepat', 'Papan Tulis Kaca'],
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enhance schedules table
ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS room_id VARCHAR(64) REFERENCES rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lecturer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS semester_id VARCHAR(64) REFERENCES semesters(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS academic_year VARCHAR(32) NOT NULL DEFAULT '2026/2027 Ganjil',
  ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(32) NOT NULL DEFAULT 'HYBRID',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Seed Master Rooms of STAI AL-ITTIHAD
INSERT INTO rooms (id, code, name, building, floor, capacity, room_type, facilities, is_available)
VALUES
  ('rm-a201', 'A-201', 'Ruang Al-Ghazali', 'Gedung A (Kulliyyah Tarbiyah)', 2, 40, 'TEORI', ARRAY['Pendingin Udara (AC)', 'Proyektor HD', 'Sound System', 'Wi-Fi Cepat', 'Papan Tulis Kaca'], TRUE),
  ('rm-a202', 'A-202', 'Ruang Ibnu Khaldun', 'Gedung A (Kulliyyah Tarbiyah)', 2, 40, 'TEORI', ARRAY['Pendingin Udara (AC)', 'Proyektor HD', 'Sound System', 'Wi-Fi Cepat', 'Papan Tulis Kaca'], TRUE),
  ('rm-b101', 'B-101', 'Ruang Smart Classroom', 'Gedung B (Pusat Studi Islam & Manajemen)', 1, 35, 'SMART_CLASS', ARRAY['Interactive Smart Screen 75"', 'Kamera PTZ Hybrid', 'Microphone Array', 'AC', 'Wi-Fi 6 Cepat'], TRUE),
  ('rm-b102', 'B-102', 'Laboratorium Syariah & Mini Bank', 'Gedung B (Pusat Studi Islam & Manajemen)', 1, 35, 'LABORATORIUM', ARRAY['Core Banking Simulator', 'PC Workstation 30 Unit', 'AC', 'Proyektor Laser'], TRUE),
  ('rm-c301', 'C-301', 'Ruang Multimedia & Microteaching', 'Gedung C (Pusat Bahasa & Pembelajaran)', 3, 50, 'STUDIO', ARRAY['Multi-Cam Recording Rig', 'Acoustic Soundproofing', 'Smart Board', 'AC', 'Wi-Fi Cepat'], TRUE),
  ('rm-aud01', 'AUD-01', 'Auditorium Utama STAI Al-Ittihad', 'Gedung Rektorat Lt. 3', 3, 250, 'AUDITORIUM', ARRAY['LED Video Wall 4x3m', 'Line Array Sound System', 'Panggung Konferensi', 'AC Central'], TRUE)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  building = EXCLUDED.building,
  floor = EXCLUDED.floor,
  capacity = EXCLUDED.capacity,
  room_type = EXCLUDED.room_type,
  facilities = EXCLUDED.facilities,
  is_available = EXCLUDED.is_available,
  updated_at = CURRENT_TIMESTAMP;

-- 4. Seed Schedule Plots for Active Semester (2026/2027 Ganjil)
INSERT INTO schedules (id, class_id, room_id, lecturer_id, semester_id, day_of_week, start_time, end_time, room, is_online, delivery_mode, academic_year, is_active)
VALUES
  ('sch-01', 'cls-pai301-a', 'rm-a201', 'usr-dsn-01', 'sem-2026-ganjil', 'Senin', '08:00:00', '10:30:00', 'Ruang Al-Ghazali (Gedung A-201)', FALSE, 'HYBRID', '2026/2027 Ganjil', TRUE),
  ('sch-02', 'cls-pai301-b', 'rm-a202', 'usr-dsn-01', 'sem-2026-ganjil', 'Senin', '13:00:00', '15:30:00', 'Ruang Ibnu Khaldun (Gedung A-202)', FALSE, 'HYBRID', '2026/2027 Ganjil', TRUE),
  ('sch-03', 'cls-pai101-a', 'rm-aud01', 'usr-dsn-01', 'sem-2026-ganjil', 'Selasa', '08:00:00', '10:30:00', 'Auditorium Utama STAI Al-Ittihad', FALSE, 'TATAP_MUKA', '2026/2027 Ganjil', TRUE),
  ('sch-04', 'cls-mpi101-a', 'rm-b101', 'usr-dsn-01', 'sem-2026-ganjil', 'Rabu', '09:30:00', '12:00:00', 'Ruang Smart Classroom B-101', FALSE, 'HYBRID', '2026/2027 Ganjil', TRUE),
  ('sch-05', 'cls-hes101-a', 'rm-b102', 'usr-dsn-01', 'sem-2026-ganjil', 'Kamis', '08:00:00', '10:30:00', 'Laboratorium Syariah & Mini Bank (B-102)', FALSE, 'TATAP_MUKA', '2026/2027 Ganjil', TRUE),
  ('sch-06', 'cls-mku101-a', 'rm-c301', 'usr-dsn-01', 'sem-2026-ganjil', 'Jumat', '08:00:00', '09:40:00', 'Ruang Multimedia Gedung C-301', TRUE, 'DARING', '2026/2027 Ganjil', TRUE)
ON CONFLICT (id) DO UPDATE SET
  class_id = EXCLUDED.class_id,
  room_id = EXCLUDED.room_id,
  lecturer_id = EXCLUDED.lecturer_id,
  semester_id = EXCLUDED.semester_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  room = EXCLUDED.room,
  is_online = EXCLUDED.is_online,
  delivery_mode = EXCLUDED.delivery_mode,
  academic_year = EXCLUDED.academic_year,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

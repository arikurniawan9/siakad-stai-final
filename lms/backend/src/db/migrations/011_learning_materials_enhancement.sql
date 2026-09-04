-- =========================================================================
-- MIGRATION 011: LEARNING MATERIALS & RPS ENHANCEMENTS
-- STAI AL-ITTIHAD CIANJUR (SALAM LMS)
-- =========================================================================

-- 1. Tambahkan kolom text_content dan online_module pada tabel materials
ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS text_content TEXT,
  ADD COLUMN IF NOT EXISTS online_module JSONB;

-- 2. Pastikan relasi index pada materials
CREATE INDEX IF NOT EXISTS idx_materials_meeting ON materials(meeting_id);
CREATE INDEX IF NOT EXISTS idx_materials_class ON materials(class_id);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);

-- 3. Pastikan index pada course_rps
CREATE INDEX IF NOT EXISTS idx_rps_class ON course_rps(class_id);

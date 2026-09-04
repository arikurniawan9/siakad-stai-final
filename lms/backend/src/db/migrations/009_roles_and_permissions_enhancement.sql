-- =========================================================================
-- SALAM LMS (STAI AL-ITTIHAD) - MIGRATION 009: ROLES & RBAC PERMISSIONS ENHANCEMENT
-- =========================================================================

-- 1. Create system_roles table
CREATE TABLE IF NOT EXISTS system_roles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  is_system_role BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create system_permissions table
CREATE TABLE IF NOT EXISTS system_permissions (
  id VARCHAR(64) PRIMARY KEY,
  module_category VARCHAR(64) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(64) NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(64) NOT NULL REFERENCES system_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. Seed system_roles
INSERT INTO system_roles (id, name, description, is_system_role, is_active)
VALUES
  ('administrator_sistem', 'Administrator Sistem', 'Akses penuh ke seluruh konfigurasi server, otorisasi RBAC, sinkronisasi SIAKAD, dan audit sistem.', true, true),
  ('admin_akademik', 'Administrator Akademik', 'Pengelolaan data master akademik, penjadwalan kuliah, prodi, mahasiswa, dan pemantauan nilai institusi.', true, true),
  ('pimpinan', 'Pimpinan / Rektorat', 'Akses tinjauan eksekutif terhadap capaian akademik, evaluasi prodi, audit log, dan laporan institusional.', true, true),
  ('kaprodi', 'Ketua Program Studi (Kaprodi)', 'Pengelolaan kurikulum prodi, persetujuan RPS, monitoring pengajaran dosen, dan penetapan Dosen PA.', true, true),
  ('dosen_pa', 'Dosen Pembimbing Akademik (PA)', 'Pengawasan progres studi mahasiswa bimbingan, verifikasi IRS/KRS, konsultasi akademik, dan evaluasi KHS.', true, true),
  ('dosen', 'Dosen Pengampu', 'Penyusunan RPS, pengunggahan materi kuliah, pembuatan video interaktif, kuis, tugas, dan penginputan nilai.', true, true),
  ('mahasiswa', 'Mahasiswa', 'Akses materi perkuliahan, interaksi video pembelajaran, pengerjaan tugas & kuis, forum diskusi, dan KHS.', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 5. Seed system_permissions
INSERT INTO system_permissions (id, module_category, name, description)
VALUES
  -- 1. Materi & RPS
  ('materials:view', 'Materi & RPS', 'Lihat Materi Perkuliahan & RPS', 'Melihat daftar dan berkas bahan ajar serta Rencana Pembelajaran Semester.'),
  ('materials:manage', 'Materi & RPS', 'Kelola Modul & RPS', 'Mengunggah, mengedit, dan menghapus dokumen materi ajar dan RPS perkuliahan.'),
  ('materials:publish', 'Materi & RPS', 'Terbitkan Bahan Ajar', 'Mempublikasikan modul ajar dan pertemuan perkuliahan kepada mahasiswa.'),

  -- 2. Video Interaktif
  ('video:watch', 'Video Interaktif', 'Tonton Video Perkuliahan', 'Menonton video materi dan menjawab pertanyaan checkpoint interaktif.'),
  ('video:manage', 'Video Interaktif', 'Kelola Video & Checkpoint', 'Mengunggah video pembelajaran dan menyisipkan pertanyaan checkpoint.'),

  -- 3. Kuis & Evaluasi
  ('quizzes:attempt', 'Kuis & Evaluasi', 'Kerjakan Kuis & Ujian', 'Mengikuti sesi kuis formatif, sumatif, dan ujian online.'),
  ('quizzes:manage', 'Kuis & Evaluasi', 'Kelola Bank Soal & Kuis', 'Membuat butir soal, mengatur durasi, dan mengonfigurasi ujian kuis.'),

  -- 4. Tugas Kuliah
  ('assignments:submit', 'Tugas Kuliah', 'Kirimkan Tugas Kuliah', 'Mengunggah berkas pengumpulan tugas perkuliahan sebelum tenggat.'),
  ('assignments:grade', 'Tugas Kuliah', 'Nilai Pengumpulan Tugas', 'Memberikan evaluasi angka, rubrik penilaian, dan catatan umpan balik tugas.'),
  ('assignments:manage', 'Tugas Kuliah', 'Kelola Penugasan', 'Membuat instruksi tugas, rubrik penilaian, dan mengatur batas pengumpulan.'),

  -- 5. Forum Diskusi
  ('discussions:view', 'Forum Diskusi', 'Lihat Thread Diskusi', 'Membaca topik diskusi materi dan tanggapan kelas perkuliahan.'),
  ('discussions:post', 'Forum Diskusi', 'Posting Diskusi & Komentar', 'Membuat pertanyaan baru atau menanggapi diskusi ruang kelas.'),
  ('discussions:moderate', 'Forum Diskusi', 'Moderasi Diskusi', 'Menyematkan topik penting, mengunci thread, atau menghapus posting yang tidak pantas.'),

  -- 6. Progres & Monitoring
  ('progress:view_own', 'Progres & Monitoring', 'Lihat Progres Mandiri', 'Melihat rekaman capaian pembelajaran dan penyelesaian materi pribadi.'),
  ('progress:view_class', 'Progres & Monitoring', 'Lihat Progres Rombel Kelas', 'Memantau keterlibatan, presensi, dan kelengkapan mahasiswa dalam satu kelas.'),
  ('progress:export', 'Progres & Monitoring', 'Ekspor Laporan Pembelajaran', 'Mengunduh rekapitulasi data keaktifan dan nilai dalam format berkas CSV/PDF.'),

  -- 7. Akademik & Nilai
  ('academic:view_schedule', 'Akademik & Nilai', 'Lihat Jadwal Kuliah', 'Melihat kalender akademik, jadwal ruang kuliah, dan waktu perkuliahan.'),
  ('academic:manage_schedule', 'Akademik & Nilai', 'Kelola Jadwal Perkuliahan', 'Mengatur alokasi ruangan, hari, jam, dan dosen pengampu mata kuliah.'),
  ('academic:view_periods', 'Akademik & Nilai', 'Lihat Periode & Tahun Akademik', 'Melihat status kalender tahun akademik dan semester berjalan.'),
  ('academic:manage_periods', 'Akademik & Nilai', 'Kelola Periode Akademik', 'Membuka/menutup semester, KRS, dan rentang waktu penginputan nilai.'),
  ('academic:view_krs_khs', 'Akademik & Nilai', 'Lihat KRS & KHS Mahasiswa', 'Melihat rencana studi dan transkrip kartu hasil studi mahasiswa.'),
  ('academic:input_final_grades', 'Akademik & Nilai', 'Input & Finalisasi Nilai', 'Menginput nilai komponen presensi, tugas, kuis, UTS, UAS, dan publikasi nilai.'),

  -- 8. Administrasi & Keamanan
  ('sync:execute', 'Administrasi & Keamanan', 'Eksekusi Sinkronisasi SIAKAD', 'Menjalankan proses sinkronisasi dua arah data akademik dengan sistem utama.'),
  ('sync:view_logs', 'Administrasi & Keamanan', 'Lihat Log Sinkronisasi', 'Melihat riwayat transaksi dan log integrasi data SIAKAD.'),
  ('users:manage', 'Administrasi & Keamanan', 'Kelola Data Pengguna', 'Menambah, mengubah, mereset kata sandi, dan menonaktifkan akun civitas.'),
  ('roles:manage', 'Administrasi & Keamanan', 'Kelola Peran & Hak Akses', 'Mengonfigurasi peran RBAC dan memetakan hak akses sistem.'),
  ('audit:view', 'Administrasi & Keamanan', 'Lihat Audit Log Keamanan', 'Memeriksa jejak audit forensik aktivitas dan integritas sistem.'),
  ('system:configure', 'Administrasi & Keamanan', 'Konfigurasi Sistem Global', 'Mengatur parameter server, integrasi penyimpanan MinIO, dan identitas kampus.')
ON CONFLICT (id) DO UPDATE SET
  module_category = EXCLUDED.module_category,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 6. Seed role_permissions mapping
INSERT INTO role_permissions (role_id, permission_id)
VALUES
  -- Administrator Sistem (Semua Hak Akses)
  ('administrator_sistem', 'materials:view'),
  ('administrator_sistem', 'materials:manage'),
  ('administrator_sistem', 'materials:publish'),
  ('administrator_sistem', 'video:watch'),
  ('administrator_sistem', 'video:manage'),
  ('administrator_sistem', 'quizzes:attempt'),
  ('administrator_sistem', 'quizzes:manage'),
  ('administrator_sistem', 'assignments:submit'),
  ('administrator_sistem', 'assignments:grade'),
  ('administrator_sistem', 'assignments:manage'),
  ('administrator_sistem', 'discussions:view'),
  ('administrator_sistem', 'discussions:post'),
  ('administrator_sistem', 'discussions:moderate'),
  ('administrator_sistem', 'progress:view_own'),
  ('administrator_sistem', 'progress:view_class'),
  ('administrator_sistem', 'progress:export'),
  ('administrator_sistem', 'academic:view_schedule'),
  ('administrator_sistem', 'academic:manage_schedule'),
  ('administrator_sistem', 'academic:view_periods'),
  ('administrator_sistem', 'academic:manage_periods'),
  ('administrator_sistem', 'academic:view_krs_khs'),
  ('administrator_sistem', 'academic:input_final_grades'),
  ('administrator_sistem', 'sync:execute'),
  ('administrator_sistem', 'sync:view_logs'),
  ('administrator_sistem', 'users:manage'),
  ('administrator_sistem', 'roles:manage'),
  ('administrator_sistem', 'audit:view'),
  ('administrator_sistem', 'system:configure'),

  -- Administrator Akademik
  ('admin_akademik', 'materials:view'),
  ('admin_akademik', 'progress:view_class'),
  ('admin_akademik', 'progress:export'),
  ('admin_akademik', 'academic:view_schedule'),
  ('admin_akademik', 'academic:manage_schedule'),
  ('admin_akademik', 'academic:view_periods'),
  ('admin_akademik', 'academic:manage_periods'),
  ('admin_akademik', 'academic:view_krs_khs'),
  ('admin_akademik', 'academic:input_final_grades'),
  ('admin_akademik', 'sync:execute'),
  ('admin_akademik', 'sync:view_logs'),
  ('admin_akademik', 'users:manage'),
  ('admin_akademik', 'audit:view'),

  -- Pimpinan / Rektorat
  ('pimpinan', 'materials:view'),
  ('pimpinan', 'academic:view_periods'),
  ('pimpinan', 'academic:view_schedule'),
  ('pimpinan', 'progress:view_class'),
  ('pimpinan', 'progress:export'),
  ('pimpinan', 'audit:view'),
  ('pimpinan', 'sync:view_logs'),

  -- Kaprodi
  ('kaprodi', 'materials:view'),
  ('kaprodi', 'materials:manage'),
  ('kaprodi', 'video:manage'),
  ('kaprodi', 'quizzes:manage'),
  ('kaprodi', 'assignments:manage'),
  ('kaprodi', 'discussions:view'),
  ('kaprodi', 'progress:view_class'),
  ('kaprodi', 'progress:export'),
  ('kaprodi', 'academic:view_schedule'),
  ('kaprodi', 'academic:manage_schedule'),
  ('kaprodi', 'academic:view_periods'),
  ('kaprodi', 'academic:input_final_grades'),
  ('kaprodi', 'audit:view'),

  -- Dosen PA
  ('dosen_pa', 'materials:view'),
  ('dosen_pa', 'materials:manage'),
  ('dosen_pa', 'materials:publish'),
  ('dosen_pa', 'video:watch'),
  ('dosen_pa', 'video:manage'),
  ('dosen_pa', 'quizzes:manage'),
  ('dosen_pa', 'assignments:manage'),
  ('dosen_pa', 'assignments:grade'),
  ('dosen_pa', 'discussions:view'),
  ('dosen_pa', 'discussions:post'),
  ('dosen_pa', 'discussions:moderate'),
  ('dosen_pa', 'progress:view_class'),
  ('dosen_pa', 'academic:view_schedule'),
  ('dosen_pa', 'academic:input_final_grades'),
  ('dosen_pa', 'academic:view_krs_khs'),

  -- Dosen Pengampu
  ('dosen', 'materials:view'),
  ('dosen', 'materials:manage'),
  ('dosen', 'materials:publish'),
  ('dosen', 'video:watch'),
  ('dosen', 'video:manage'),
  ('dosen', 'quizzes:attempt'),
  ('dosen', 'quizzes:manage'),
  ('dosen', 'assignments:manage'),
  ('dosen', 'assignments:grade'),
  ('dosen', 'discussions:view'),
  ('dosen', 'discussions:post'),
  ('dosen', 'discussions:moderate'),
  ('dosen', 'progress:view_own'),
  ('dosen', 'progress:view_class'),
  ('dosen', 'progress:export'),
  ('dosen', 'academic:view_schedule'),
  ('dosen', 'academic:input_final_grades'),

  -- Mahasiswa
  ('mahasiswa', 'materials:view'),
  ('mahasiswa', 'video:watch'),
  ('mahasiswa', 'quizzes:attempt'),
  ('mahasiswa', 'assignments:submit'),
  ('mahasiswa', 'discussions:view'),
  ('mahasiswa', 'discussions:post'),
  ('mahasiswa', 'progress:view_own'),
  ('mahasiswa', 'academic:view_schedule'),
  ('mahasiswa', 'academic:view_krs_khs')
ON CONFLICT DO NOTHING;

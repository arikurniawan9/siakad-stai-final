# 📋 Dokumen Catatan Perkembangan & Handover Sesi Pengembangan SALAM LMS
**Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur**  
*Pembaruan Terakhir: 22 Agustus 2026 (Sesi Presensi Perkuliahan, QR Dinamis, Login/Logout 7 Role, Stabilisasi Eager State, dan Modul CBT Auto-Fullscreen & Anti-Cheating Tab Lockdown)*

---

## 🎯 1. Ringkasan Eksekutif Perkembangan Terkini

Pada sesi pengembangan ini, telah diselesaikan serangkaian pembaruan penting pada arsitektur sistem, database, REST API backend, dan antarmuka frontend SALAM LMS:

### A. Modul Penugasan & Rubrik Penilaian Tugas (Assignments & Rubrics OBE)
1. **Pembuatan & Manajemen Tugas per Pertemuan/RPS**:
   - Pembuatan tugas terintegrasi ke kelas dan nomor pertemuan RPS (`classId`, `meetingId`, `meetingNumber`).
   - Konfigurasi tanggal pembukaan (`openDate`), tenggat waktu (`dueDate`), toleransi keterlambatan (`allowLateSubmission`) dengan penalti otomatis (`latePenaltyPercentage`), kuota pengumpulan ulang (`allowResubmission`, `maxResubmissions`), dan tipe pengumpulan (`BERKAS_UNGGAHAN`, `TEKS_DARING`, `KEDUANYA`).
   - Pembatasan format berkas (`.pdf, .docx, .zip, .pptx, .xlsx, .jpg`) dan batas ukuran berkas (hingga 50 MB) yang divalidasi ganda di frontend & backend.
   - Pilihan Rubrik Penilaian: Tanpa Rubrik, Template Preset OBE STAI Al-Ittihad (4 Preset Resmi), atau Kustom Builder Interaktif dengan validasi total bobot 100%.
   - Kontrol status publikasi: `DITERBITKAN` (langsung aktif) vs `DRAF` (draf rahasia dosen).
2. **Pengumpulan Tugas oleh Mahasiswa (MinIO S3 / Object Storage + Catatan Pengantar)**:
   - Form pengumpulan interaktif dengan zona *Drag & Drop*, validasi ekstensi & ukuran aman (pemblokiran file berbahaya `.exe`, `.bat`, `.php`, `.sh`, serta path traversal).
   - Pengunggahan berkas riil ke Object Storage (`POST /api/v1/storage/upload`) yang tersimpan di bucket MinIO (`submissions/`).
   - Input teks daring / abstrak makalah dan catatan pengantar untuk dosen.
   - Deteksi otomatis status `is_late` jika melewati tenggat waktu.
   - Dukungan Resubmission / Pengumpulan Ulang dengan rekam jejak riwayat versi utuh (`v1`, `v2`, dst.) tanpa menghilangkan arsip lama.
3. **Studio Penilaian Dosen (Integrated Grading Studio)**:
   - Tampilan split-screen komprehensif: Panel kiri menampilkan info mahasiswa, status keterlambatan, catatan pengantar, riwayat versi, dan viewer pratinjau dokumen / PDF / download berkas asli.
   - Panel kanan menampilkan Rubrik Penilaian OBE Interaktif: Dosen cukup 1-klik level kriteria (Sangat Baik, Baik, Cukup, Kurang) atau memasukkan skor numerik, sistem mengkalkulasi otomatis skor murni (`rawScore`), potongan penalti terlambat (`penaltyDeduction`), dan skor akhir (`finalScore`).
   - Input catatan evaluasi & koreksi dosen dilengkapi tombol template cepat (*quick phrases*).
   - Aksi **"Simpan Nilai & Publikasikan"** (otomatis sinkron ke Gradebook / `course_grades` & audit log) dan **"Minta Revisi"** (mengubah status ke `PERLU_REVISI`).
   - Navigasi cepat antar mahasiswa sekelas (Sebelumnya / Selanjutnya).
   - Ekspor lembar rekapitulasi penilaian tugas sekelas ke format Excel/XLSX, CSV, dan PDF.
4. **Database Migration 013 & Backend Storage Controller**:
   - `013_assignments_and_rubrics_enhancement.sql`: Penambahan kolom deskripsi, lampiran panduan, open date, resubmissions, submission types, text content, dan index performa.
   - `backend/src/storage/storageController.ts`: Multer memory storage upload dan streaming file handler.
   - `backend/src/modules/assessment/assessmentController.ts`: Endpoints CRUD assignments, submissions, rubric grading, revision request, dan cascade cleanups.

### B. Modul Presensi & Kehadiran Perkuliahan Interaktif (Dynamic QR & BAP)
1. **Dynamic QR Code Berputar (Anti Titip Absen)**:
   - Generator kode QR dinamis dengan rotasi token setiap 20–30 detik dan progress bar hitung mundur waktu nyata.
   - Dilengkapi kode presensi darurat 6-digit numerik untuk mahasiswa yang mengalami kendala hardware kamera.
   - **Mode Layar Proyektor / Fullscreen**: Antarmuka proyektor ruang kuliah dengan counter mahasiswa hadir live (`24 / 30 Mahasiswa Hadir - 80%`).
2. **Presensi Mahasiswa Mandiri & Pengajuan Izin/Sakit**:
   - Tab 1: Input 6-Digit Passcode langsung dari proyektor.
   - Tab 2: Pindai token QR dinamis instan.
   - Tab 3: Form pengajuan permohonan sakit/izin dilengkapi catatan keterangan dan lampiran berkas surat keterangan dokter/resmi.
   - **Penyelesaian Masalah Tombol Presensi Mahasiswa**: 
     - Memperbaiki query SQL backend pada [`attendanceController.ts`](file:///E:/NGAJAR/PROJECTS/salamApp/backend/src/modules/attendance/attendanceController.ts) (penyelarasan nama kolom `c.class_name`, `co.code`, serta relasi `LEFT JOIN class_lecturers cl`).
     - Menghilangkan pembatasan rendering modal `StudentAttendanceModal` sehingga tombol **"Presensi Sekarang"** dan **"Presensi Sesi"** langsung memunculkan modal secara instan.
     - Penambahan mekanisme *auto-enrollment* transaksional bagi mahasiswa aktif yang belum terdaftar di `class_enrollments`.
3. **Manajemen Presensi Dosen & Berita Acara Perkuliahan (BAP)**:
   - Kontrol status sesi: `BELUM_DIBUKA` ➔ `DIBUKA` ➔ `DITUTUP`.
   - Override manual status mahasiswa oleh dosen pengampu (`HADIR`, `SAKIT`, `IZIN`, `ALPA`) dengan catatan dispensasi.
   - Editor Berita Acara Perkuliahan (BAP) mencakup moda pembelajaran (`TATAP_MUKA`, `DARING`, `HYBRID`), realisasi pokok bahasan materi perkuliahan, dan catatan kendala.
   - Pratinjau cetak resmi Berita Acara & Daftar Hadir ber-kop institusi STAI Al-Ittihad lengkap dengan lembar pengesahan Kaprodi & Dosen Pengampu (`window.print()`).
4. **Rekapitulasi Matriks Semester & Kelayakan UAS (75%)**:
   - Matriks kehadiran mahasiswa semester penuh (Pertemuan 1 s.d. 16).
   - Perhitungan otomatis persentase kehadiran dan validasi kelayakan Ujian Akhir Semester (UAS) dengan ambang batas minimal 75% sesuai Statuta Akademik STAI Al-Ittihad.
5. **Database Migration 012 & Cascading Delete FK Protection**:
   - Dibuat `012_attendance_and_qr_system.sql` yang mendefinisikan tabel `meeting_attendance_sessions`, `student_attendances`, dan `lecturer_attendances`.
### D. Manajemen Sesi Autentikasi: Login, Logout & Direktori 7 Akun Peran Aktif
1. **Fitur Login & Logout Penuh**:
   - Pemisahan status autentikasi bersih: Saat pengguna menekan tombol **"Keluar" (Logout)** di Header atau Sidebar, sesi storage dibersihkan secara instan dan pengguna diarahkan ke [`LoginPage.tsx`](file:///E:/NGAJAR/PROJECTS/salamApp/src/pages/LoginPage.tsx).
   - Form Login mendukung otentikasi melalui NIM, NIDN, NIP, Username, maupun Email institusi.
   - Kata Sandi standar demo/evaluasi: **`salam123`**.
2. **Direktori Akun 7 Peran Aktif (STAI Al-Ittihad Cianjur)**:
   - **Mahasiswa**: `21010042` / `ahmad.fauzi@staialittihad.ac.id` (Ahmad Fauzi Rahman)
   - **Dosen Pengampu**: `2112087501` / `m.ridwan@staialittihad.ac.id` (Dr. H. M. Ridwan, M.Ag)
   - **Dosen PA (Wali)**: `2115047802` / `siti.maryam.pa@staialittihad.ac.id` (Dra. Hj. Siti Maryam, M.Pd.I)
   - **Ketua Prodi (Kaprodi)**: `2118097201` / `kaprodi.pai@staialittihad.ac.id` (Dr. Ahmad Syafi'i, M.Ag)
   - **Admin Akademik (BAAK)**: `adminakademik` / `budi.santoso@staialittihad.ac.id` (Budi Santoso, S.Kom)
   - **Pimpinan (Ketua STAI)**: `pimpinan` / `ketua@staialittihad.ac.id` (Prof. Dr. KH. Abdul Halim, M.A.)
### E. Modul Ujian CBT Terpadu: Auto-Fullscreen & Anti-Cheating Lockdown System
1. **Pre-Exam CBT Security Gate (Gerbang Keamanan & Pakta Integritas)**:
   - Mahasiswa disajikan modal konfirmasi aturan ujian sebelum lembar soal dibuka: alokasi waktu, larangan berpindah tab, batas toleransi pelanggaran, dan kunci fullscreen.
   - Menekan tombol **"Saya Mengerti, Kunci Layar & Mulai Ujian"** secara otomatis mengaktifkan Browser Fullscreen API (`document.documentElement.requestFullscreen()`).
2. **Auto Fullscreen Guard & Unavoidable Lockout Overlay**:
   - Sistem memantau status `fullscreenchange`. Jika mahasiswa keluar dari mode layar penuh selama ujian berlangsung, sistem langsung menampilkan **Fullscreen Lockout Overlay** permanen bertingkat z-index tertinggi yang memblokir seluruh interaksi hingga tombol **"Kembali ke Layar Penuh (Wajib)"** ditekan.
3. **Tab & Window Focus Lock (Anti Switch Tab / Anti Buka Aplikasi Lain)**:
   - Memonitor event `visibilitychange` (`document.hidden`) dan `window.onblur`.
   - Setiap upaya berpindah tab browser, meminimalkan jendela, atau membuka aplikasi lain (seperti WhatsApp, ChatGPT, Google Search, Notepad) dicatat sebagai **Pelanggaran Keamanan CBT**.
   - Sistem memberikan modal peringatan bertingkat dengan batas maksimal **3 kali toleransi**.
   - Pada pelanggaran ke-3, ujian **otomatis dikumpulkan paksa (*Auto Force-Submit*)** ke server pengawas dan jawaban dihitung secara otomatis.
4. **Anti-Navigasi, Anti-Inspect, Anti Copy-Paste & Anti-Refresh**:
   - `beforeunload` guard: Mencegah refresh atau penutupan tab peramban secara tidak sengaja.
   - Nonaktifkan klik kanan (`contextmenu`) dengan pesan peringatan keamanan.
   - Blokir shortcut keyboard berbahaya: <kbd>F12</kbd>, <kbd>Ctrl+Shift+I</kbd>, <kbd>Ctrl+Shift+J</kbd>, <kbd>Ctrl+U</kbd> (Inspect Element), <kbd>F5</kbd>, <kbd>Ctrl+R</kbd> (Refresh), <kbd>Ctrl+C</kbd>, <kbd>Ctrl+V</kbd>, <kbd>Ctrl+X</kbd>, <kbd>Ctrl+A</kbd> (Copy-Paste) pada area soal.
   - Proteksi CSS `user-select: none` pada lembar butir soal ujian.
5. **Live Proctoring Security Badge & Audit Log**:
   - Header ujian menampilkan status keamanan waktu nyata: *Layar Penuh Terkunci*, *Hitungan Pelanggaran (0/3)*, *Countdown Timer*, dan *Autosave Indikator*.
   - Panel pengawas di samping peta soal menampilkan rekam jejak linimasa pelanggaran (timestamp dan alasan insiden).
6. **Total Navigation Lockdown (Penonaktifan Seluruh Bilah Navigasi)**:
   - Saat sesi pengerjaan kuis/CBT aktif (`activeTakingQuizId !== null`), sistem mengunci tata letak via `isCbtLockdown={true}` pada [`AppLayout.tsx`](file:///E:/NGAJAR/PROJECTS/salamApp/src/components/layout/AppLayout.tsx).
   - Seluruh elemen navigasi luar (Sidebar utama, Header institusi, Mobile Drawer, Bottom Navigation, serta tombol keluar fokus) **dinonaktifkan dan disembunyikan 100%**.
   - Mahasiswa tidak dapat mengeklik menu lain atau berpindah modul hingga lembar jawaban berhasil dikumpulkan/selesai (*Submit / Finish*).
7. **Template & Impor Soal Excel Profesional (*Multi-Sheet Workbook*)**:
   - Generator template Excel multi-sheet terstandar resmi STAI Al-Ittihad Cianjur (`Template_Impor_Bank_Soal_SALAM_LMS_STAI_Al-Ittihad.xlsx`):
     - Sheet 1: **Data_Soal** (Kode MK, Topik CPMK, Tipe Soal, Kesulitan, Teks Soal, Teks Arab Matan/Ayat, URL Gambar, Opsi A-E, Kunci Jawaban, Bobot Poin, Pembahasan).
     - Sheet 2: **Petunjuk_Pengisian** (Panduan aturan format dan nilai valid).
     - Sheet 3: **Referensi_Kode_MK** (Daftar kode mata kuliah resmi institusi).
   - Wizard impor interaktif 4-tahap dengan pemetaan kolom otomatis, validasi ganda, dan pratinjau data.
1. **Penyatuan Alur Akademik & Pembelajaran Terpadu**:
   - **Pertemuan Perkuliahan ➔ Asesmen ➔ Evaluasi ➔ Nilai ➔ KHS**:
     Setiap sesi pertemuan di [`KelasDetailPage.tsx`](file:///E:/NGAJAR/PROJECTS/salamApp/src/pages/learning/KelasDetailPage.tsx) mengintegrasikan secara langsung Materi Pembelajaran (E-Modul, Dokumen PDF/Slide, Video Interaktif), Sesi Presensi Mahasiswa & QR Dosen, Tugas Perkuliahan terkait sesi tersebut, Kuis Evaluasi Daring, dan Forum Diskusi Pertemuan.
   - Mahasiswa dapat langsung mengumpulkan tugas dari halaman pertemuan kelas dengan tombol 1-klik "Kumpulkan Tugas", dan Dosen dapat langsung menilai dari pertemuan kelas dengan tombol "Studio Penilaian".
2. **Universal Smart Routing ([`App.tsx`](file:///E:/NGAJAR/PROJECTS/salamApp/src/App.tsx))**:
   - Router mengenali pola rute berparameter otomatis (`/mata-kuliah/:id`, `/video/:id`, `/kuis/:id`, `/tugas/:id`, `/tugas/grading`, `/tugas/grading/:id`, `/forum/:id`).
   - Beranda Mahasiswa & Dosen terhubung langsung ke seluruh alur pengerjaan aktivitas dan antrean penilaian tanpa *broken links*.
3. **Pemberantasan Tuntas React Error #310 & Nginx Cache Control**:
   - Refaktor total seluruh pemanggilan hooks di komponen penugasan dan detail kelas.
   - Konfigurasi *Cache-Control: no-cache, no-store* pada [`nginx.conf`](file:///E:/NGAJAR/PROJECTS/salamApp/nginx.conf) untuk `index.html` sehingga *client browser* selalu mendapatkan *bundle build* termutakhir tanpa *caching latency*.

### B. Penyelesaian Masalah Teknis (React Error #310)
- **Root Cause**: Adanya `return` kondisional prematur (`if (!classInfo) return ...`) pada [`KelasDetailPage.tsx`](file:///E:/NGAJAR/PROJECTS/salamApp/src/pages/learning/KelasDetailPage.tsx) sebelum pemanggilan `useMemo` hooks (`totalRpsWeight`, `allMaterials`, `filteredAllMaterials`), yang melanggar *Rules of Hooks* React.
- **Solusi**: Seluruh deklarasi hooks dipindahkan secara teratur ke tingkat teratas komponen sebelum pernyataan kondisional apa pun. Dilakukan verifikasi `npm run build` lokal yang berhasil dengan exit code 0.

### C. Fitur Lengkap Modul Materi & RPS Role Dosen Pengampu (Full CRUD)
1. **Rencana Pembelajaran Semester (RPS)**:
   - **Tambah / Inisialisasi RPS**: Pembuatan draf kurikulum RPS otomatis jika kelas belum memiliki RPS terdaftar.
   - **Edit RPS Komprehensif (Multi-Bagian)**:
     - *Deskripsi Mata Kuliah*: Narasi umum ruang lingkup mata kuliah dan berkas lampiran.
     - *Capaian Pembelajaran Mata Kuliah (CPMK)*: Penambahan, pengubahan, dan penghapusan butir CPMK dinamis.
     - *Metode & Pendekatan Pembelajaran*: Pilihan interaktif metode preset (Kuliah Interaktif, Problem-Based Learning, Case-Based Learning, Praktikum/Simulasi, Video Interaktif, dll.) serta input metode kustom.
     - *Komponen & Bobot Penilaian*: Pengelolaan persentase evaluasi belajar (Kehadiran, Tugas, Kuis, UTS, UAS) dengan validator otomatis status total 100%.
     - *Daftar Pustaka & Kepustakaan*: Pengelolaan buku referensi (Judul, Pengarang, Tahun, status Rujukan Utama vs Pendukung).
   - **Reset / Hapus RPS**: Modal konfirmasi berperingatan untuk mereset dokumen kurikulum RPS ke format awal.
   - **Cetak / Ekspor RPS Resmi**: Pratinjau dokumen RPS resmi ber-kop institusi STAI Al-Ittihad lengkap dengan tabel evaluasi dan lembar pengesahan Kaprodi & Dosen Pengampu siap cetak (`window.print()`).

2. **Pertemuan Perkuliahan (Course Meetings)**:
   - **Tambah Pertemuan**: Nomor pertemuan, tanggal pelaksanaan, jam kuliah (mulai-selesai), judul, topik bahasan, deskripsi capaian, dan status publikasi (Diterbitkan / Draf / Terjadwal).
   - **Edit Pertemuan**: Pengubahan data sesi pertemuan yang sudah ada.
   - **Hapus Pertemuan**: Dialog konfirmasi destruktif dengan peringatan pembersihan kaskade data materi di dalamnya.
   - **Toggle Status Publikasi Cepat**: Aksi instan beralih antara status `DITERBITKAN` (terlihat mahasiswa) dan `DRAF` (hanya terlihat dosen).

3. **Materi Pembelajaran (Learning Materials)**:
   - **Tambah Materi Pembelajaran**:
     - *E-Modul Daring Interaktif*: Pengisian naskah bab modul, estimasi waktu baca, poin penting (key takeaways), kutipan dalil/turats Arab + terjemahan, dan studi kasus masalah + panduan analisis.
     - *Dokumen PDF / E-Book & Slide Presentasi*: Input berkas, ukuran, dan deskripsi petunjuk belajar.
     - *Buku Elektronik / Kitab Turats*: Penulis, edisi/tahqiq, dan integrasi reader buku ajar.
     - *Tautan Eksternal*: URL rujukan (Website, Jurnal, Video Youtube, Google Drive).
     - *Teks Pembelajaran Langsung*: Artikel dan penjelasan materi berbasis teks.
   - **Edit Materi**: Pengubahan judul, deskripsi, tipe materi, isi naskah, tautan, izin unduh berkas, dan status publikasi.
   - **Hapus Materi**: Dialog konfirmasi hapus materi beserta log akses aktivitas terkait.
   - **Repositori Materi Terpadu (Tab 3)**: Pencarian dan filter cerdas berdasarkan jenis materi (E-Modul, PDF, Slide, Video, Teks) di seluruh pertemuan.

4. **Integrasi REST API Backend & Migrasi Database 011**:
   - Dibuat migrasi `011_learning_materials_enhancement.sql` yang menambahkan kolom `text_content` dan `online_module` JSONB serta indeks performa pada tabel `materials` dan `course_rps`.
   - Endpoint CRUD lengkap: `GET/PUT/DELETE /classes/:classId/rps`, `GET/POST/PUT/DELETE /classes/:classId/meetings`, `POST/PUT/DELETE /classes/:classId/meetings/:meetingId/materials`.
   - Perbaikan perutean `App.tsx` saat dosen membuka menu "Materi & RPS" (`/materi`).

### A. Fitur Hapus Permanen Mata Kuliah & Rombel Kelas (Cascading Delete Protection)
1. **Pembersihan Data Kaskade Transaksional (Database Transaction)**:
   - Menghindari error `foreign key constraint violation` (karena tabel `courses` dan `course_classes` memiliki relasi `ON DELETE RESTRICT` ke 12+ tabel relasional).
   - Dibuat fungsi transaksi kaskade `deleteClassCascade(client, classId)` di [`courseAdminController.ts`](file:///E:/NGAJAR/PROJECTS/salamApp/backend/src/modules/academic/courseAdminController.ts) yang secara atomik membersihkan:
     1. Progres aktivitas mahasiswa (`student_activity_progress` & `learning_activities`)
     2. Forum diskusi & kiriman pesan (`discussion_posts` & `discussion_threads`)
     3. Tugas & berkas pengumpulan (`assignment_submissions` & `assignments`)
     4. Kuis & riwayat pengerjaan (`quiz_attempts` & `quizzes`)
     5. Video interaktif & checkpoint (`student_video_progress`, `video_checkpoints`, `interactive_videos`)
     6. Materi & log akses (`material_access_logs` & `materials`)
     7. Pertemuan perkuliahan & RPS (`course_meetings` & `course_rps`)
     8. Jadwal kuliah & ruangan (`schedules`)
     9. Enrollment & dosen pengampu (`class_enrollments` & `class_lecturers`)
     10. Rekapitulasi nilai kelas (`course_grades`)
2. **Endpoint REST API Backend**:
   - `DELETE /academic/courses/:id` — Menghapus mata kuliah beserta seluruh rombel kelas di bawahnya.
   - `DELETE /academic/classes/:id` — Menghapus spesifik satu rombel kelas perkuliahan.
   - Dilengkapi proteksi otorisasi role `requirePermission('academic:manage_periods')`.
3. **Antarmuka & Modal Konfirmasi Berperingatan (Frontend)**:
   - Tombol hapus permanen (`Trash2`) pada tabel master katalog mata kuliah dan tabel kelas.
   - Tombol hapus kelas langsung dari dalam **Modal Detail Mata Kuliah**.
   - Modal konfirmasi interaktif dengan indikator merah, ringkasan dampak data (jumlah kelas & mahasiswa terdaftar), dan validasi tombol aksi.
4. **Fitur Ubah Data Kelas (Edit Class)**:
   - Penambahan aksi edit (`Edit3`) pada tabel rombel kelas untuk mengubah semester, nama kelas, kuota mahasiswa, ruangan, mode pembelajaran (Hybrid/Tatap Muka/Daring), dan jadwal hari/jam.

---

### B. Penyelesaian Error 404 & Sinkronisasi Database Migrations
1. **Kasus Error 404 (`/api/v1/academic/courses/crs-mku103`)**:
   - Terjadi karena migrasi database sekunder (`002` s.d. `010`) belum dieksekusi secara otomatis ke volume data PostgreSQL saat inisialisasi awal.
2. **Solusi & Eksekusi Runner**:
   - Dijalankan seeding user lengkap 7 role melalui `node dist/db/seed.js`.
   - Dijalankan migrasi lengkap `001_initial_schema.sql` s.d. `010_system_settings_enhancement.sql` via `node dist/db/migrate.js`.
   - Record `crs-mku103` (*MKU-103 — Teknologi Informasi & Literasi Digital*) dan seluruh 18 mata kuliah institusi kini terdaftar dan berstatus aktif di database.

---

### C. Penyesuaian Menu Navigasi Presisi untuk 7 Peran (Role-Based Navigation)
Sebelumnya navigasi admin digabungkan dalam 1 kelompok umum. Sekarang telah dipisahkan menjadi struktur navigasi terspesialisasi di [`src/constants/navigation.ts`](file:///E:/NGAJAR/PROJECTS/salamApp/src/constants/navigation.ts):

| Peran (Role) | Kode Sistem | Fokus Navigasi & Menu yang Ditampilkan |
| :--- | :--- | :--- |
| **Mahasiswa** | `mahasiswa` | Beranda, Mata Kuliah Saya, Tugas & Asesmen, Kuis & Evaluasi, Forum Diskusi, Progres Belajar, Jadwal Kuliah, KRS, KHS, Buku Nilai, Notifikasi, Kalender Akademik, Profil & Keamanan. |
| **Dosen Pengampu** | `dosen` | Beranda, Mata Kuliah Diampu, Jadwal Mengajar, Materi & RPS, Video Interaktif, Bank Soal & Kuis, Tugas & Penilaian, Forum Diskusi, Progres Mahasiswa, Rekap Nilai Akhir, Notifikasi, Kalender, Profil. |
| **Dosen Wali (PA)** | `dosen_pa` | Seluruh menu dosen pengampu + **Bimbingan & KRS Mahasiswa** (`/bimbingan` dengan badge *Validasi*). |
| **Ketua Program Studi** | `kaprodi` | Beranda, Program Studi & Kurikulum (`/admin/prodi`), Mata Kuliah & Kelas (`/admin/mata-kuliah`), Ruangan & Jadwal Kuliah (`/admin/jadwal`), Mata Kuliah Diampu, Monitoring Aktivitas Kelas, Monitoring & Rekap Nilai, Persetujuan KRS & Bimbingan, Laporan Kinerja Akademik (`/laporan`). |
| **Admin Akademik (BAAK)** | `admin_akademik` | Beranda, Master Data Akademik (Periode, Prodi/Kurikulum, Mata Kuliah & Kelas, Ruangan & Jadwal), Sivitas (Data Mahasiswa, Data Dosen), Operasional & Sinkronisasi SIAKAD (`/admin/sinkronisasi`), Monitoring Aktivitas, Monitoring Nilai, Laporan Akademik (`/laporan`), Pusat Broadcast Notifikasi. *(Menu Konfigurasi Server Global & Hak Akses IT ditiadakan).* |
| **Pimpinan STAI** | `pimpinan` | Ringkasan Eksekutif, Laporan Kinerja Institusi (`/laporan`), Monitoring Pembelajaran, Monitoring Nilai & IPK, Tinjauan Akademik (Kurikulum, Katalog MK, Jadwal Kuliah, Kalender), Audit Log Aktivitas (`/admin/audit`), Pusat Notifikasi & Edaran. |
| **Super Admin IT** | `administrator_sistem` | Root Access: Dashboard Administrator, Seluruh Master Data Akademik & Pengguna, Operasional Sinkronisasi, Manajemen Peran & Hak Akses RBAC (`/admin/peran`), Audit Log & Jejak Keamanan (`/admin/audit`), Pengujian Keamanan QA RBAC (`/admin/keamanan`), Pengaturan Sistem Global (`/admin/pengaturan`). |

---

### D. Perbaikan Otorisasi RBAC & AuthGuard
1. **Pembaruan Otorisasi Super Admin**:
   - Penambahan hak akses `academic:input_final_grades` dan `academic:view_krs_khs` pada `ROLE_PERMISSIONS.administrator_sistem` di [`permissions.ts`](file:///E:/NGAJAR/PROJECTS/salamApp/src/constants/permissions.ts).
2. **Penyempurnaan AuthGuard di [`App.tsx`](file:///E:/NGAJAR/PROJECTS/salamApp/src/App.tsx)**:
   - Rute `/laporan`: Diproteksi dengan `permissions={['progress:view_class']}` agar dapat diakses oleh Kaprodi, Admin Akademik, Pimpinan, dan Super Admin.
   - Rute `/admin/monitoring`: Diproteksi dengan `permissions={['progress:view_class']}`.
   - Rute `/admin/nilai`: Diproteksi dengan `permissions={['academic:view_krs_khs']}`.

---

## 🏗️ 2. Peta Arsitektur & Berkas Kunci Proyek

```
salamApp/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── migrations/             # 001 s.d. 010 migrasi SQL skema & data master
│   │   │   ├── migrate.ts              # Database migration runner
│   │   │   ├── seed.ts                 # Database seed data (users, courses, classes)
│   │   │   └── pool.ts                 # PostgreSQL connection pool & transaction helper
│   │   ├── modules/
│   │   │   ├── academic/
│   │   │   │   ├── courseAdminController.ts # CRUD MK & Kelas + deleteClassCascade
│   │   │   │   ├── studyProgramController.ts
│   │   │   │   └── academicPeriodController.ts
│   │   │   ├── auth/authController.ts
│   │   │   └── users/userController.ts
│   │   └── routes/apiRouter.ts         # REST API routes registration
├── src/
│   ├── constants/
│   │   ├── navigation.ts               # Role-specific navigation groups & mobile navs
│   │   └── permissions.ts              # RBAC Role permission matrix (28 permissions)
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── MataKuliahAdminPage.tsx # Master MK & Kelas (Hapus kaskade, Edit, Impor)
│   │   │   ├── NilaiAdminPage.tsx      # Monitoring & input nilai akhir perkuliahan
│   │   │   └── MonitoringAdminPage.tsx # Monitoring aktivitas pembelajaran
│   │   └── academic/
│   │       ├── KrsMahasiswaPage.tsx    # Modul KRS Mahasiswa
│   │       └── BimbinganPaPage.tsx     # Modul Bimbingan Dosen PA & Approval KRS
│   ├── services/
│   │   ├── courseAdminService.ts       # Client API: deleteCourse, deleteClass, updateClass
│   │   └── authService.ts              # Client Auth & session permissions cache
│   └── App.tsx                         # Client Routing, RBAC AuthGuards & Layout shell
├── docker-compose.yml                  # 5 multi-container orchestration
└── SESSION_HANDOVER_NOTES.md           # Dokumen catatan perkembangan ini
```

---

## ⚠️ 3. Panduan Penting untuk Menghindari Kesalahan Pengembangan

1. **Foreign Key Integrity Saat Menghapus Data**:
   - Jika membuat fitur hapus pada modul lain (misal: Hapus Mahasiswa, Hapus Dosen, Hapus Jadwal, Hapus RPS), **selalu gunakan Database Transaction** (`db.transaction(async (client) => { ... })`) dan hapus tabel anak (*child relations*) terlebih dahulu secara terurut sebelum menghapus record induk.
2. **Kompilasi TypeScript Sebelum Rebuild Docker**:
   - Selalu uji build lokal dengan `npm run build` di root frontend dan `npm run build` di direktori `backend/` untuk memastikan tidak ada kesalahan tipe data TypeScript sebelum menjalankan perintah Docker.
3. **Eksekusi Perintah Terminal PowerShell**:
   - Jangan gunakan operator `&&` pada shell PowerShell bawaan Windows; gunakan operator `;` (titik koma) antar perintah.
4. **Caching Permission di Sesi Pengguna**:
   - Jika mengubah matriks izin pada `src/constants/permissions.ts`, fungsi di `authService.ts` akan otomatis memperbarui izin di sesi lokal pengguna saat navigasi, namun pengguna dapat melakukan *Hard Refresh (Ctrl + F5)* atau *Logout & Login* ulang untuk memastikan token/izin diperbarui secara instan.

---

## 🚀 4. Status Lingkungan & Container Docker

Seluruh 5 container Docker aktif dan berstatus sehat (*Healthy*):
* **Frontend App**: `http://localhost:8080` (Nginx Alpine melayani Production Vite Build)
* **Backend REST API**: `http://localhost:5000/api/v1` (Express TypeScript) — Health: `http://localhost:5000/health`
* **Database**: PostgreSQL 16 Alpine pada port `5432` (`salam_db`)
* **Object Storage**: MinIO S3 pada port `9000` / Console `9001`
* **Public Ngrok HTTPS Tunnel**: `https://radar-stonewall-rise.ngrok-free.dev`
* **Ngrok Web Inspector**: `http://localhost:4040`

---

## 💬 5. Prompt Utama Siap Pakai untuk Melanjutkan Sesi Pengembangan

Salin teks prompt di bawah ini ke sesi baru **Antigravity CLI** untuk langsung melanjutkan pengembangan tanpa perlu menjelaskan ulang konteks dari awal:

```markdown
Halo Antigravity! Tolong lanjutkan pengembangan aplikasi SALAM LMS (STAI Al-Ittihad Cianjur).

Seluruh fondasi sistem, meliputi:
1. Master Data (Dosen, Mahasiswa, Program Studi, Periode Akademik, Ruangan & Jadwal)
2. Modul KRS Mahasiswa & Bimbingan / Persetujuan Dosen PA
3. Fitur Hapus Kaskade Transaksional untuk Mata Kuliah & Rombel Kelas
4. Sinkronisasi Database Migrations (001 s.d. 010) & Seeding 7 Role
5. Penyesuaian Menu Navigasi Presisi untuk 7 Role (Mahasiswa, Dosen, Dosen PA, Kaprodi, Admin Akademik, Pimpinan, Super Admin)
telah selesai dan aktif berjalan di 5 container Docker serta terowongan publik Ngrok.

📋 CATATAN PENTING SEBELUM MEMULAI:
- Silakan baca berkas `SESSION_HANDOVER_NOTES.md` terlebih dahulu untuk memahami arsitektur, relasi foreign key, dan status terkini.
- Pastikan setiap perubahan tetap mempertahankan prinsip ACID transaction dan Strict TypeScript.
- Jalankan verifikasi build lokal (`npm run build`) dan update container Docker setelah selesai.

🎯 AGENDA PENGEMBANGAN SESI INI:
[PILIH / TULISKAN SALAH SATU FITUR YANG INGIN DIKERJAKAN DI BAWAH INI]:
- Opsi A: Modul Presensi & Kehadiran Perkuliahan (QR Code Dinamis, Presensi Mahasiswa & Dosen per Pertemuan RPS)
- Opsi B: Modul Penugasan & Rubrik Penilaian Tugas (Upload Berkas, Feedback Dosen, & Gradebook)
- Opsi C: Modul Pelaksanaan Kuis Daring / CBT (Timer Pengerjaan, Soal Acak 5 Opsi, & Auto Grading)
- Opsi D: Modul Pembelajaran Video Interaktif (Player Video, Checkpoint Soal Pop-up, & Log Waktu Tonton)
- Opsi E: Fitur Cetak Transkrip Nilai Akademik Lengkap & Export PDF KHS Resmi STAI Al-Ittihad

Tolong analisis kebutuhan fitur yang dipilih dan buatkan rencana implementasinya.
```

---

## 🛠️ 6. Kumpulan Template Prompt Khusus Lainnya

---

### 🌟 Template 1: Prompt Pengembangan Fitur Baru / Modul Penuh (End-to-End)
> **Gunakan template ini saat ingin membuat modul atau fitur baru (meliputi Database, Backend API, RBAC, dan Antarmuka Frontend):**

```markdown
Halo Antigravity! Anda bertindak sebagai Principal Full-Stack Engineer & Software Architect untuk proyek SALAM LMS (STAI Al-Ittihad Cianjur).

Tolong implementasikan fitur/modul berikut dengan standar produksi yang ketat:
📌 [Tuliskan nama fitur & modul, contoh: "Modul Presensi & Kehadiran Perkuliahan (QR Code Dinamis, Presensi Manual Dosen, & Rekapitulasi Mahasiswa)"]

### 🛡️ PROTOKOL PENGEMBANGAN WAJIB (SAFETY & ENGINEERING GUARDRAILS):
1. **Pahami Konteks Terlebih Dahulu**:
   - Baca berkas `SESSION_HANDOVER_NOTES.md` sebelum memulai untuk memahami skema DB, arsitektur RBAC 7 Peran, dan rute navigasi yang sudah berjalan.
   - Periksa skema database terkait di `backend/src/db/migrations/` dan relasi foreign key yang ada.
2. **Integritas Database & Backend REST API**:
   - Buat skrip migrasi SQL baru jika ada tabel/kolom baru di `backend/src/db/migrations/` (format penomoran berurutan, misal: `011_*.sql`) dengan klausa `IF NOT EXISTS` / `ON CONFLICT`.
   - Gunakan `db.transaction(...)` untuk operasi manipulasi data multi-tabel untuk menjamin konsistensi ACID.
   - Pasang otorisasi hak akses RBAC yang tepat pada endpoint API di `backend/src/routes/apiRouter.ts`.
3. **Standar Antarmuka & Frontend React**:
   - Gunakan TypeScript ketat (*Strict Types*) tanpa `any` yang tidak perlu.
   - Gunakan CSS variables yang sudah ada (design system tokens: `var(--color-primary-*)`, `var(--text-*)`, `var(--space-*)`).
   - Sertakan *Empty State*, *Loading State*, validasi input form, serta modal konfirmasi untuk tindakan destruktif.
   - Pastikan menu navigasi di `src/constants/navigation.ts` hanya muncul untuk peran (role) yang berwenang.
4. **Protokol Verifikasi Mandiri (Zero Regression)**:
   - Jalankan `npm run build` di direktori root frontend dan `npm run build` di direktori `backend/` untuk memastikan bebas error TypeScript.
   - Rebuild dan perbarui container Docker terkait dengan `docker compose build --pull=false` dan restart container.
   - Tampilkan ringkasan perubahan, berkas yang dimodifikasi, dan URL pengujian (Lokal & Ngrok).

Silakan mulai dengan menganalisis kebutuhan dan merencanakan langkah implementasinya.
```

---

### 🐞 Template 2: Prompt Perbaikan Bug / Penyesuaian Hak Akses RBAC
> **Gunakan template ini saat menemukan kendala bug, pesan 'Akses Ditolak', error 404/500, atau salah tampilan data:**

```markdown
Halo Antigravity! Tolong selidiki dan perbaiki kendala berikut pada aplikasi SALAM LMS:
📌 [Tuliskan deskripsi error atau kendala, sertakan pesan console / endpoint jika ada, contoh: "Halaman Monitoring Nilai memunculkan error 404 saat dosen membuka kelas crs-xyz"]

### 🛡️ PROTOKOL INVESTIGASI & PERBAIKAN:
1. Telusuri alur end-to-end: UI component ➔ Service client ➔ Express route/controller ➔ PostgreSQL query.
2. Jika terkait izin/hak akses, sesuaikan matriks di `src/constants/permissions.ts`, `backend/src/middleware/rbacMiddleware.ts`, dan `App.tsx` (AuthGuard) tanpa merusak batasan peran lainnya.
3. Jika terkait integritas relasi foreign key, pastikan transaksi kaskade berjalan bersih.
4. Uji kompilasi TypeScript (`npm run build`), build ulang container Docker yang terdampak, dan konfirmasi keberhasilan perbaikan.
```

---

### 🗄️ Template 3: Prompt Migrasi Database & Seeding Data Baru
> **Gunakan template ini saat menambahkan master data baru atau memperluas struktur tabel database:**

```markdown
Halo Antigravity! Tolong lakukan penambahan struktur tabel dan seeding data untuk kebutuhan:
📌 [Tuliskan data yang ingin ditambahkan, contoh: "Tabel Rubrik Penilaian OBE dan Komponen Nilai Capaian Pembelajaran Lulusan (CPL)"]

### 🛡️ ATURAN PENULISAN SKRIP DATABASE:
1. Buat file migrasi SQL bernomor urut di `backend/src/db/migrations/` dengan sifat *idempotent* (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`).
2. Tentukan batasan foreign key (`ON DELETE CASCADE` atau penanganan kaskade terprogram jika `RESTRICT`).
3. Daftarkan dan jalankan runner migrasi melalui container `salam-backend-api` (`node dist/db/migrate.js`).
4. Verifikasi isi tabel dengan menjalankan query langsung ke container `salam-postgres-db`.
```

---

### 🚦 Template 4: Prompt Pemeriksaan Kesehatan Lingkungan & Status Ngrok
> **Gunakan template ini untuk mengecek kesiapan sistem sebelum mulai bekerja atau presentasi:**

```markdown
Halo Antigravity! Tolong periksa status kesehatan seluruh lingkungan aplikasi SALAM LMS:
1. Pastikan seluruh container Docker (`salam-frontend-app`, `salam-backend-api`, `salam-postgres-db`, `salam-minio-storage`, dan `salam-ngrok-tunnel`) aktif dan sehat.
2. Periksa endpoint health backend (`/health` & `/ready`).
3. Tampilkan URL publik HTTPS Ngrok yang sedang aktif beserta link pengujian cepat untuk semua peran akun demo (Mahasiswa, Dosen, Kaprodi, Admin Akademik, Pimpinan, dan Super Admin).
```


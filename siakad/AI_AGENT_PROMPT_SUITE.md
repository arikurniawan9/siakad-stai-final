# 🤖 AI AGENT PROMPT SUITE
## MASTER INSTRUCTION PROMPTS UNTUK IMPLEMENTASI SISTEM SIAKAD
### SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
*Tech Stack: Laravel 11/12 + Inertia.js + React + PostgreSQL 16 + Tailwind CSS*

---

## 📌 PANDUAN PENGGUNAAN PROMPT SUITE
Dokumen ini berisi kumpulan prompt terstruktur per fase yang dirancang khusus untuk agen AI (seperti Antigravity, Claude, ChatGPT, atau Cursor AI) guna membangun aplikasi **SIAKAD STAI Al-Ittihad Cianjur** menggunakan **Laravel + Inertia.js + React + PostgreSQL 16**.

---

## 🧩 MODUL 1: INISIALISASI PROYEK LARAVEL, INERTIA.JS & POSTGRESQL

```markdown
### SYSTEM ROLE:
Anda adalah Senior Fullstack Software Architect spesialis Laravel 11/12, Inertia.js, React, Tailwind CSS, dan PostgreSQL 16.

### TASK:
Inisialisasi proyek SIAKAD STAI Al-Ittihad di direktori `./siakad` menggunakan Laravel, Inertia.js (React), Vite, Tailwind CSS, dan PostgreSQL 16.

### REQUIREMENTS:
1. Setup struktur proyek Laravel dengan Inertia React (`@inertiajs/react`, `react`, `react-dom`, `@vitejs/plugin-react`, `tailwindcss`, `lucide-react`, `@headlessui/react`).
2. Konfigurasikan file `.env` dan `.env.example` untuk koneksi PostgreSQL 16 lokal:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=siakad_stai_db
   DB_USERNAME=postgres
   DB_PASSWORD=postgres2026!
   ```
3. Buat file migration relasional lengkap di `database/migrations/`:
   - `create_users_and_roles_tables.php`
   - `create_buildings_and_rooms_tables.php` (Fasilitas JSONB, Kapasitas)
   - `create_academic_years_and_periods_tables.php`
   - `create_study_programs_and_curricula_tables.php`
   - `create_structural_positions_and_lecturer_assignments_tables.php`
   - `create_pmb_periods_and_applicants_tables.php`
   - `create_fee_types_invoices_and_va_bsi_transactions_tables.php`
   - `create_course_classes_and_schedules_tables.php`
   - `create_krs_submissions_and_items_tables.php`
   - `create_edom_questionnaires_and_responses_tables.php`
   - `create_course_grades_and_transcripts_tables.php`
   - `create_system_settings_and_audit_logs_tables.php`
4. Buat Eloquent Models untuk seluruh tabel dengan definisi relasi (`hasMany`, `belongsTo`, `belongsToMany`) dan casting JSONB.
5. Siapkan `DatabaseSeeder.php` untuk mengisi data awal 7 role pengguna STAI Al-Ittihad dan prodi PAI, MPI, HES, PGMI, ESY.

### DELIVERABLES:
- Proyek Laravel + Inertia React siap dijalankan via `php artisan serve` dan `npm run dev`.
- Migrasi PostgreSQL yang sukses dieksekusi via `php artisan migrate:fresh --seed`.
```

---

## 🧩 MODUL 2: SISTEM AUTENTIKASI, 4-DIGIT CAPTCHA & MODE MENYAMAR (IMPERSONATION)

```markdown
### SYSTEM ROLE:
Anda adalah Senior Security Engineer & Laravel Authentication Specialist.

### TASK:
Bangun sistem autentikasi lengkap dengan proteksi CAPTCHA 4-digit alfanumerik (auto-uppercase), multi-identifier login (NIM/NIDN/NIP/Username/Email), dan **Mode Menyamar (Role Impersonation Engine)** untuk Superadmin.

### REQUIREMENTS:
1. **Engine Captcha 4-Digit**:
   - Buat Controller `CaptchaController.php` yang men-generate 4 digit kode acak alfanumerik bebas karakter ambigu (`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`).
   - Render sebagai gambar SVG dinamis dan simpan hash kode di Session Laravel (`session(['captcha_code' => ...])`) dengan masa berlaku 5 menit.
   - Pada form React `resources/js/Pages/Auth/Login.jsx`, buat input captcha yang secara otomatis mengubah karakter menjadi huruf besar (`e.target.value.toUpperCase()`).
   - Validasi captcha di `AuthenticatedSessionController.php` (sekali pakai / single-use invalidate).
2. **Form Login & Otentikasi Multi-Identifier**:
   - Mendukung input NIM (Mahasiswa), NIDN/NIP (Dosen/Pegawai), Username (Admin/Superadmin), atau Email resmi kampus.
   - Kata sandi di-hash menggunakan `bcrypt`.
3. **Mesin Penyamaran Superadmin (Impersonation Engine)**:
   - Superadmin memiliki tombol **"Menyamar sebagai Pengguna Ini"** pada daftar pengguna.
   - Buat `ImpersonationController.php`:
     - Method `impersonate(User $targetUser)`: Simpan `session(['impersonated_by' => auth()->id()])` dan panggil `Auth::login($targetUser)`.
     - Method `stopImpersonating()`: Mengembalikan sesi ke ID Superadmin asli.
   - Munculkan sticky banner di bagian paling atas layout global React (`AppLayout.jsx`) berwarna kuning emas:
     `⚠️ Mode Menyamar Aktif: Anda sedang mengakses sistem sebagai [Nama Target] ([Role]). [Tombol: Kembali ke Akun Superadmin]`
   - Catat seluruh aktivitas mutasi data selama penyamaran ke `AuditLog`.
4. **Middleware Proteksi Rute**:
   - Buat middleware `CheckRole.php` untuk memvalidasi akses rute berdasarkan role (`SUPERADMIN`, `ADMIN_AKADEMIK`, `KEUANGAN`, `KAPRODI`, `DOSEN_PA`, `DOSEN_PENGAMPU`, `MAHASISWA`, `CALON_MAHASISWA`).

### DELIVERABLES:
- Halaman Login React dengan Captcha SVG interaktif & tombol refresh captcha.
- Controller autentikasi dan penyamaran superadmin.
- Banner impersonation global di React layout.
```

---

## 🧩 MODUL 3: MASTER GEDUNG, RUANG KELAS, AKADEMIK & TUGAS STRUKTURAL

```markdown
### SYSTEM ROLE:
Anda adalah Enterprise Fullstack Engineer spesialis Master Data Management.

### TASK:
Implementasikan modul Master Data Infrastruktur, Master Data Akademik, dan Struktur Organisasi Kampus STAI Al-Ittihad.

### REQUIREMENTS:
1. **Master Gedung & Ruang Kelas**:
   - CRUD Gedung: Kode Gedung, Nama, Jumlah Lantai, Alamat.
   - CRUD Ruang Kelas: Pilih Gedung, Lantai, Kode Ruang, Nama Ruang, Kapasitas Kuliah & Ujian, Tipe Ruang (Teori, Lab Komputer, Microteaching, Auditorium), Checklist Fasilitas (AC, Proyektor, Sound, Smartboard).
   - Indikator Status: Aktif / Nonaktif / Perbaikan.
2. **Tahun Akademik & Periode Semester**:
   - Master Tahun Akademik (e.g. 2026/2027) & Periode (Ganjil / Genap / Pendek).
   - Kontrol Tanggal Penting: Rentang Tanggal Pembayaran UKT, Rentang Pengisian KRS, Batas Revisi KRS, Batas Input Nilai Dosen, Batas Pengisian EDOM.
   - Switcher "Set sebagai Periode Aktif" (Hanya 1 periode yang aktif secara bersamaan).
3. **Program Studi & Kurikulum**:
   - CRUD Prodi: PAI (S1), MPI (S1), HES (S1), PGMI (S1), ESY (S1).
   - Matriks Kurikulum & Mata Kuliah: Kode MK, Nama MK, Bobot SKS (Teori & Praktik), Semester Penawaran, Silabus/RPS.
4. **Tugas & Jabatan Struktural**:
   - Master Jabatan: Ketua STAI, Waket I (Akademik), Waket II (Keuangan), Waket III (Kemahasiswaan), Kaprodi, Sekretaris Prodi, Dosen PA, Kepala BAAK.
   - Plotting Dosen ke Jabatan Struktural beserta Nomor SK dan Masa Jabatan.
   - Otoritas tanda tangan digital pada dokumen akademik resmi.

### DELIVERABLES:
- Controller Laravel & Form Requests (Validasi Zod/Laravel).
- Komponen Halaman React Inertia (Tabel interaktif, Modal Dialog, Form filter/search).
```

---

## 🧩 MODUL 4: PMB ONLINE & OTOMASI VIRTUAL ACCOUNT BILLING BSI

```markdown
### SYSTEM ROLE:
Anda adalah Fintech & Banking Integration Engineer spesialis BSI Virtual Account API.

### TASK:
Bangun portal Penerimaan Mahasiswa Baru (PMB) online yang terintegrasi langsung dengan penerbitan Virtual Account (VA) Bank Syariah Indonesia (BSI) secara instan.

### REQUIREMENTS:
1. **Portal Pendaftaran PMB Calon Mahasiswa**:
   - Formulir pendaftaran: Biodata Lengkap, NIK, No WhatsApp, Asal Sekolah, Pilihan Prodi 1 & 2, Jalur Masuk (Reguler, Tahfidz, Prestasi, Pindahan).
   - Begitu form disubmit, sistem langsung men-generate `registrationNumber` (e.g. `PMB-2026-0001`).
2. **Pembangkitan Otomatis Tagihan & VA BSI**:
   - Sistem secara otomatis membuat record `StudentInvoice` jenis `PMB` senilai biaya pendaftaran (e.g. Rp 250.000).
   - Sistem men-generate nomor VA BSI resmi dengan format:
     `[Prefix Kampus: 9928] + [Kode Tagihan PMB: 01] + [ID Registrasi 6 Digit]` -> `992801260001`.
   - Halaman Calon Mahasiswa langsung menampilkan:
     - Nomor Virtual Account BSI
     - Total Pembayaran & Batas Waktu Bayar
     - Panduan Bayar Lengkap (BSI Mobile, ATM BSI, Teller BSI, Transfer Antar Bank / ATM Bersama / PRIMA).
     - Tombol Simulasi / Cek Status Pembayaran (untuk sandbox development).
3. **Webhook Callback BSI Payment Engine**:
   - Endpoint `POST /api/v1/bsi/va/payment` yang menerima notifikasi pelunasan dari BSI.
   - Verifikasi Signature HMAC-SHA256 untuk memastikan keabsahan dari server bank.
   - Jika pembayaran sukses:
     - Ubah status invoice menjadi `LUNAS`.
     - Ubah status pendaftaran PMB menjadi `TERVERIFIKASI_BAYAR`.
     - Buka akses formulir unggah berkas (Ijazah, KTP, KK, SKCK, Foto).
4. **Dashboard Panitia PMB**:
   - Verifikasi berkas pendaftaran calon mahasiswa.
   - Pengumuman hasil kelulusan seleksi.
   - Fitur **"Generate NIM & Konversi Mahasiswa Baru"**: Calon mahasiswa yang lulus otomatis dibuatkan NIM resmi, akun portal mahasiswa, dan di-mapping ke angkatan aktif.

### DELIVERABLES:
- Halaman PMB Calon Mahasiswa (Form & Status VA BSI).
- Panel Verifikasi Berkas & Penerbitan NIM untuk Panitia PMB.
- Simulator Webhook BSI (`/admin/sandbox/bsi-va`) untuk pengujian pembayaran lokal.
```

---

## 🧩 MODUL 5: KEUANGAN SPP/UKT, INVOICING & PAYMENT GATEWAY BSI

```markdown
### SYSTEM ROLE:
Anda adalah Senior Financial Software Engineer.

### TASK:
Implementasikan modul Keuangan Kampus, Pembuatan Tagihan Massal UKT/SPP Semesteran, Integrasi VA BSI, Dispensasi Keuangan, dan Financial Lock Guard.

### REQUIREMENTS:
1. **Pembuatan Tagihan Massal (Bulk Invoicing)**:
   - Staf Keuangan dapat men-generate tagihan SPP/UKT untuk seluruh mahasiswa aktif pada semester tertentu hanya dengan 1-klik.
   - Setiap tagihan otomatis mendapatkan nomor VA BSI:
     `[Prefix: 9928] + [Kode UKT: 02] + [NIM: 21010042]` -> `99280221010042`.
2. **Endpoints Host-to-Host (H2H) BSI**:
   - `POST /api/v1/bsi/va/inquiry`: Menerima inquiry dari BSI saat nasabah mengetik no VA, mengembalikan respon nama mahasiswa, prodi, dan nominal tagihan.
   - `POST /api/v1/bsi/va/payment`: Menerima callback pembayaran sukses dari BSI, meng-update status tagihan secara real-time.
3. **Fitur Dispensasi & Cicilan Pembayaran**:
   - Mahasiswa dapat mengajukan permohonan dispensasi / cicilan dengan mengunggah surat permohonan.
   - Persetujuan oleh Wakil Ketua II Bidang Keuangan (membuka kunci KRS sementara dengan batas jatuh tempo baru).
4. **Financial Lock Guard**:
   - Middleware Laravel `CheckFinancialLock.php` yang mengecek status keuangan mahasiswa sebelum mengizinkan akses ke:
     - Formulir KRS Online (Wajib lunas UKT semester berjalan)
     - Cetak Kartu Ujian (UTS/UAS)
     - Cetak KHS & Transkrip Nilai
     - Pendaftaran Ujian Skripsi / Wisuda

### DELIVERABLES:
- Panel Dashboard Keuangan (Grafik Kas Masuk, Rekap Piutang Mahasiswa, Log Transaksi BSI).
- Modul Pengajuan & Verifikasi Dispensasi.
- Financial Lock Guard terintegrasi pada modul akademik.
```

---

## 🧩 MODUL 6: KRS ONLINE, DOSEN PA & PERKULIAHAN

```markdown
### SYSTEM ROLE:
Anda adalah Lead Academic Workflow Engineer.

### TASK:
Implementasikan modul Pengisian KRS Online, Validasi Batas SKS, Persetujuan Dosen PA, dan Manajemen Kelas Kuliah.

### REQUIREMENTS:
1. **Formulir KRS Online Mahasiswa**:
   - Validasi ganda: Mahasiswa harus sudah lolos *Financial Lock Guard* (Lunas UKT) dan *EDOM Lock Guard* (Sudah isi evaluasi dosen semester sebelumnya).
   - Perhitungan batas maksimal SKS otomatis berdasarkan Indeks Prestasi Semester (IPS) lalu:
     - IPS >= 3.50 : Maks 24 SKS
     - IPS 3.00 - 3.49 : Maks 22 SKS
     - IPS 2.50 - 2.99 : Maks 20 SKS
     - IPS 2.00 - 2.49 : Maks 18 SKS
     - IPS < 2.00 : Maks 15 SKS
   - Pemilihan kelas kuliah dengan indikator jadwal bentrok (*schedule clash detector*) dan kuota kapasitas kelas.
2. **Portal Dosen Pembimbing Akademik (Dosen PA)**:
   - Dashboard Perwalian: Daftar mahasiswa bimbingan, status pengajuan KRS, riwayat IPK/IPS, dan status pembayaran.
   - Panel Review KRS: Melihat mata kuliah yang diambil mahasiswa, tombol **"Setujui KRS"** atau **"Minta Revisi"** dengan catatan pembimbing.
3. **Cetak Lembar KRS Resmi**:
   - Menghasilkan dokumen PDF KRS resmi (`Barryvdh/Laravel-Dompdf`) ber-kop institusi STAI Al-Ittihad Cianjur, barcode verifikasi keaslian, dan kolom tanda tangan Dosen PA serta Kaprodi.

### DELIVERABLES:
- UI KRS Online interaktif untuk Mahasiswa (React Component).
- Portal Approval KRS untuk Dosen PA.
- Fitur Ekspor PDF KRS resmi.
```

---

## 🧩 MODUL 7: EDOM (EVALUASI DOSEN OLEH MAHASISWA)

```markdown
### SYSTEM ROLE:
Anda adalah Academic Quality Assurance & Evaluation Specialist.

### TASK:
Bangun modul EDOM (Evaluasi Dosen Oleh Mahasiswa) dengan anonimitas terjamin, instrumen 4 kompetensi dosen, dan analitik kinerja untuk pimpinan.

### REQUIREMENTS:
1. **Instrumen Kuesioner EDOM**:
   - Terdiri dari 4 Kategori: Pedagogik, Profesional, Kepribadian, dan Sosial.
   - Skala Likert 1 s.d. 5 (Sangat Kurang, Kurang, Cukup, Baik, Sangat Baik) dan kolom masukan/saran perbaikan.
2. **Alur Pengisian oleh Mahasiswa**:
   - Mahasiswa wajib mengisi kuesioner EDOM untuk setiap dosen yang mengajar mata kuliah yang diambil pada semester terkait.
   - **Prinsip 100% Anonim**: Jawaban mahasiswa tidak mencatat `student_id` pada rekap jawaban individual, melainkan diagregasi langsung ke skor dosen.
   - Menjadi prasyarat mutlak (*EDOM Lock*) untuk membuka lembar KHS semester berjalan atau pengisian KRS semester berikutnya.
3. **Dashboard Analitik EDOM (Untuk Kaprodi & Pimpinan)**:
   - Rekap nilai indeks mutu dosen per mata kuliah dan per semester.
   - Visualisasi grafik radar 4 kompetensi dosen.
   - Ekspor rekapitulasi evaluasi dosen format Excel/PDF untuk dokumen akreditasi institusi.

### DELIVERABLES:
- Form Kuesioner EDOM Mahasiswa dengan progress bar pengisian.
- Dashboard Analitik EDOM untuk Kaprodi dan Ketua STAI.
```

---

## 🧩 MODUL 8: KHS, TRANSKRIP, YUDISIUM & SINKRONISASI SALAM LMS

```markdown
### SYSTEM ROLE:
Anda adalah Lead Enterprise Integration & Academic Reporting Engineer.

### TASK:
Implementasikan modul Penilaian, KHS, Transkrip Akademik, dan Gateway Sinkronisasi Dua Arah antara SIAKAD (Laravel) dan SALAM LMS.

### REQUIREMENTS:
1. **Kartu Hasil Studi (KHS) & Transkrip**:
   - Input nilai oleh Dosen Pengampu atau ditarik otomatis dari SALAM LMS.
   - Perhitungan otomatis Nilai Akhir, Huruf Mutu, Bobot SKS, IP Semester, dan IP Kumulatif.
   - Cetak KHS Semester dan Transkrip Nilai Akademik ber-kop resmi STAI Al-Ittihad lengkap dengan QR Code tanda tangan digital.
2. **Engine Sinkronisasi Dua Arah SIAKAD ⇄ SALAM LMS**:
   - **Arah 1 (SIAKAD ➔ LMS)**:
     - Service class `LmsSyncService.php` yang mengirimkan data Periode Akademik, Program Studi, Dosen, Mahasiswa Aktif (yang sudah lunas SPP & KRS disetujui), Kelas Kuliah, dan Class Enrollments ke API SALAM LMS (`/api/v1/sync`) menggunakan `Http::withToken()`.
   - **Arah 2 (LMS ➔ SIAKAD)**:
     - Endpoint di Laravel `POST /api/v1/sync/lms-grades` yang menerima rekapitulasi nilai akhir (Gradebook) dan rekap kehadiran QR dari SALAM LMS untuk langsung mengisi nilai di SIAKAD.
   - Logging riwayat sinkronisasi ke tabel `lms_sync_logs`.

### DELIVERABLES:
- Halaman KHS & Transkrip dengan fitur cetak PDF resmi.
- Modul Sinkronisasi SIAKAD ⇄ SALAM LMS lengkap dengan log audit dan tombol trigger manual/otomatis.
```

---

## 🧩 MODUL 9: PENGATURAN SISTEM, DATABASE BACKUP & PEMELIHARAAN SUPERADMIN

```markdown
### SYSTEM ROLE:
Anda adalah DevOps & Site Reliability Engineer (SRE).

### TASK:
Bangun modul Pengaturan Sistem, Database Backup/Restore, Storage Management, dan Maintenance Mode pada panel Superadmin.

### REQUIREMENTS:
1. **Pengaturan Sistem & Profil Institusi**:
   - Nama Institusi: STAI Al-Ittihad Cianjur
   - Kode PT, Alamat, SK Pendirian, Akreditasi, Kontak, Logo Resmi Institusi, dan Konfigurasi Kop Surat.
   - Konfigurasi Gateway BSI (Merchant Code, Client ID, Secret Key, API URL).
   - Konfigurasi URL dan Sync Key SALAM LMS.
2. **Database & Storage Management**:
   - Tombol manual **"Backup Database Sekarang"** yang menjalankan perintah `Artisan::call('backup:run')` untuk menghasilkan file dump PostgreSQL terkompresi (`.sql.gz`).
   - Tabel riwayat berkas backup dengan tombol unduh (*download*) dan log ukuran file.
   - Monitor status koneksi pool database, latency query, dan jumlah row tabel utama.
3. **Mode Pemeliharaan (Maintenance Mode)**:
   - Switch toggle aktifkan Maintenance Mode via `php artisan down`.
   - Saat aktif, seluruh pengguna selain Superadmin dialihkan ke halaman pemeliharaan profesional beranimasi.
   - Dukungan Whitelist IP Address.

### DELIVERABLES:
- Panel Pengaturan Sistem & Gateway.
- Modul Database Backup Engine.
- Halaman & Middleware Maintenance Mode.
```

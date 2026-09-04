# Daftar Periksa Peluncuran Sistem (Go-Live Checklist)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

Dokumen ini memuat daftar verifikasi kesiapan komprehensif sebelum sistem SALAM dinyatakan aktif melayani civitas akademika STAI AL-ITTIHAD di lingkungan produksi.

---

### 1. Kesiapan Server & Jaringan (Server & Network Readiness)
- [x] **Domain Resmi**: Domain kampus terdaftar dan mengarah ke IP Server Publik (`salam.stai-alittihad.ac.id`).
- [x] **Sertifikat TLS/HTTPS**: Sertifikat SSL/TLS terpasang aktif dengan pengalihan otomatis HTTP $\rightarrow$ HTTPS.
- [x] **Firewall & Port**: Hanya port 80 dan 443 yang dibuka ke publik; port 5432 (Postgres) dan 9000 (MinIO) terisolasi di jaringan internal.
- [x] **Sinkronisasi Waktu (NTP)**: Server dikonfigurasi dengan zona waktu `Asia/Jakarta` (WIB) tersinkronisasi NTP.
- [x] **Kapasitas Disk**: Ruang penyimpanan SSD minimal 30 GB tersedia dengan ambang peringatan pemakaian $>80\%$.

---

### 2. Manajemen Kredensial & Rahasia (Secrets & Key Management)
- [x] **JWT_SECRET**: Kunci rahasia JWT bertaraf kriptografi tinggi ($\ge 64$ karakter acak, bukan default).
- [x] **POSTGRES_PASSWORD**: Kata sandi root PostgreSQL unik dan kuat.
- [x] **MINIO_ROOT_PASSWORD**: Kredensial penyimpanan objek MinIO unik dan aman.
- [x] **SIAKAD_SYNC_KEY**: Token autentikasi sinkronisasi SIAKAD terkonfigurasi pada kedua sistem.

---

### 3. Basis Data & Penyimpanan Objek (Database & Storage)
- [x] **Migrasi Skema Bersih**: Eksekusi `npm run migrate` sukses pada database PostgreSQL kosong (16 tabel relasional).
- [x] **Seeder Master Data**: Eksekusi `npm run seed` sukses tanpa data dummy sembarangan.
- [x] **Uji Backup PostgreSQL**: Perintah `pg_dump` menghasilkan berkas sql.gz terkompresi yang valid.
- [x] **Uji Restore PostgreSQL**: Berkas backup berhasil dipulihkan ke basis data uji tanpa galat.
- [x] **Uji Backup MinIO**: Seluruh berkas tugas dan RPS di volume `salam-minio-data` berhasil dicadangkan dan dipulihkan.

---

### 4. Aplikasi & Integrasi Frontend-Backend
- [x] **Build Produksi Tanpa Galat**: Kompilasi `tsc && vite build` bersih dari error dan warning.
- [x] **Pemeriksaan Kesehatan (Health & Readiness)**: Endpoint `/health` dan `/ready` mengembalikan respons `200 OK`.
- [x] **Endpoint Observability**: Endpoint `/metrics` aktif menampilkan penggunaan memori dan latensi DB.
- [x] **Error Boundary Terpasang**: Penangkap error global berbahasa Indonesia aktif di sisi peramban.

---

### 5. Keamanan & Penegakan Otorisasi (Security & RBAC)
- [x] **Matriks RBAC 7 Peran**: Seluruh hak akses diisolasi di backend (`mahasiswa`, `dosen`, `dosen_pa`, `kaprodi`, `admin_akademik`, `pimpinan`, `administrator_sistem`).
- [x] **Proteksi IDOR**: Mahasiswa dilarang keras mengakses berkas/lembar kuis mahasiswa lain.
- [x] **Sanitasi Unggah Berkas**: Ekstensi berbahaya (`.php`, `.exe`, `.sh`) ditolak; nama berkas dibersihkan dari `../`.
- [x] **Proteksi CSV Injection**: Seluruh data ekspor yang diawali formula (`=`, `+`, `-`, `@`) disanitasi otomatis.
- [x] **Pembatasan Frekuensi (Rate Limiting)**: Endpoint login dilindungi *sliding window limiter* (15 req/menit per IP).

---

### 6. Operasional, Prosedur Bencana & Dukungan (Operations & Support)
- [x] **Buku Panduan Operasional**: [`RUNBOOK_OPERASIONAL_SALAM.md`](file:///E:/NGAJAR/PROJECTS/salamApp/docs/RUNBOOK_OPERASIONAL_SALAM.md) tersedia dan dipahami oleh tim IT kampus.
- [x] **Rencana Pemulihan Bencana (Disaster Recovery)**: Target RPO $\le 2\text{ jam}$ dan RTO $\le 30\text{ menit}$ terdokumentasi.
- [x] **Tim Tanggap Insiden (PIC)**: Penanggung jawab teknis siap siaga pada hari peluncuran.

---
*Status Akhir: Seluruh item daftar periksa terverifikasi $\rightarrow$ **SISTEM SALAM SIAP GO-LIVE**.*

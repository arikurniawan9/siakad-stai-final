# 🌟 REKOMENDASI FITUR STRATEGIS & ROADMAP PENGEMBANGAN SIAKAD
## PANDUAN PENGEMBANGAN FITUR INOVATIF & OPTIMASI PRODUKSI
### SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR

---

## 🎯 1. Ringkasan Rekomendasi Unggulan

Untuk menjadikan sistem SIAKAD STAI Al-Ittihad Cianjur sebagai aplikasi kampus bertaraf nasional yang modern, andal, dan siap menghadapi akreditasi institusi, berikut adalah 6 fitur rekomendasi terbaik yang telah kami rancang untuk dimasukkan ke dalam roadmap sistem:

---

### 🚀 Rekomendasi 1: Integrasi PDDIKTI Neo Feeder Sync Connector
* **Latar Belakang:** Setiap semester kampus wajib melaporkan data akademik (mahasiswa baru, KRS, AKM, aktivitas kuliah, nilai, dan kelulusan) ke Pangkalan Data Pendidikan Tinggi (PDDIKTI) Kemendikbudristek/Kemenag.
* **Fitur yang Disarankan:**
  - Modul **Feeder PDDIKTI Connector** di panel Admin Akademik.
  - Memanfaatkan Web Service REST API resmi Neo Feeder Kemendikbud.
  - Fitur *Auto-Mapping* ID Mahasiswa, ID Mata Kuliah, dan ID Kurikulum ke format PDDIKTI.
  - Fitur *Dry-Run Validation* (Mengecek ketidaksesuaian NIK, nama ibu kandung, atau SKS sebelum data dikirim ke Feeder).

---

### 📱 Rekomendasi 2: WhatsApp Gateway Notification Engine (Fonnte / Wablas)
* **Latar Belakang:** Mahasiswa dan dosen jauh lebih responsif terhadap pesan WhatsApp dibandingkan email.
* **Fitur yang Disarankan:**
  - **Notifikasi PMB:** Mengirim pesan instan berisi Nomor VA BSI dan panduan bayar ke nomor WhatsApp calon mahasiswa begitu pendaftaran disubmit.
  - **Notifikasi Pelunasan:** Mengirim tanda terima pembayaran resmi begitu transaksi VA BSI terkonfirmasi.
  - **Notifikasi KRS & Perkuliahan:** Notifikasi ke dosen pembimbing saat mahasiswa mengajukan KRS, dan notifikasi ke mahasiswa saat KRS disetujui/ditolak.
  - **Pengingat Jatuh Tempo Tagihan:** Otomasi broadcast pengingat H-7 dan H-1 batas akhir pembayaran SPP/UKT.

---

### 🔏 Rekomendasi 3: Dokumen Digital Ber-QR Code & Public Verification Portal
* **Latar Belakang:** KHS, Transkrip Akademik, dan Surat Keterangan Aktif Kuliah rentan terhadap pemalsuan jika tidak memiliki mekanisme verifikasi digital.
* **Fitur yang Disarankan:**
  - Setiap dokumen PDF resmi yang diterbitkan SIAKAD disematkan **Dynamic QR Code Signature**.
  - Saat QR Code dipindai oleh pihak eksternal (perusahaan/kantor/kemenag), browser akan diarahkan ke halaman publik:
    `https://siakad.stai-alittihad.ac.id/verify/[DOCUMENT_HASH]`
  - Halaman verifikasi menampilkan identitas asli mahasiswa, status keaktifan, pejabat penandatangan, dan validitas dokumen secara *real-time*.

---

### 🌐 Rekomendasi 4: Single Sign-On (SSO) OAuth2 Antara SIAKAD & SALAM LMS
* **Latar Belakang:** Mahasiswa dan dosen tidak perlu mengingat dua kata sandi yang berbeda untuk SIAKAD dan LMS.
* **Fitur yang Disarankan:**
  - SIAKAD bertindak sebagai **Identity Provider (IdP)** berbasis OpenID Connect / OAuth2.
  - Pada halaman login SALAM LMS, disediakan tombol **"Masuk dengan Akun SIAKAD"**.
  - Pengguna cukup login sekali di SIAKAD, dan otomatis terotentikasi di seluruh layanan kampus.

---

### 💾 Rekomendasi 5: Automated Nightly Database Backup & Cloud S3 Archiving
* **Latar Belakang:** Perlindungan data akademik dan keuangan dari insiden kerusakan server atau serangan ransomware.
* **Fitur yang Disarankan:**
  - Script cron job harian pada pukul 02:00 WIB yang mengeksekusi `pg_dump` database PostgreSQL dengan kompresi `.sql.gz`.
  - Enkripsi AES-256 pada file dump sebelum diunggah ke Object Storage (MinIO S3 / AWS S3).
  - Notifikasi ringkasan status backup ke Bot Telegram Admin/Superadmin (`✅ Backup Sukses: 45.2 MB`).
  - Kebijakan retensi otomatis: Backup harian disimpan 30 hari, mingguan disimpan 3 bulan, bulanan disimpan 1 tahun.

---

### 📈 Rekomendasi 6: Executive Dashboard & Akreditasi Analytics (LAMDIK / BAN-PT)
* **Latar Belakang:** Pimpinan kampus (Ketua STAI, Para Wakil Ketua, dan Kaprodi) memerlukan data analitik untuk pengambilan keputusan cepat dan persiapan borang akreditasi.
* **Fitur yang Disarankan:**
  - Grafik Rasio Dosen terhadap Mahasiswa (Ideal 1:30).
  - Grafik Distribusi IPK Rata-Rata per Program Studi dan Angkatan.
  - Tingkat Kelulusan Tepat Waktu (Persentase Lulus 4 Tahun vs >4 Tahun).
  - Ekspor Tabel Borang Kriteria Akreditasi otomatis dalam format Excel resmi.

---

## 🗺️ 2. Roadmap Fase Pengembangan

```
+-----------------------------------------------------------------------------------+
| FASE 1: CORE FOUNDATION & SECURITY (Minggu 1)                                    |
| - Inisialisasi Next.js 15, Prisma ORM, PostgreSQL 16                              |
| - Autentikasi Multi-Identifier, Captcha 4-Digit, & Superadmin Impersonation Engine|
| - Master Gedung, Ruang, Tahun Akademik, Program Studi, & Jabatan Struktural       |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 2: PMB & INTEGRASI FINTECH VA BSI (Minggu 2)                                 |
| - Portal Pendaftaran PMB Online Calon Mahasiswa                                   |
| - VA Billing BSI Host-to-Host Engine (Auto VA PMB & SPP)                          |
| - Webhook Callback & Sandbox Simulator                                           |
| - Verifikasi Berkas, Seleksi & Auto-Generate NIM                                  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 3: AKADEMIK, KRS, EDOM & EVALUASI (Minggu 3)                                 |
| - Financial Lock Guard & EDOM Lock Guard                                          |
| - KRS Online Mahasiswa & Portal Approval Dosen PA                                 |
| - Manajemen Jadwal & Detektor Bentrok Ruang Kelas                                 |
| - Modul Kuesioner EDOM 4 Kompetensi & Analitik Mutu Dosen                         |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
| FASE 4: INTEGRASI SALAM LMS, KHS & DEPLOYMENT (Minggu 4)                          |
| - Gateway Sinkronisasi Dua Arah SIAKAD ⇄ SALAM LMS                                |
| - KHS, Transkrip Akademik, & QR Verification                                      |
| - Superadmin Maintenance Mode & Automated DB Backup                               |
| - Docker Multi-Stage Build & Deployment ke VPS Hosting                            |
+-----------------------------------------------------------------------------------+
```

# 📍 LEMBAR CATATAN PROGRES & CHECKPOINT PENGERJAAN SIAKAD & SALAM LMS
## SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
*Status Terakhir Diperbarui: 24 Agustus 2026 (22:40 WIB)*
*Tech Stack: Laravel 13 + Inertia.js (React) + PostgreSQL 16 (Docker) + SALAM LMS (React Vite TS & Node.js Express)*

---

## 🎯 RINGKASAN STATUS FASE PENGERJAAN

| Fase | Modul & Komponen | Status | Keterangan Detail |
| :---: | :--- | :---: | :--- |
| **FASE 1** | Scaffolding Laravel 13, Inertia.js, React, Tailwind CSS & PostgreSQL 16 | 🟢 **SELESAI** | Database `siakad_stai_db` siap, paket Inertia + React + Tailwind aktif, `.env` & Vite terhubung. |
| **FASE 2** | Database Schema, Relasional Migrations & Seeders (12 Modul Core) | 🟢 **SELESAI** | 12 Migrasi PostgreSQL (Gedung, Ruang, Periode, Prodi, PMB, Invoice, VA BSI, KRS, EDOM, KHS, Superadmin). |
| **FASE 3** | Sistem Keamanan Login, Captcha 4-Digit, Modal Menyamar Premium & Hide-Seek | 🟢 **SELESAI** | Captcha SVG dinamis, Multi-identifier login, ImpersonationModal Premium, Sticky Gold Banner, Fix Layout Offset, dan Tombol Bulat Hide-Seek Sidebar. |
| **FASE 4** | Master Infrastruktur: Gedung & Ruang Kelas (Anti-Clash Scheduler) | 🟢 **SELESAI** | CRUD Gedung, Denah Lantai, Ruang Kelas, Fasilitas JSONB (Safe Parsing), Visualisasi Kapasitas Kuliah & Ujian. |
| **FASE 5** | Master Akademik, Form Tambah Tahun Akademik & Periode Semester | 🟢 **SELESAI** | Input Tahun Akademik, Input Periode Semester (Ganjil/Genap/Pendek) lengkap dengan jadwal Kuliah, KRS, SPP BSI, Nilai & EDOM, 5 Prodi. |
| **FASE 6** | PMB Online & Otomasi Virtual Account Billing Bank Syariah Indonesia (BSI) | 🟢 **SELESAI** | Form Pendaftaran PMB, Auto-generate VA BSI (992801...), Webhook Callback BSI, Sandbox Simulator. |
| **FASE 7** | Keuangan SPP/UKT Massal, H2H BSI Payment Callback & Financial Lock Guard | 🟢 **SELESAI** | Invoicing SPP Massal, VA BSI UKT (992802...), Middleware Financial Lock, Simulasi H2H 1-Klik. |
| **FASE 8** | KRS Online Mahasiswa, Dosen PA Approval, & Modul EDOM 100% Anonim | 🟢 **SELESAI** | Validasi Beban SKS (IPS), Deteksi Bentrok Kelas, Portal Review Dosen PA, Kuesioner EDOM 4 Kompetensi. |
| **FASE 9** | KHS, Transkrip Akademik Digital & Sinkronisasi Dua Arah ke SALAM LMS | 🟢 **SELESAI** | Cetak KHS Digital QR Verification Seal, Gateway Sinkronisasi ke SALAM LMS (`syncService.ts`). |
| **FASE 10** | Superadmin Developer Telemetry vs Admin BAAK UI & Compact Layout | 🟢 **SELESAI** | Tampilan dibedakan (Superadmin: Developer Health, H2H BSI, Live Audit Feed, Mode Menyamar ke Semua Role; Admin: Manajemen Akademik, Gedung, Kurikulum, Akun). |
| **FASE 11** | Sinkronisasi Realtime SIAKAD ⇄ SALAM LMS (Push Master & Pull Grades) | 🟢 **SELESAI** | Tes latensi gateway, Push master data, Pull rekap nilai tugas & kuis CBT, Inbound Webhook handler & Queue caching fallback. |
| **FASE 12** | Penjadwalan Kuliah Lanjutan & Anti-Clash Matrix Engine | 🟢 **SELESAI** | Visualisasi Matriks Mingguan (Senin-Sabtu), Algoritma Deteksi Bentrok Ruangan & Dosen, Live Pre-Submit Clash Checker API. |
| **FASE 13** | Kurikulum OBE, Matakuliah Prasyarat & Konversi Nilai MBKM/Transfer | 🟢 **SELESAI** | Pohon Prasyarat Matakuliah, Manajemen Konversi Nilai MBKM (Kampus Mengajar, Magang, Studi Independen, RPL) dengan nomor SK Rekognisi resmi. |
| **FASE 14** | Portal Verifikasi Dokumen Resmi Ber-QR Code Publik (`/verify/{hash}`) | 🟢 **SELESAI** | Portal publik verifikasi KHS, Transkrip & Surat Keterangan ber-seal institusi STAI Al-Ittihad, status keaslian real-time & cryptographic verification. |
| **FASE 15** | PDDIKTI Neo Feeder Sync Connector & Dry-Run Validator | 🟢 **SELESAI** | Dashboard Kesiapan Pelaporan PDDIKTI, Dry-Run Integrity Validator (Otomatis deteksi format NIK, SKS nol, & kelas tanpa dosen), Ekspor format JSON resmi Feeder. |
| **FASE 16** | **Modul Admin Enterprise (CRUD User & Excel, KRS Bulk Approval, Gradebook DPNA & Grade Lock, EDOM Mutu 4 Aspek, Surat Keterangan Aktif)** | 🟢 **SELESAI** | 1. CRUD Pengguna, 1-Klik Reset Password ke `salam123`, Toggle Status, & Batch Import Excel.<br>2. Monitoring & Bulk Approval KRS Mahasiswa dengan auto-enrollment.<br>3. Gradebook Admin dengan Grade Lock guard, kalkulasi bobot otomatis, histogram mutu, & cetak lembar DPNA resmi ber-kop institusi.<br>4. Dashboard Evaluasi Dosen (EDOM) 4 Aspek Kompetensi & Ulasan Anonim.<br>5. Generator Surat Keterangan Aktif Kuliah Digital ber-QR Code verifikasi publik. |
| **FASE 17** | Single Sign-On (SSO) OAuth2 & SALAM LMS Realtime Features | 📋 **TERENCANA** | Spesifikasi teknis tersimpan di `ROADMAP_FASE_SELANJUTNYA_SSO_DAN_LMS.md` (SSO IdP/Client, WhatsApp Gateway Fonnte, Forum Diskusi, & CBT Proctoring Telemetry). |

---

## 🔑 KREDENSIAL AKUN UJI COBA (PASSWORD: `salam123`)

| No | Peran (Role) | Username / Identitas | Email | Fungsi Utama |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Superadmin (Developer)** | `superadmin` | `superadmin@staialittihad.ac.id` | Akses penuh, mode menyamar semua role, diagnostik sistem, Feeder PDDIKTI, LMS Gateway |
| 2 | **Admin Akademik (BAAK)** | `adminakademik` | `budi.santoso@staialittihad.ac.id` | Plotting Jadwal Anti-Clash, Approval KRS, Gradebook DPNA, EDOM, Surat Keterangan |
| 3 | **Keuangan** | `keuangan` | `keuangan@staialittihad.ac.id` | Mass Invoicing SPP, monitoring VA BSI (9928) |
| 4 | **Kaprodi PAI** | `2118097201` | `kaprodi.pai@staialittihad.ac.id` | Approval KRS Prodi, Evaluasi Nilai DPNA, Analitik Mutu EDOM |
| 5 | **Dosen Wali (PA)** | `2115047802` | `siti.maryam.pa@staialittihad.ac.id` | Review & persetujuan rencana studi (KRS) mahasiswa |
| 6 | **Dosen Pengampu** | `2112087501` | `m.ridwan@staialittihad.ac.id` | Kelas mengajar, input nilai tugas/kuis/UTS/UAS, cetak DPNA |
| 7 | **Mahasiswa** | `21010042` | `ahmad.fauzi@staialittihad.ac.id` | KRS Online, tagihan VA BSI, Cetak KHS Digital & Verifikasi QR |

---

## 🌐 DAFTAR URL FITUR UTAMA ADMIN SISTEM

- 🏛️ **Dasbor SIAKAD STAI:** [`http://localhost:8000`](http://localhost:8000)
- 👥 **Manajemen Pengguna & Akun (CRUD & Excel):** [`http://localhost:8000/admin/users`](http://localhost:8000/admin/users)
- 📝 **Monitoring & Bulk Approval KRS Mahasiswa:** [`http://localhost:8000/admin/krs-approval`](http://localhost:8000/admin/krs-approval)
- 📊 **Gradebook Kelas, Grade Lock & Cetak DPNA:** [`http://localhost:8000/admin/grades`](http://localhost:8000/admin/grades)
- ⭐ **Dashboard Evaluasi Dosen (EDOM) 4 Aspek:** [`http://localhost:8000/admin/edom`](http://localhost:8000/admin/edom)
- 📄 **Penerbitan Surat Keterangan Aktif Ber-QR Code:** [`http://localhost:8000/admin/letters`](http://localhost:8000/admin/letters)
- 📅 **Plotting Jadwal & Anti-Clash Matrix:** [`http://localhost:8000/admin/schedules`](http://localhost:8000/admin/schedules)
- 🎓 **Kurikulum, Prasyarat & MBKM:** [`http://localhost:8000/admin/curricula`](http://localhost:8000/admin/curricula)
- 🔄 **Gateway Sinkronisasi Realtime LMS:** [`http://localhost:8000/admin/lms-sync`](http://localhost:8000/admin/lms-sync)
- 🏛️ **PDDIKTI Neo Feeder Connector:** [`http://localhost:8000/admin/pddikti`](http://localhost:8000/admin/pddikti)

# 🗺️ DOKUMEN RENCANA PENGERJAAN FASE SELANJUTNYA
## SINGLE SIGN-ON (SSO) OAUTH2, FORUM REALTIME, DAN CBT PROCTORING
### SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
*Status: Tersimpan & Siap Diimplementasikan pada Sesi Pengembangan Mendatang*

---

## 🎯 1. Ringkasan Eksekutif Rencana Pengembangan

Dokumen ini memuat spesifikasi teknis arsitektur, alur data, rancangan database, dan langkah implementasi untuk **Poin 3 (Pengembangan Fitur Spesifik SALAM LMS & SSO)** yang dipersiapkan untuk fase pengerjaan berikutnya.

```
+---------------------------------------------------------------------------------------------+
|                                    SIAKAD STAI AL-ITTIHAD                                   |
|                        (Identity Provider / IdP - OAuth2 / OIDC Server)                     |
+---------------------------------------------------------------------------------------------+
                                       ▲              ▲
            [1. SSO OAuth2 / OIDC]     │              │     [2. Push Gradebook & AKM]
                                       │              │
                                       ▼              ▼
+---------------------------------------------------------------------------------------------+
|                                      SALAM LMS PORTAL                                       |
|                              (OAuth Client / Learning Engine)                               |
+---------------------------------------------------------------------------------------------+
          │                                           │
          ▼                                           ▼
[3. Realtime Notification Engine]          [4. CBT Exam Proctoring Telemetry]
 (WhatsApp Gateway & WebSocket)             (Focus Lock & Live Violation Feed)
```

---

## 🔑 2. Modul 1: Single Sign-On (SSO) OAuth2 / OpenID Connect (OIDC)

### A. Latar Belakang & Tujuan
Mahasiswa, dosen, dan pimpinan hanya perlu mengingat **satu akun** (NIM/NIDN/Email dan Password `salam123`) di SIAKAD. Saat mengakses SALAM LMS, pengguna cukup mengeklik tombol **"Masuk dengan Akun SIAKAD STAI"**, dan sistem otomatis melakukan autentikasi pertukaran token tanpa login ulang.

### B. Arsitektur Teknis
1. **SIAKAD sebagai Identity Provider (IdP)**:
   - Menggunakan modul Laravel Passport / Laravel Sanctum OAuth2 Server atau Lightweight OpenID Provider.
   - Endpoint:
     - `GET /oauth/authorize` : Menampilkan consent screen & otorisasi akses.
     - `POST /oauth/token` : Pertukaran `authorization_code` dengan `access_token` (JWT).
     - `GET /api/v1/oauth/userinfo` : Mengembalikan profil pengguna (ID, NIM/NIDN, Nama, Email, Role, Prodi, Foto).
2. **SALAM LMS sebagai OAuth2 Client**:
   - Menambahkan tombol "Masuk via SIAKAD" pada `lms/src/pages/LoginPage.tsx`.
   - Backend LMS (`lms/backend/src/modules/auth/authController.ts`) menangani callback `GET /api/v1/auth/siakad/callback`, memverifikasi token ke SIAKAD, dan menerbitkan sesi lokal JWT LMS.

---

## 💬 3. Modul 2: Forum Diskusi Terpadu & Realtime Notification Engine

### A. Forum Diskusi Kolaboratif per Pertemuan RPS:
1. **Thread Diskusi Terstruktur**: Forum tanya-jawab dosen-mahasiswa dengan dukungan teks Arab (Matan/Ayat), upload lampiran referensi, dan Markdown.
2. **Komentar Bertingkat (Nested Replies)** & Pin Pertanyaan Terbaik oleh Dosen.
3. **Pemberian Poin Partisipasi**: Skor keaktifan diskusi otomatis masuk ke persentase nilai afektif di Gradebook.

### B. WhatsApp Gateway Notification Engine (Fonnte / Wablas API):
1. **Notifikasi Otomatis ke Mahasiswa**:
   - Pembukaan sesi presensi kuliah baru (dengan kode darurat).
   - Pengumuman batas akhir pengumpulan tugas (H-24 jam).
   - Nilai tugas/kuis telah dirilis dosen.
2. **Notifikasi Otomatis ke Dosen**:
   - Rekap pengumpulan tugas mahasiswa per kelas.
   - Mahasiswa mengajukan izin/sakit perkuliahan.

---

## 🛡️ 4. Modul 3: CBT Exam Proctoring Telemetry & AI Anti-Cheating

### A. Live Proctoring Monitor untuk Pengawas Ujian:
1. **Dashboard Pengawas Kelas**: Tampilan grid seluruh mahasiswa yang sedang mengerjakan ujian secara *real-time*.
2. **Indikator Status Peserta**:
   - 🟢 **Aman**: Layar penuh aktif, fokus tab terjaga.
   - 🟡 **Peringatan**: Keluar fullscreen atau switch tab (1-2 kali pelanggaran).
   - 🔴 **Terkunci / Force Submit**: Melebihi 3 pelanggaran atau terdeteksi inspect element.
3. **Audit Log Forensik Ujian**: Catatan timestamp per detik ketika terjadi perpindahan jendela atau penekanan shortcut berbahaya.

---

## 📋 5. Tabel Rencana Implementasi & Checklist Kesiapan

| Modul | Komponen Kunci | Estimasi File yang Dimodifikasi | Prioritas |
| :--- | :--- | :--- | :---: |
| **SSO OAuth2** | `OAuthController.php`, `siakadAuthBridge.ts`, `LoginPage.tsx` | `siakad/routes/api.php`, `lms/backend/src/modules/auth` | 🟢 Siap Dikerjakan |
| **Forum Diskusi** | `discussionController.ts`, `DiscussionForum.tsx` | `lms/src/pages/DiscussionPage.tsx` | 🟢 Siap Dikerjakan |
| **WhatsApp Gateway** | `WhatsAppNotificationService.php`, Webhook Fonnte | `siakad/app/Services/WhatsAppService.php` | 🟡 Tahap Lanjutan |
| **CBT Telemetry Live** | `cbtProctoringSocket.ts`, `LiveProctoringModal.tsx` | `lms/src/components/cbt/ProctoringDashboard.tsx` | 🟡 Tahap Lanjutan |

---
*Dokumen ini disimpan permanen sebagai panduan langsung ketika sesi pengembangan fitur Poin 3 dimulai.*

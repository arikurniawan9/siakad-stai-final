# 🎓 SIAKAD — SISTEM INFORMASI AKADEMIK TERPADU
## SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
*Pusat Tata Kelola Akademik, Keuangan Syariah, & Integrasi Pembelajaran*

---

## 📚 DOKUMENTASI MASTER & ARSITEKTUR SISTEM

Direktori ini berisi cetak biru (*blueprint*), panduan spesifikasi teknis, integrasi perbankan, dan prompt master AI Agent untuk pembangunan sistem **SIAKAD STAI Al-Ittihad**:

| Dokumen | Deskripsi |
| :--- | :--- |
| 🏛️ [**SIAKAD_MASTER_BLUEPRINT.md**](./SIAKAD_MASTER_BLUEPRINT.md) | **Cetak Biru Arsitektur Enterprise:** ERD Database lengkap, skema relasional, modul gedung/ruang, master akademik, PMB, keuangan VA BSI, KRS, EDOM, KHS/Transkrip, Superadmin Control & Impersonation, serta Deployment VPS. |
| 🤖 [**AI_AGENT_PROMPT_SUITE.md**](./AI_AGENT_PROMPT_SUITE.md) | **Master Prompt Suite untuk AI Agent:** Panduan prompt siap pakai per fase untuk mengeksekusi coding modul demi modul secara terstruktur, rapi, dan bebas error. |
| 🏦 [**VA_BSI_INTEGRATION_SPEC.md**](./VA_BSI_INTEGRATION_SPEC.md) | **Spesifikasi Teknis Integrasi VA BSI:** Algoritma pembentukan nomor VA (Prefix `9928` + Kode Tagihan + NIM/ID), otentikasi HMAC-SHA256, API Inquiry, Webhook Payment Callback, dan Mock Sandbox Simulator. |
| 🌟 [**RECOMMENDATIONS_AND_ROADMAP.md**](./RECOMMENDATIONS_AND_ROADMAP.md) | **Rekomendasi Inovatif & Roadmap:** Feeder PDDIKTI Sync, WhatsApp Gateway Notification, Digital Signature QR Code Verification, Single Sign-On (SSO) SIAKAD ⇄ LMS, dan Otomasi Backup Harian. |

---

## 🚀 FITUR UTAMA SISTEM

1. **Master Infrastruktur:** Input Kampus, Gedung, Lantai, dan Ruang Kelas dengan fasilitas lengkap dan detektor bentrok jadwal.
2. **Master Akademik & Jabatan Struktural:** Tahun Akademik, Semester (Ganjil/Genap/Pendek), Program Studi (PAI, MPI, HES, PGMI, ESY), Kurikulum, dan Penetapan Pejabat Struktural ber-SK.
3. **PMB Online & Auto-Billing VA BSI:** Pendaftaran calon mahasiswa baru yang otomatis menerbitkan Virtual Account BSI dan memverifikasi pelunasan secara *real-time*.
4. **Keuangan & Billing VA BSI:** Pembuatan tagihan massal SPP/UKT, her-registrasi, praktikum, sidang skripsi, dan wisuda dengan *Financial Lock Guard*.
5. **KRS Online & Dosen PA:** Validasi batas SKS berdasarkan IPS semester lalu, antarmuka pemilihan kelas, dan persetujuan dosen pembimbing akademik.
6. **EDOM (Evaluasi Dosen Oleh Mahasiswa):** Kuesioner evaluasi mutu dosen 4 kompetensi berprinsip 100% anonim sebagai syarat pembuka KHS/KRS.
7. **KHS, Transkrip & Yudisium:** Input nilai dosen, perhitungan IPK/IPS otomatis, dan cetak dokumen resmi ber-kop institusi dengan QR Code verifikasi keaslian.
8. **Superadmin Master Control & Mode Menyamar:** Pengaturan sistem, status database pool, maintenance mode, dan fitur *Role Impersonation* untuk menyamar ke akun peran manapun tanpa password.
9. **Sistem Keamanan Login:** Proteksi CAPTCHA 4-digit alfanumerik (auto-uppercase) yang disimpan dalam session terenkripsi.
10. **Sinkronisasi Dua Arah ke SALAM LMS:** Broadcast master data dan kelas ke LMS, serta penarikan rekap nilai dan presensi kembali ke SIAKAD.

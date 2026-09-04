# Catatan Rilis Perangkat Lunak (Release Notes)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD
**Versi Rilis**: `v1.0.0` (Production Stable)  
**Tanggal Rilis**: 16 Agustus 2026

---

### 🌟 Fitur Unggulan & Kapabilitas Utama

1. **Autentikasi & Matriks 7 Peran (RBAC Server-Side)**:
   - Dukungan penuh untuk 7 peran sivitas akademika: `mahasiswa`, `dosen`, `dosen_pa`, `kaprodi`, `admin_akademik`, `pimpinan`, dan `administrator_sistem`.
   - Penyimpanan sesi aman berbasis token JWT dan cookie `HttpOnly; SameSite=Lax; Secure`.
2. **Sinkronisasi Akademik SIAKAD Idempoten**:
   - Integrasi dua arah dengan SIAKAD STAI AL-ITTIHAD dengan batas keunikan `source_system + external_id` untuk mencegah duplikasi kelas/mahasiswa.
3. **Penyusunan RPS & 16 Pertemuan Perkuliahan**:
   - Manajemen silabus RPS lengkap dengan Capaian Pembelajaran Lulusan (CPL), bobot evaluasi, dan katalog 16 pertemuan kelas.
4. **Video Pembelajaran Interaktif & Anti-Cheat**:
   - Pemutar video dengan pertanyaan checkpoint formatif di timestamp tertentu dan pelacakan segmen tontonan nyata server-side.
5. **Mesin Kuis Daring & Bank Soal**:
   - 4 tipe soal (Pilihan Ganda, Benar/Salah, Isian Singkat, Esai), timer sinkron waktu server, autosave jawaban, dan penilaian objektif otomatis.
6. **Penugasan Berkas & Penilaian Rubrik Analitik**:
   - Pengumpulan berkas format aman (.pdf, .docx), penilaian matriks rubrik berbobot, revisi bertingkat, dan jejak audit modifikasi nilai.
7. **Forum Diskusi & Moderasi Dosen**:
   - Thread berulir, upvotes, penyematan (*Pin*), penguncian (*Lock*), dan penandaan *Best Answer*.
8. **Mesin Progres Belajar & Rekomendasi "Lanjutkan Belajar"**:
   - Pelacakan progres multi-sumber (materi, video, kuis, tugas, forum) bebas *double-counting* dan rekomendasi aktivitas wajib berikutnya.
9. **Beranda Pintar, Notifikasi & Kalender Terpadu**:
   - Beranda personal per peran, notifikasi lonceng in-app instan, dan agenda akademik kampus terpadu.
10. **Infrastruktur Persisten & Pemulihan Bencana**:
    - PostgreSQL 16, MinIO Object Storage, Nginx Reverse Proxy, dan prosedur backup/restore dengan target RPO $\le 2\text{ jam}$ dan RTO $\le 30\text{ menit}$.

---
*Diterbitkan oleh Tim Pengembang SALAM STAI AL-ITTIHAD (2026).*

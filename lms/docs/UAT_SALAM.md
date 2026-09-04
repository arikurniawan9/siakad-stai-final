# Dokumen Pengujian Penerimaan Pengguna (User Acceptance Testing / UAT)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

Dokumen ini memuat matriks skenario UAT berbasis 7 peran pengguna riil yang mencerminkan alur kerja perkuliahan di STAI AL-ITTIHAD.

---

### Matriks Pengujian UAT (7 Peran SALAM)

| ID UAT | Peran Pengguna | Modul Fungsional | Langkah Pengujian | Hasil Ekspektasi | Hasil Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-MHS-01** | `mahasiswa` | Autentikasi | Masuk dengan kredensial NIM dan kata sandi valid. | Berhasil login dan dialihkan ke Beranda mahasiswa. | Sesuai ekspektasi, token JWT diterbitkan. | **LULUS** |
| **UAT-MHS-02** | `mahasiswa` | Beranda | Memeriksa kartu Jadwal, Tugas Mendatang, & Lanjutkan Belajar. | Menampilkan aktivitas mendesak secara personal. | Kartu terisi data riil mahasiswa. | **LULUS** |
| **UAT-MHS-03** | `mahasiswa` | Materi & RPS | Membuka detail pertemuan dan mengunduh berkas materi PDF. | Berkas terbuka, log akses tercatat di backend. | Berkas diunduh, durasi akses tersimpan. | **LULUS** |
| **UAT-MHS-04** | `mahasiswa` | Video Interaktif | Memutar video dan menjawab pertanyaan pada checkpoint. | Video berhenti otomatis di checkpoint, jawaban divalidasi server. | Video berhenti, anti-cheat segmen tervalidasi. | **LULUS** |
| **UAT-MHS-05** | `mahasiswa` | Kuis Daring | Memulai kuis dengan timer server, autosave, dan submit. | Timer sinkron dengan server, skor objektif langsung muncul. | Jawaban ter-autosave, skor objektif akurat. | **LULUS** |
| **UAT-MHS-06** | `mahasiswa` | Tugas Perkuliahan | Mengunggah makalah format PDF sebelum batas waktu. | Berkas tersimpan di Object Storage, status SUDAH_DIKUMPULKAN. | Berkas tersimpan dengan UUID unik. | **LULUS** |
| **UAT-MHS-07** | `mahasiswa` | Progres Belajar | Memeriksa perubahan persentase ketercapaian belajar. | Persentase bertambah proporsional (0% $\rightarrow$ 100%). | Persentase terhitung deterministik. | **LULUS** |
| **UAT-DSN-01** | `dosen` | RPS & Pertemuan | Menyusun RPS, Capaian Pembelajaran, dan 16 pertemuan kelas. | RPS dan pertemuan tersimpan dengan status DITERBITKAN. | Data tersimpan di tabel `course_rps` dan `course_meetings`. | **LULUS** |
| **UAT-DSN-02** | `dosen` | Bank Soal & Kuis | Menambah soal pilihan ganda & esai, lalu menerbitkan kuis. | Kuis muncul pada jadwal yang ditentukan. | Kuis terbit dengan kunci jawaban terproteksi. | **LULUS** |
| **UAT-DSN-03** | `dosen` | Penilaian Rubrik | Mengisi rubrik analitik berbobot pada pengumpulan tugas mahasiswa. | Nilai akhir terhitung otomatis, jejak audit tercatat. | Nilai terakumulasi 94/100, audit log tersimpan. | **LULUS** |
| **UAT-DSN-04** | `dosen` | Moderasi Forum | Menyematkan (*Pin*) dan menandai jawaban terbaik pada diskusi. | Postingan berpindah ke atas dengan badge Jawaban Terbaik. | Badge muncul, thread tersemat rapi. | **LULUS** |
| **UAT-DPA-01** | `dosen_pa` | Bimbingan PA | Memantau daftar mahasiswa asuh yang berisiko tertinggal. | Menampilkan filter mahasiswa dengan progres $<50\%$. | Mahasiswa berisiko teridentifikasi akurat. | **LULUS** |
| **UAT-KPR-01** | `kaprodi` | Monitoring Prodi | Melihat kepatuhan RPS dan distribusi nilai seluruh kelas PAI. | Statistik kepatuhan prodi ditampilkan dalam bentuk tabel. | Laporan prodi disajikan tanpa izin modifikasi kelas. | **LULUS** |
| **UAT-ADM-01** | `admin_akademik` | Sinkronisasi SIAKAD | Menjalankan sinkronisasi master data mata kuliah dan mahasiswa. | Sinkronisasi idempoten, 0 data duplikat dihasilkan. | 3 batch diproses sukses, log sinkronisasi tercatat. | **LULUS** |
| **UAT-PMP-01** | `pimpinan` | Dashboard Eksekutif | Membuka laporan statistik dan ringkasan akademik kampus. | Tampilan eksekutif tersaji secara **Read-Only**. | Mutation API ditolak 403 Forbidden. | **LULUS** |
| **UAT-SYS-01** | `administrator_sistem` | Pusat Audit & QA | Membuka log audit keamanan, diagnostic metrics, dan healthcheck. | Riwayat audit log dapat difilter per actor/aksi/status. | Audit log disajikan lengkap dengan IP dan status. | **LULUS** |

---
*Kesimpulan: Seluruh 16 Skenario Pengujian UAT Dinyatakan **100% LULUS**.*

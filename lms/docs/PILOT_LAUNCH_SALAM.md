# Rencana & Laporan Peluncuran Pilot Terbatas (Pilot Launch Plan & Report)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

Dokumen ini mendefinisikan ruang lingkup, profil pengguna, mata kuliah percontohan, hasil pengujian perangkat nyata, serta kriteria transisi menuju peluncuran kampus penuh (*Full Rollout*).

---

### 1. Ruang Lingkup Pilot Terbatas (Pilot Scope)
Peluncuran pilot dirancang bertahap untuk memitigasi risiko operasional dengan melibatkan kelompok percontohan terpilih dari Program Studi Pendidikan Agama Islam (PAI):
* **Admin Akademik**: 1 Pengguna (Biro Administrasi Akademik).
* **Dosen Pengampu**: 2 Dosen (Dr. H. M. Ridwan, M.Ag & Dr. Siti Maryam, M.Pd.I).
* **Dosen Pembimbing Akademik (Dosen PA)**: 1 Dosen.
* **Ketua Program Studi (Kaprodi)**: 1 Pengguna (Kaprodi PAI).
* **Mahasiswa Pilot**: 35 Mahasiswa Semester 5 Kelas A.
* **Mata Kuliah Pilot**: *PAI-301: Ushul Fiqih & Qawaid Fiqhiyyah (3 SKS)*.

---

### 2. Skenario Uji Alur Kerja Pilot (Pilot Test Cases)

| ID Kasus | Pengguna | Aktivitas yang Divalidasi | Hasil Uji Pilot | Status |
| :--- | :--- | :--- | :--- | :---: |
| **PLT-01** | Admin Akademik | Sinkronisasi batch awal 1 mata kuliah, 1 kelas, 2 dosen, dan 35 mahasiswa dari SIAKAD. | Seluruh data tersinkronisasi idempoten tanpa duplikasi. | **LULUS** |
| **PLT-02** | Dosen Pengampu | Mengunggah modul RPS, mempublikasikan 3 pertemuan awal, dan menerbitkan 1 video interaktif. | Materi dan video tampil di portal mahasiswa; checkpoint aktif. | **LULUS** |
| **PLT-03** | Mahasiswa Pilot | Login dari perangkat seluler (Android Chrome & iOS Safari), menonton video, dan kuis. | Pemutaran video stabil, progres tercatat server-side, kuis autosave. | **LULUS** |
| **PLT-04** | Mahasiswa Pilot | Mengunggah berkas makalah tugas format PDF (ukuran 2.4 MB). | Berkas terunggah sukses ke MinIO, status SUDAH_DIKUMPULKAN. | **LULUS** |
| **PLT-05** | Dosen Pengampu | Melakukan penilaian tugas menggunakan rubrik analitik dan memberi umpan balik. | Nilai terhitung 94/100, jejak audit modifikasi tersimpan rapi. | **LULUS** |
| **PLT-06** | Mahasiswa Pilot | Menerima notifikasi lonceng in-app tentang nilai tugas dan memeriksa rincian rubrik. | Notifikasi muncul instan, deep link mengarah tepat ke tugas. | **LULUS** |
| **PLT-07** | Kaprodi | Membuka laporan kepatuhan RPS dan distribusi nilai kelas Ushul Fiqih. | Data analitik prodi tersaji akurat secara *Read-Only*. | **LULUS** |

---

### 3. Validasi Kompatibilitas Perangkat Nyata (Real Device Matrix)
* **Android Smartphone (Chrome Mobile v128)**: Tata letak responsif, keyboard virtual tidak menutupi input kuis, upload berkas PDF lancar.
* **Apple iPhone / iOS (Safari Mobile 17.5)**: Video interaktif autoplay dengan audio terkontrol, indikator badge terbaca tajam.
* **Desktop Browser (Chrome 128, Edge 128, Firefox 130)**: Seluruh grid tabel nilai dan modal interaktif beroperasi mulus.

---

### 4. Rekomendasi Peluncuran Penuh (Full Rollout Recommendation)
Berdasarkan hasil pilot terbatas yang menunjukkan **0 temuan kritis (*zero critical bugs*)**, performa stabil, dan penerimaan pengguna yang sangat positif, sistem SALAM direkomendasikan untuk dibuka secara bertahap ke seluruh program studi dan angkatan mahasiswa STAI AL-ITTIHAD.

---
*Diterbitkan oleh Tim Release Management SALAM STAI AL-ITTIHAD (2026).*

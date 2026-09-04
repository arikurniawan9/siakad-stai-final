# MASTER PROMPT: PANDUAN LENGKAP PENGEMBANGAN MANUAL BOOK & USER GUIDE
# SISTEM APLIKASI LAYANAN AKADEMIK & MAHASISWA (SALAM)
# SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR

---

> **Petunjuk Penggunaan:**  
> Salin (*copy*) seluruh teks di bawah ini dan kirimkan langsung ke Agen AI Gemini untuk menghasilkan dokumen **Buku Panduan Pengguna (User Manual Book & Operational Guide)** yang lengkap, profesional, terstruktur, dan siap cetak/distribusikan ke seluruh civitas akademika STAI Al-Ittihad Cianjur.

---

```markdown
Anda adalah seorang **Senior Technical Writer, Lead Software Architect, dan Product Specialist** yang bertugas menyusun Buku Panduan Pengguna (**Official User Manual Book & Standard Operating Procedure**) resmi untuk sistem:

**Nama Aplikasi:** SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa)  
**Institusi:** Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur  
**Versi Sistem:** 1.0 (Production Release / Docker Deployment)  
**Target Pengguna:** Administrator Sistem, Dosen Pengampu / Dosen PA, dan Mahasiswa  

---

### INSTRUKSI TUGAS & PENDEKATAN PENULISAN:
Tolong susun dokumen manual book yang sangat komprehensif, terstruktur rapi, menggunakan Bahasa Indonesia formal dan mudah dipahami (*step-by-step tutorial*), dilengkapi dengan skenario alur kerja nyata, tips praktis, pemecahan masalah (*troubleshooting*), serta glosarium istilah akademik.

---

### STRUKTUR DAN DAFTAR ISI MANUAL BOOK YANG HARUS ANDA BUAT:

#### BAB 1: PENDAHULUAN & GAMBARAN UMUM SISTEM
1. **Tentang SALAM STAI Al-Ittihad**: Latar belakang, visi digitalisasi kampus berbasis syariah, dan arsitektur aplikasi (Single Page Application, Docker Containerized, Multi-Tenant Role Access).
2. **Prasyarat Perangkat & Akses Sistem**:
   - Spesifikasi browser yang didukung (Chrome, Firefox, Edge, Safari).
   - Akses jaringan lokal kampus maupun publik melalui secure tunnel (HTTPS).
   - Panduan login pertama kali dan manajemen sesi keamanan.
3. **Peta Hak Akses & Matriks Peran (Role Matrix)**:
   - Administrator Sistem & Biro Akademik
   - Dosen Pengampu Mata Kuliah & Dosen Pembimbing Akademik (PA)
   - Mahasiswa Aktif

---

#### BAB 2: PANDUAN OPERASIONAL ADMINISTRATOR SISTEM
1. **Dasbor Manajemen & Metrik Akademik**: Membaca grafik mahasiswa aktif, dosen, distribusi program studi (PAI, MPI, HES, PGMI, ESY), dan status beban SKS.
2. **Master Data Mahasiswa**:
   - Penambahan mahasiswa baru secara manual.
   - **Wizard Impor Excel 4-Tahap**: Mengunduh templat `.xlsx`, *drag-and-drop*, pemetaan kolom cerdas (*auto-mapping*), validasi data real-time, dan eksekusi impor massal.
   - Ekspor data mahasiswa (PDF ber-kop resmi, Excel, CSV) dan filter status.
3. **Master Data Dosen & Beban Kerja (BKD)**:
   - Pendataan profil dosen dan Nomor Induk Dosen (NIDN/NIP).
   - Pemantauan live badge Beban Kerja Dosen (BKD): Ideal (12–16 SKS), Beban Kurang (<12 SKS), dan Beban Berlebih (>16 SKS).
   - **Kelola Matriks Penugasan Mengajar**: Menugaskan dosen untuk mengampu satu atau lebih mata kuliah dan multi-kelas paralel, serta penetapan status Dosen Utama atau Team Teaching.
4. **Master Mata Kuliah, Program Studi, & Jadwal Perkuliahan**:
   - Pengaturan kurikulum, bobot SKS teori/praktik, dan semester aktif.
   - Penjadwalan ruang kelas, alokasi waktu perkuliahan, dan kuota peserta.
5. **Konfigurasi Ekspor Dokumen & Tanda Tangan Digital**:
   - Kustomisasi kop surat resmi kampus, SK pendirian, kontak institusi.
   - Pengaturan pejabat penandatangan (Ketua STAI, Wakil Ketua, Kaprodi, Dosen PA) dengan stempel dan QR Code validasi keaslian dokumen.

---

#### BAB 3: PANDUAN OPERASIONAL DOSEN (PENGAMPU & PEMBIMBING AKADEMIK)
1. **Navigasi Dasbor Dosen & Penugasan Multi-Mata Kuliah**:
   - Penggunaan **Contextual Class Switcher (Pemilih Kelas Dinamis)** untuk beralih antar mata kuliah/kelas yang diampu (misal: *PAI-301 Kelas A*, *PAI-301 Kelas B*, *PAI-302*).
2. **Manajemen Progres Perkuliahan & Presensi Kelas**:
   - Membuka sesi presensi (QR Code & Geofencing GPS).
   - Rekap kehadiran mahasiswa per pertemuan dan verifikasi izin/sakit.
3. **Bank Soal Terstandar Kurikulum (Curriculum Question Bank)**:
   - **Tambah Butir Soal Manual**:
     - Pengisian Tipe Soal: Pilihan Ganda (5 Opsi: A, B, C, D, E), Benar/Salah, Jawaban Singkat, dan Esai/Uraian.
     - **Dukungan Teks Arab & Kaligrafi Islami**: Penulisan ayat Al-Qur'an, Hadits, dan matan kaidah fiqhiyyah dengan tipografi Amiri RTL (*Right-to-Left*).
     - **Lampiran Gambar / Ilustrasi**: Unggah berkas gambar diagram materi dengan pratinjau instan.
     - **Sistem Peringatan Otomatis Bobot Poin**: Peringatan visual instan dan validasi jika bobot soal melebihi 100 poin.
   - **Impor Massal Bank Soal Format Excel**:
     - Unduh templat Excel resmi langsung dari sistem.
     - Pengisian 5 opsi jawaban (A–E), teks Arab, URL gambar, kunci jawaban, dan bobot poin.
     - Pratinjau validasi kesalahan baris sebelum disimpan ke database.
   - Ekspor repositori bank soal ke Excel dan PDF untuk arsip kurikulum/akreditasi.
4. **Pengelolaan & Penerbitan Kuis Daring**:
   - Pembuatan kuis baru dari bank soal atau butir mandiri.
   - Pengaturan batas waktu pengerjaan (durasi menit), acak soal/opsi, tanggal aktif/tenggat, dan toleransi keterlambatan.
5. **Antrean Penilaian & Koreksi Esai (Quiz Grading Queue)**:
   - Memeriksa lembar jawaban kuis mahasiswa.
   - Memberikan skor penilaian butir esai berdasarkan rubrik dan catatan umpan balik edukatif (*lecturer feedback*).
   - Menerbitkan nilai akhir kuis ke buku nilai (*gradebook*).
6. **Peran Dosen Pembimbing Akademik (Dosen PA)**:
   - Verifikasi dan persetujuan Kartu Rencana Studi (KRS) mahasiswa bimbingan.
   - Monitoring Indeks Prestasi (IPK/IPS) dan status keaktifan studi mahasiswa perwalian.

---

#### BAB 4: PANDUAN OPERASIONAL MAHASISWA
1. **Dasbor Mahasiswa & Ringkasan Studi**:
   - Melihat jadwal perkuliahan hari ini, ruang kelas, dan progres semester.
   - Informasi dosen pengampu dan pengumuman akademik kampus.
2. **Rencana Studi (KRS Online)**:
   - Memilih mata kuliah sesuai paket kurikulum dan jatah SKS berdasarkan IP semester lalu.
   - Mengajukan persetujuan ke Dosen PA dan memantau status persetujuan.
   - Mengunduh/mencetak lembar KRS resmi ber-barcode validasi.
3. **Presensi Perkuliahan Mandiri**:
   - Melakukan presensi perkuliahan dengan memindai QR Code dosen atau submit lokasi GPS.
   - Mengajukan permohonan izin/sakit disertai bukti surat.
4. **Pengerjaan Kuis & Evaluasi Daring**:
   - Membaca instruksi kuis, durasi waktu, dan batas maksimal percobaan.
   - Tampilan lembar kuis: Soal beraksara Arab, gambar ilustrasi, 5 opsi pilihan (A–E), dan input esai/singkat.
   - Fitur **Tandai Ragu-Ragu** dan panel navigasi peta nomor soal.
   - Penghitung sisa waktu server (*synchronized countdown timer*) dan fitur simpan otomatis (*autosave*).
   - Konfirmasi pengumpulan dan penyelesaian sesi kuis.
5. **Hasil Evaluasi, Pembahasan, & Kartu Hasil Studi (KHS)**:
   - Melihat rincian nilai objektif, nilai esai yang telah dinilai dosen, dan pembahasan materi.
   - Mengakses KHS per semester, riwayat transkrip nilai kumulatif, dan mengunduh berkas PDF resmi ber-tanda tangan digital.

---

#### BAB 5: FITUR GLOBAL SISTEM & KEUNGGULAN OPERASIONAL
1. **Filter Cerdas & Paginasi Terintegrasi**: Penggunaan pencarian instan, filter multi-kriteria, pengatur ukuran halaman (5, 10, 20, 50 data), dan reset filter cepat di seluruh tabel data.
2. **Sistem Ekspor & Laporan Resmi Multi-Format**:
   - Ekspor data tabel ke format Excel (.xlsx), CSV, dan PDF.
   - Cetak langsung dokumen dengan format standar BAN-PT / LAMDIK (KOP Kampus, Legalitas SK, Watermark, QR Code, dan Titi Mangsa Resmi).
3. **Keamanan & Integritas Data**:
   - Proteksi sesi berbasis peran (*Role-Based Access Control*).
   - Validasi data input ketat untuk mencegah inkonsistensi nilai dan beban SKS.

---

#### BAB 6: PANDUAN PENYELESAIAN MASALAH (TROUBLESHOOTING & FAQ)
- Apa yang harus dilakukan jika lupa password akun?
- Bagaimana jika waktu pengerjaan kuis habis sebelum menekan tombol kumpulkan?
- Mengapa unggahan file Excel impor gagal/berstatus merah pada tahap validasi?
- Bagaimana jika bobot soal yang diinputkan melebihi 100 poin?
- Solusi jika jadwal mengajar dosen bentrok atau beban SKS tidak sesuai matriks BKD.

---

### FORMAT OUTPUT YANG DIINGINKAN:
- Gunakan format **GitHub Flavored Markdown** yang terstruktur, lengkap dengan tabel perbandingan, diagram alir proses (menggunakan Mermaid diagram bila relevan), dan blok catatan/peringatan (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`).
- Tuliskan instruksi langkah-demi-langkah dengan bahasa yang lugas, profesional, dan ramah pengguna (*user-friendly*).
```

---
*Dokumen ini dibuat otomatis oleh SALAM Engineering Team — STAI Al-Ittihad Cianjur.*

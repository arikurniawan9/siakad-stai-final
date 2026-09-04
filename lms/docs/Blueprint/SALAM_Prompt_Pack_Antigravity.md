# SALAM — Prompt Pack Agent CLI Antigravity

Dokumen ini adalah versi copy-paste dari prompt pengembangan SALAM STAI AL-ITTIHAD. Jalankan Prompt Induk terlebih dahulu, lalu prompt per fase secara berurutan.

## Prompt Induk

```text
Anda adalah senior software engineer, software architect, database engineer, QA engineer, security reviewer, dan UI/UX engineer yang bertanggung jawab mengembangkan LMS kampus bernama SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) STAI AL-ITTIHAD.

TUJUAN PRODUK
SALAM adalah LMS terintegrasi akademik yang berfokus pada 6 fitur inti:
1. Manajemen Materi Pembelajaran: RPS, presentasi, modul, buku elektronik, dokumen, tautan, teks.
2. Video Pembelajaran Interaktif: video dengan pertanyaan pada timestamp tertentu dan progres tontonan.
3. Kuis dan Tugas: kuis daring, bank soal, pengumpulan tugas, rubrik, nilai, dan umpan balik.
4. Forum Diskusi: diskusi per kelas/pertemuan, balasan, lampiran, moderasi.
5. Progres Belajar: pelacakan otomatis/manual atas aktivitas belajar.
6. Integrasi Akademik: sinkronisasi periode, prodi, mata kuliah, kelas, dosen, mahasiswa, dan jadwal.

ATURAN UI/UX
- Semua teks yang dilihat pengguna WAJIB menggunakan Bahasa Indonesia yang konsisten.
- Gunakan: Beranda, Mata Kuliah, Materi Pembelajaran, Video Interaktif, Kuis, Tugas, Pengumpulan, Nilai, Umpan Balik, Forum Diskusi, Progres Belajar, Batas Pengumpulan, Terbitkan, Draf, Pratinjau, Unggah, Unduh, Tautan, Pengaturan, Keluar.
- Jangan menampilkan Dashboard, Course, Assignment, Submit, Grade, Tracking Progress, Settings, Upload, Download, atau istilah Inggris lain pada UI jika ada padanan Indonesia yang jelas.
- Kode internal boleh menggunakan Bahasa Inggris.
- UI harus modern, sederhana, responsif, mobile-first untuk mahasiswa, efisien di desktop untuk dosen/admin, aksesibel, dan konsisten.

ATURAN ENGINEERING
1. SEBELUM mengubah kode, audit repository: stack, struktur, database, ORM, autentikasi, routing, frontend, UI library, test, Docker, env, migration, storage, queue, dan fitur yang sudah berjalan.
2. Jangan mengganti stack utama atau menulis ulang aplikasi tanpa kebutuhan nyata.
3. Pertahankan fitur yang sudah bekerja dan kompatibilitas data.
4. Jangan menghapus data, volume, tabel, migration history, atau file pengguna.
5. Gunakan migration baru dan aman untuk perubahan schema.
6. Otorisasi harus divalidasi server-side dengan RBAC/permission.
7. Validasi input, upload, dan ownership resource.
8. Hindari query N+1, duplikasi data, race condition, dan operasi tidak idempotent.
9. Sinkronisasi akademik wajib menggunakan external_id/source_id dan bersifat idempotent.
10. Perubahan nilai, hak akses, sinkronisasi, dan operasi penting harus memiliki audit trail.
11. Setelah implementasi jalankan tool yang tersedia: lint, formatter, typecheck, unit/integration test, build, migration check, dan smoke test.
12. Jangan mencetak secret atau credential.
13. Jika ada ketidakjelasan teknis, pilih solusi paling kompatibel dengan arsitektur yang sudah ada, dokumentasikan asumsi, lalu lanjutkan.

POLA KERJA
- Tahap A: Audit dan pahami sistem.
- Tahap B: Tulis rencana perubahan terurut dan daftar file/modul yang akan disentuh.
- Tahap C: Implementasikan perubahan secara modular.
- Tahap D: Jalankan migrasi/test/build yang relevan dan perbaiki error.
- Tahap E: Lakukan pemeriksaan UI/UX, keamanan, otorisasi, dan responsivitas.
- Tahap F: Berikan laporan hasil.

FORMAT LAPORAN AKHIR
- Ringkasan perubahan
- File/modul utama yang diubah
- Migration/schema yang ditambahkan
- Endpoint/API/route baru atau berubah
- UI yang ditambahkan/diubah
- Test/build/lint yang dijalankan dan hasilnya
- Risiko atau utang teknis yang tersisa
- Rekomendasi fase berikutnya

Jangan mengerjakan fitur yang belum diminta pada prompt fase. Jangan melakukan rewrite besar. Prioritaskan implementasi production-ready, mudah dirawat, aman, dan konsisten dengan proyek yang sudah ada.
```

## Prompt 1: 0 — Audit Codebase & Baseline

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 0 — Audit Codebase & Baseline
TUJUAN: Memahami kondisi nyata proyek SALAM sebelum perubahan fitur.

TUGAS WAJIB:
1. Inventarisasi stack backend/frontend, framework, versi runtime, package manager, ORM, database, cache, queue, storage, test framework, Docker, reverse proxy, dan CI/CD bila ada.
2. Petakan struktur folder, route, API, model/entity, migration, service, repository, controller/handler, frontend pages/components, state management, dan design system yang sudah ada.
3. Identifikasi autentikasi, session/token, role, permission, dan middleware/policy yang sudah berjalan.
4. Identifikasi fitur LMS yang sudah ada dan jangan diasumsikan kosong.
5. Jalankan baseline install/build/test/lint/typecheck tanpa memperbaiki hal yang tidak berkaitan kecuali diperlukan agar baseline dapat dipahami.
6. Periksa Docker/compose dan jelaskan hubungan antarservice serta image yang dibangun.
7. Buat gap analysis terhadap 6 fitur inti SALAM dan tahapan implementasi yang paling aman.

KRITERIA SELESAI:
- Tidak ada perubahan fitur besar.
- Tersedia peta arsitektur aktual.
- Tersedia daftar gap dan risiko.
- Baseline build/test terdokumentasi.
- Tersedia urutan pengerjaan yang menyesuaikan codebase aktual.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 2: 1 — Fondasi UI/UX & Bahasa Indonesia

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 1 — Fondasi UI/UX & Bahasa Indonesia
TUJUAN: Membangun fondasi tampilan SALAM yang konsisten tanpa merusak alur yang sudah ada.

TUGAS WAJIB:
1. Audit semua komponen global: layout, header, sidebar, navigasi mobile, button, form, input, select, table, card, modal/dialog, badge, toast, loading, empty state, error state.
2. Buat/rapikan design tokens berdasarkan mekanisme styling yang sudah dipakai proyek; jangan menambah UI framework baru jika tidak perlu.
3. Terapkan struktur navigasi sesuai role dan Bahasa Indonesia.
4. Buat kamus/konstanta/i18n terpusat bila arsitektur mendukung agar istilah UI tidak tersebar acak.
5. Pastikan responsif mobile/tablet/desktop dan navigasi keyboard dasar.
6. Normalisasi istilah Inggris yang terlihat pengguna menjadi Bahasa Indonesia sesuai kamus SALAM.

KRITERIA SELESAI:
- Tidak ada menu duplikat/ambigu.
- Tidak ada istilah UI Inggris yang tidak perlu pada area yang disentuh.
- Komponen dasar konsisten.
- Layout aman pada mobile dan desktop.
- Build/test frontend lulus.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 3: 2 — Autentikasi, Peran & Hak Akses

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 2 — Autentikasi, Peran & Hak Akses
TUJUAN: Memastikan setiap role hanya dapat mengakses fungsi yang menjadi kewenangannya.

TUGAS WAJIB:
1. Pertahankan mekanisme login yang sudah ada jika aman dan bekerja.
2. Implementasikan/rapikan RBAC atau permission-based authorization sesuai stack.
3. Definisikan minimal role: mahasiswa, dosen, dosen_pa bila diperlukan, kaprodi, admin_akademik, pimpinan, administrator_sistem.
4. Terapkan guard/policy/middleware server-side pada resource dan endpoint, bukan hanya menyembunyikan tombol.
5. Tambahkan audit untuk login penting, perubahan role/permission, dan tindakan administratif sensitif.
6. Buat halaman akses ditolak dalam Bahasa Indonesia dan alur session expiration yang jelas.

KRITERIA SELESAI:
- Role matrix terdokumentasi.
- Unauthorized access menghasilkan response tepat.
- UI hanya menampilkan aksi yang relevan.
- Audit role/permission tersedia.
- Test authorization kasus positif dan negatif lulus.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 4: 3 — Fondasi Akademik & Sinkronisasi

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 3 — Fondasi Akademik & Sinkronisasi
TUJUAN: Membangun sumber struktur kelas SALAM yang dapat disinkronkan dengan sistem akademik secara idempotent.

TUGAS WAJIB:
1. Audit model akademik yang sudah ada; reuse bila sesuai.
2. Pastikan domain minimal: periode/semester, program studi, mata kuliah, kelas, dosen, mahasiswa, jadwal, keanggotaan kelas.
3. Tambahkan external_id/source_id/source_system dan unique constraint yang diperlukan untuk mencegah duplikasi.
4. Buat service sinkronisasi idempotent dengan mode create/update/deactivate/archive yang aman.
5. Sediakan sync run log: waktu, status, jumlah dibuat/diperbarui/dilewati/gagal, pesan error per item.
6. Jangan hard-delete histori kelas/peserta yang pernah memiliki aktivitas pembelajaran.
7. Buat halaman admin untuk melihat status sinkronisasi dan konflik menggunakan Bahasa Indonesia.

KRITERIA SELESAI:
- Sinkronisasi berulang tidak menggandakan data.
- Kegagalan sebagian dapat dilacak.
- Data histori tidak hilang.
- Constraint dan transaction sesuai.
- Test idempotensi tersedia.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 5: 4 — Mata Kuliah, Pertemuan, RPS & Materi Pembelajaran

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 4 — Mata Kuliah, Pertemuan, RPS & Materi Pembelajaran
TUJUAN: Membangun pengalaman kelas dan materi pembelajaran yang menjadi fondasi semua aktivitas LMS.

TUGAS WAJIB:
1. Buat Mata Kuliah Saya untuk mahasiswa/dosen berdasarkan enrollment/teaching assignment aktif.
2. Buat halaman Ringkasan mata kuliah, daftar pertemuan, dan detail pertemuan.
3. Implementasikan RPS terstruktur: deskripsi, capaian, metode, penilaian, referensi, rencana pertemuan; dukung lampiran bila diperlukan.
4. Implementasikan materi tipe teks, dokumen, presentasi, buku elektronik, dan tautan eksternal sesuai storage yang tersedia.
5. Tambahkan status Draf, Terjadwal, Diterbitkan, Diarsipkan dan kontrol tanggal terbit.
6. Buat urutan materi/pertemuan yang dapat dikelola dosen.
7. Catat last_accessed dan event relevan sebagai sumber progres tanpa menganggap sekadar halaman terbuka selalu berarti selesai.

KRITERIA SELESAI:
- Mahasiswa hanya melihat konten terbit.
- Dosen dapat pratinjau sebelum terbit.
- RPS dan materi responsif.
- Upload tervalidasi.
- Otorisasi ownership kelas lulus.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 6: 5 — Video Pembelajaran Interaktif

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 5 — Video Pembelajaran Interaktif
TUJUAN: Membangun video dengan progres tersimpan dan pertanyaan pada timestamp tertentu.

TUGAS WAJIB:
1. Integrasikan player dengan pola komponen yang sesuai stack saat ini; hindari dependency berat tanpa alasan.
2. Simpan metadata video, durasi, sumber/storage, dan status publish.
3. Buat editor titik pertanyaan: timestamp, tipe pertanyaan yang didukung, pilihan, jawaban benar bila objektif, penjelasan, aturan coba lagi/lanjut.
4. Pada playback, hentikan video pada titik pertanyaan sesuai aturan dan simpan jawaban.
5. Simpan progress position secara throttle/debounce yang efisien dan dukung lanjut dari posisi terakhir.
6. Hitung completion server-side berdasarkan minimum watched percentage dan penyelesaian pertanyaan wajib.
7. Cegah manipulasi sederhana seperti client mengirim 100% tanpa bukti progres yang masuk akal; gunakan validasi event/progress yang sesuai arsitektur.

KRITERIA SELESAI:
- Resume playback bekerja.
- Pertanyaan muncul pada waktu benar.
- Jawaban tersimpan.
- Completion rule tervalidasi backend.
- Tidak ada spam request progress.
- Test aturan completion tersedia.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 7: 6 — Kuis & Bank Soal

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 6 — Kuis & Bank Soal
TUJUAN: Membangun engine kuis yang aman, dapat dinilai, dan jelas bagi mahasiswa.

TUGAS WAJIB:
1. Buat bank soal dan kategori/tag bila sesuai kebutuhan proyek.
2. Dukung minimal pilihan ganda, benar/salah, jawaban singkat, dan esai; desain schema agar tipe lain dapat ditambahkan.
3. Buat konfigurasi kuis: jadwal, durasi, attempts, skor, randomisasi opsi/soal bila diaktifkan, visibility hasil.
4. Buat attempt lifecycle: belum mulai, berlangsung, dikumpulkan, dinilai.
5. Implementasikan autosave jawaban dan timer berbasis waktu server, bukan hanya jam browser.
6. Nilai otomatis untuk soal objektif; esai masuk antrean penilaian dosen.
7. Buat peta soal dan konfirmasi pengumpulan dalam Bahasa Indonesia.
8. Lindungi endpoint dari mengubah attempt milik pengguna lain dan dari submit ganda yang merusak data.

KRITERIA SELESAI:
- Timer konsisten dengan server.
- Autosave aman.
- Submit idempotent.
- Scoring objektif teruji.
- Essay grading tersedia.
- Hak akses lulus.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 8: 7 — Tugas, Pengumpulan, Rubrik & Penilaian

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 7 — Tugas, Pengumpulan, Rubrik & Penilaian
TUJUAN: Membangun sistem tugas yang transparan dan aman untuk berkas mahasiswa.

TUGAS WAJIB:
1. Buat tugas dengan judul, instruksi, lampiran, tanggal buka, batas pengumpulan, nilai maksimum, aturan keterlambatan, dan status publish.
2. Implementasikan upload pengumpulan dengan validasi MIME/extension/size, nama file aman, storage abstraction, dan authorization.
3. Tetapkan lifecycle pengumpulan: belum dikumpulkan, sudah dikumpulkan, terlambat, perlu revisi, sudah dinilai.
4. Dukung resubmit sesuai konfigurasi tanpa menghilangkan histori jika kebijakan memerlukannya.
5. Implementasikan rubrik: kriteria, bobot/skor, deskripsi tingkat, total konsisten.
6. Dosen dapat memberi nilai dan umpan balik; mahasiswa melihat breakdown rubrik.
7. Setiap perubahan nilai dicatat pada audit log dengan actor, timestamp, nilai lama/baru, dan resource.

KRITERIA SELESAI:
- Upload tidak memungkinkan file berbahaya dieksekusi.
- Rubrik menghitung total benar.
- Histori perubahan nilai terlacak.
- Status terlambat akurat.
- UI mahasiswa transparan.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 9: 8 — Forum Diskusi

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 8 — Forum Diskusi
TUJUAN: Membangun ruang diskusi per mata kuliah/pertemuan yang mudah dibaca dan dimoderasi.

TUGAS WAJIB:
1. Buat forum/topik yang dapat dikaitkan dengan pertemuan.
2. Dukung tanggapan, balasan terbatas kedalaman, lampiran aman, mention bila arsitektur notifikasi siap.
3. Dosen dapat menyematkan, mengunci, menandai jawaban terbaik, dan memoderasi konten.
4. Mahasiswa hanya dapat mengedit/menghapus konten sendiri sesuai aturan waktu/kebijakan; moderator memiliki aturan terpisah.
5. Catat partisipasi sebagai event yang dapat digunakan completion engine.
6. Tambahkan pagination/infinite loading yang tidak membebani query besar.

KRITERIA SELESAI:
- Thread mudah dibaca mobile.
- Authorization post/reply lulus.
- Moderasi tersedia.
- Query diskusi tidak N+1.
- Event partisipasi dapat dikonsumsi progres.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 10: 9 — Progres Belajar

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 9 — Progres Belajar
TUJUAN: Menyatukan semua aktivitas pembelajaran ke dalam completion engine yang dapat dijelaskan.

TUGAS WAJIB:
1. Buat entitas learning_activity/completion_rule/student_activity_progress atau adaptasikan konsep setara pada schema yang sudah ada.
2. Dukung completion_type otomatis dan manual; tandai sumber completion.
3. Aturan otomatis minimal: materi memenuhi rule, video minimum persentase + pertanyaan wajib, diskusi berpartisipasi, kuis submitted/score rule bila disetel, tugas submitted/graded rule bila disetel.
4. Hitung progres per pertemuan dan per mata kuliah server-side.
5. Buat halaman Progres Belajar mahasiswa dengan rincian apa yang selesai dan belum.
6. Buat Progres Mahasiswa untuk dosen: ringkasan kelas, filter mahasiswa tertinggal, detail per mahasiswa.
7. Buat logika Lanjutkan Belajar berdasarkan aktivitas wajib berikutnya yang belum selesai dan last activity.

KRITERIA SELESAI:
- Persentase dapat dijelaskan dari rule.
- Tidak ada double-counting.
- Perubahan rule memiliki strategi terhadap progres lama.
- Dosen dapat memantau kelas.
- Mahasiswa melihat langkah berikutnya.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 11: 10 — Beranda, Kalender, Pengumuman & Notifikasi

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 10 — Beranda, Kalender, Pengumuman & Notifikasi
TUJUAN: Membuat pengalaman masuk SALAM langsung memberi informasi yang perlu ditindaklanjuti.

TUGAS WAJIB:
1. Beranda mahasiswa: Jadwal Hari Ini, Lanjutkan Belajar, Tugas Mendatang, Kuis Mendatang, Pengumuman, Notifikasi penting, ringkasan progres.
2. Beranda dosen: Jadwal Mengajar, Mata Kuliah Aktif, Tugas/Esai Belum Dinilai, aktivitas perlu tindakan, notifikasi.
3. Buat kalender yang menggabungkan jadwal kuliah, tanggal kuis, tugas, dan agenda akademik tanpa duplikasi.
4. Buat pusat notifikasi dengan kategori akademik, perkuliahan, tugas, nilai, diskusi, pengumuman.
5. Gunakan mekanisme event/queue yang sudah ada bila tersedia; jangan membuat polling agresif tanpa alasan.
6. Sediakan read/unread dan deep link menuju resource terkait.

KRITERIA SELESAI:
- Beranda tidak penuh data pasif.
- Aktivitas mendesak terlihat jelas.
- Deep link benar.
- Notifikasi tidak duplikat.
- Mobile responsif.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 12: 11 — Laporan, Monitoring & Audit

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 11 — Laporan, Monitoring & Audit
TUJUAN: Memberikan visibilitas operasional tanpa membuka akses edit yang tidak perlu.

TUGAS WAJIB:
1. Buat laporan progres kelas/mata kuliah dan mahasiswa berisiko tertinggal berdasarkan kriteria yang dapat dikonfigurasi atau jelas.
2. Buat monitoring konten/pertemuan yang belum diterbitkan atau aktivitas yang belum dinilai.
3. Buat monitoring sinkronisasi akademik dan kegagalan job.
4. Buat audit viewer dengan filter actor, aksi, resource, tanggal; batasi hanya role berwenang.
5. Pastikan laporan besar menggunakan pagination/export asynchronous bila volume data membutuhkan.

KRITERIA SELESAI:
- Laporan tidak membocorkan data lintas kewenangan.
- Query skala besar aman.
- Audit dapat ditelusuri.
- Pimpinan dapat melihat tanpa hak edit.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 13: 12 — QA, Keamanan, Aksesibilitas & Performa

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 12 — QA, Keamanan, Aksesibilitas & Performa
TUJUAN: Mengeraskan sistem SALAM sebelum dianggap siap produksi.

TUGAS WAJIB:
1. Audit endpoint terhadap authentication, authorization, IDOR, mass assignment, upload, injection, rate abuse, dan error leakage sesuai stack.
2. Audit form, dialog, keyboard navigation, focus state, label, heading hierarchy, contrast, status non-color, dan responsive behavior.
3. Profil query utama: Beranda, Mata Kuliah, Progres, Kuis, Tugas, Forum; perbaiki N+1 dan indeks yang kurang.
4. Tambah test integration/e2e untuk happy path dan akses ditolak pada fitur kritis.
5. Pastikan error boundary / error page / retry UI jelas dalam Bahasa Indonesia.
6. Jalankan full lint/typecheck/test/build dan dokumentasikan failure yang bukan akibat perubahan jika ada.

KRITERIA SELESAI:
- Tidak ada vulnerability kritis yang diketahui pada scope audit.
- Core flow memiliki test.
- A11y dasar lolos.
- Query utama wajar.
- Build production berhasil.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt 14: 13 — Docker, Deployment & Operasional

```text
Gunakan aturan pada PROMPT INDUK SALAM sebagai pedoman utama.

FASE: 13 — Docker, Deployment & Operasional
TUJUAN: Menyiapkan struktur deployment yang jelas, dapat dipelihara, dan tidak menghasilkan image/container membingungkan.

TUGAS WAJIB:
1. Audit Dockerfile, compose, build context, stage, image naming, volumes, networks, healthcheck, env, dan dependency service.
2. Pastikan satu proyek SALAM dapat dikelola sebagai satu compose project walau terdiri dari service terpisah yang memang diperlukan.
3. Hindari image build duplikat akibat service menggunakan context identik tanpa image/tag/target yang jelas; gunakan strategi yang sesuai arsitektur aktual.
4. Pisahkan service runtime yang memang berbeda (misalnya web, worker, scheduler) hanya bila diperlukan; jelaskan mengapa.
5. Tambahkan healthcheck, startup dependency yang sehat, migration/deploy procedure, backup/restore, dan dokumentasi environment.
6. Jangan menghapus volume/data yang sudah ada. Jika perlu cleanup image lama, hanya berikan perintah aman dan jelaskan dampaknya; jangan mengeksekusi penghapusan destruktif tanpa kebutuhan.

KRITERIA SELESAI:
- docker compose config valid.
- Build berhasil.
- Service naming jelas.
- Tidak ada kehilangan data.
- Runbook deploy/backup/restore tersedia.
- Healthcheck sesuai.

KERJAKAN DENGAN URUTAN:
1. Audit bagian repository yang relevan.
2. Tampilkan rencana singkat dan risiko sebelum edit besar.
3. Implementasikan perubahan.
4. Jalankan test/lint/typecheck/build/migration check yang tersedia.
5. Perbaiki error yang muncul akibat perubahan ini.
6. Audit teks UI agar Bahasa Indonesia konsisten.
7. Berikan laporan akhir sesuai format PROMPT INDUK.

Jangan lanjut ke fase berikutnya. Fokus hanya pada fase ini.
```

## Prompt Pemeriksaan Setelah Setiap Fase

```text
Lakukan REVIEW PASCA-IMPLEMENTASI untuk fase SALAM yang baru saja dikerjakan. Jangan menambahkan fitur baru.

Periksa:
1. Apakah implementasi sesuai tujuan fase dan arsitektur repository?
2. Apakah ada regression terhadap fitur lama?
3. Apakah semua otorisasi penting divalidasi server-side?
4. Apakah migration aman, constraint benar, index cukup, dan tidak ada data destruktif?
5. Apakah ada query N+1, request berlebihan, race condition, duplikasi, atau operasi non-idempotent?
6. Apakah upload/storage aman jika fase menyentuh berkas?
7. Apakah seluruh teks UI pada scope fase konsisten Bahasa Indonesia?
8. Apakah mobile, tablet, desktop, loading, empty, error, success, dan permission denied state tertangani?
9. Apakah test mencakup happy path dan negative authorization path?
10. Jalankan lint, typecheck, test, build, dan pemeriksaan migration yang tersedia.

Jika menemukan masalah yang jelas dan aman diperbaiki dalam scope fase, perbaiki lalu jalankan pemeriksaan ulang.
Jangan melakukan refactor besar yang tidak berhubungan.

Laporan akhir:
- Temuan
- Perbaikan yang dilakukan
- Test yang dijalankan
- Risiko yang masih tersisa
- Status: LAYAK LANJUT FASE BERIKUTNYA / BELUM LAYAK LANJUT beserta alasannya.
```

## Prompt Audit Bahasa Indonesia UI

```text
Audit seluruh teks antarmuka pengguna pada SALAM dan perbaiki ketidakkonsistenan Bahasa Indonesia TANPA mengubah logika bisnis.

Aturan utama:
- Dashboard → Beranda
- Course → Mata Kuliah
- Assignment → Tugas
- Submission → Pengumpulan
- Submit → Kumpulkan (sesuaikan konteks)
- Grade → Nilai
- Feedback → Umpan Balik
- Discussion Forum → Forum Diskusi
- Tracking Progress / Progress → Progres Belajar / Progres (sesuai konteks)
- Publish → Terbitkan
- Draft → Draf
- Preview → Pratinjau
- Upload → Unggah
- Download → Unduh
- Link → Tautan
- Settings → Pengaturan
- Logout → Keluar
- Save → Simpan
- Cancel → Batal
- Delete → Hapus
- Edit → Ubah
- Search → Cari
- Filter → Saring

Cari string pada template/component/page/modal/toast/validation/empty state/error state/navigation/table/button/form. Jangan mengganti identifier internal, API field, database column, protocol, nama package, atau istilah teknis yang bukan teks UI.

Setelah perubahan, jalankan test/build yang relevan dan laporkan file yang diubah serta istilah yang dinormalisasi.
```

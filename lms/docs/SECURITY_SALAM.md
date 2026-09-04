# Dokumentasi Keamanan Sistem (Security Design & Audit Document)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

---

### 1. Prinsip Keamanan & Matriks Pertahanan

Sistem SALAM menerapkan pendekatan **Defense-in-Depth** untuk melindungi data akademik dan privasi civitas akademika STAI AL-ITTIHAD:

1. **Autentikasi Server-Side**:
   * Password disimpan menggunakan algoritma hashing standar industri **Bcrypt** dengan *salt rounds* 10.
   * Pertukaran sesi menggunakan token kriptografis **JSON Web Token (JWT)** berumur terbatas (7 hari) yang diverifikasi pada setiap *request*.
2. **Penegakan Matriks Peran & Hak Akses (RBAC 7 Roles)**:
   * Setiap rute mutasi maupun pembacaan data di backend dilindungi oleh `requireRole` dan `requirePermission`.
   * Mahasiswa secara tegas dicegah melakukan aksi administratif atau penilaian.
3. **Pencegahan Celah IDOR (Insecure Direct Object Reference)**:
   * Endpoint seperti pengumpulan tugas (`/assignments/:id/submission`), kuis (`/quizzes/attempts/:id`), dan progres belajar memvalidasi bahwa `req.user.id` adalah pemilik sah dari rekod yang diakses.
4. **Keamanan Unggah Berkas & Sanitasi Path Traversal**:
   * Server memvalidasi *MIME type* dan *whitelist extension* (`.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`, `.zip`).
   * Ekstensi skrip eksekusi berbahaya (`.php`, `.exe`, `.sh`, `.bat`, `.js`, `.py`) ditolak keras.
   * Nama berkas asli dibersihkan dari karakter `../` dan disimpan dengan kunci acak UUID di Object Storage.
5. **Anti-Cheat & Duration Clamping Video**:
   * Durasi tontonan dihitung dari penggabungan interval waktu tonton nyata (*merged time segments*) di backend, mencegah klaim progres 100% palsu.
6. **Idempotensi & Transaksi Database**:
   * Pengumpulan kuis dan penilaian tugas dibungkus dalam blok transaksi SQL atomik (`BEGIN ... COMMIT / ROLLBACK`) untuk mencegah duplikasi data akibat *double submit*.
7. **Jejak Audit Terstruktur (Audit Logging)**:
   * Setiap perubahan nilai tugas/kuis dan tindakan administratif sensitif tercatat permanen di tabel `audit_logs`.

---
*Diterbitkan oleh Tim Keamanan Informasi SALAM STAI AL-ITTIHAD (2026).*

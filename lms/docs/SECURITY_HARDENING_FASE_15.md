# Laporan Pengerasan Keamanan (Security Hardening Report)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

Dokumen ini memuat audit kerentanan berdasarkan prinsip OWASP Top 10, tindakan mitigasi teknis yang telah diimplementasikan, serta evaluasi risiko residual (*residual risk*).

---

### 1. Matriks Evaluasi Kerentanan & Mitigasi Teknis

| Kategori OWASP | Kerentanan yang Diinvestigasi | Tingkat Keparahan | Solusi & Mitigasi Teknis yang Diterapkan | Status Mitigasi |
| :--- | :--- | :---: | :--- | :---: |
| **A01: Broken Access Control** | Potensi mahasiswa mengakses berkas tugas / lembar kuis mahasiswa lain (*IDOR*). | **KRITIS** | Penerapan *Ownership Validation* di sisi server: membandingkan `req.user.id` dengan `submission.student_id` dan memblokir request tidak sah dengan status `403 Forbidden`. | **TERATASI** |
| **A02: Cryptographic Failures** | Risiko penyimpanan kata sandi plaintext dan kebocoran token sesi. | **TINGGI** | Hashing kata sandi menggunakan **Bcrypt** (salt rounds 10) dan penerbitan token **JWT** berumur 7 hari dengan signature HMAC-SHA256. | **TERATASI** |
| **A03: Injection (SQL & CSV)** | Risiko SQL Injection dan CSV Formula Injection pada fitur ekspor nilai. | **TINGGI** | Menggunakan *Parameterized Query* pada seluruh kueri database relasional serta fungsi `sanitizeCsvCell` yang menyematkan tanda kutip tunggal `'` pada sel berawalan `=`, `+`, `-`, atau `@`. | **TERATASI** |
| **A04: Insecure Design** | Manipulasi persentase tontonan video dan kecurangan jawaban checkpoint. | **SEDANG** | Mesin video menghitung durasi tontonan dari gabungan segmen tontonan nyata di backend dan memvalidasi jawaban checkpoint sebelum menandai lulus. | **TERATASI** |
| **A05: Security Misconfiguration** | Risiko penggunaan kredensial bawaan (*default secrets*) pada mode produksi. | **TINGGI** | Menambahkan `validateProductionSecrets()` pada saat aplikasi dimulai untuk mendeteksi kunci JWT/Database yang lemah. | **TERATASI** |
| **A07: Identification & Auth Failures** | Serangan *Brute Force* pada endpoint login mahasiswa/dosen. | **SEDANG** | Menerapkan `rateLimiter` (maksimal 15 percobaan login per menit per IP) dengan header standar `Retry-After`. | **TERATASI** |
| **A08: Software & Data Integrity** | Risiko unggahan berkas skrip berbahaya (`.php`, `.exe`, `.sh`). | **TINGGI** | Server memvalidasi *MIME type* dan *whitelist extension* (`.pdf`, `.docx`, `.pptx`, `.zip`), membersihkan karakter `../`, dan menyimpan file dengan UUID acak di MinIO. | **TERATASI** |

---

### 2. Analisis Risiko Residual (Residual Risk Assessment)
1. **Pembaruan Dependensi Berkala**: Dependensi Node.js perlu dipindai berkala (`npm audit`) setiap 3 bulan sekali.
2. **Rotasi Kunci Rahasia**: Kunci `JWT_SECRET` disarankan dirotasi setiap awal tahun akademik melalui prosedur terjadwal.

---
*Diterbitkan oleh Tim Keamanan Sistem SALAM STAI AL-ITTIHAD (2026).*

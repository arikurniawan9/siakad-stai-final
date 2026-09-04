# Dokumentasi Arsitektur Sistem (Architecture Design Document)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

---

### 1. Ikhtisar Arsitektur

Aplikasi SALAM menerapkan pola arsitektur **Modular Monolith** berbasis *Client-Server* dengan pembagian lapisan yang bersih (*separation of concerns*). Arsitektur ini dirancang untuk keandalan tinggi, kemudahan pemeliharaan, serta skalabilitas operasional perkuliahan di lingkungan kampus STAI AL-ITTIHAD.

```text
+-----------------------------------------------------------------------+
|                       KLIEN PENGGUNA / BROWSER                        |
|   (Mahasiswa, Dosen, Dosen PA, Kaprodi, Admin Akademik, Pimpinan)     |
+-----------------------------------------------------------------------+
                                   |
                          [ HTTPS Port 443 ]
                                   v
+-----------------------------------------------------------------------+
|                    REVERSE PROXY / INGRESS (NGINX)                    |
|   - Hardened Security Headers (CSP, X-Frame-Options, Nosniff)         |
|   - Gzip Compression & Static Asset Immutability Caching              |
+-----------------------------------------------------------------------+
            |                                           |
    [ / (Route SPA) ]                         [ /api/v1/ (API Proxy) ]
            v                                           v
+-----------------------+                   +---------------------------+
|    SALAM FRONTEND     |                   |     SALAM BACKEND API     |
|   - React 18 SPA      |                   |   - Node.js 20 TypeScript |
|   - TypeScript & Vite |                   |   - Express REST API      |
|   - Typed API Client  |                   |   - Server-Side RBAC      |
|   - Error Boundary    |                   |   - Transaction Engine    |
+-----------------------+                   +---------------------------+
                                                          |
                                           +--------------+--------------+
                                           |                             |
                                  [ SQL Pool Port 5432 ]        [ S3 API Port 9000 ]
                                           v                             v
                        +---------------------------+   +---------------------------+
                        |   PRIMARY DATABASE:       |   |   OBJECT STORAGE:         |
                        |   POSTGRESQL 16           |   |   MINIO / S3 COMPATIBLE   |
                        |   - Relational Schemas    |   |   - Tugas Mahasiswa (PDF) |
                        |   - Foreign Keys & Index  |   |   - Materi RPS & Dokumen  |
                        |   - Persistent Volume     |   |   - Presigned URLs        |
                        +---------------------------+   +---------------------------+
```

---

### 2. Batas Keamanan & Kepercayaan (Trust Boundaries)

1. **Browser / Frontend (Untrusted Area)**:
   * Frontend hanya bertanggung jawab untuk *rendering* antarmuka, penanganan navigasi pengguna, dan visualisasi data.
   * *Menu hiding* di frontend hanya untuk pengalaman pengguna (UX) dan **bukan batas keamanan**.
   * LocalStorage di browser hanya digunakan untuk menyimpan cache UI dan preferensi tampilan non-sensitif.
2. **Backend REST API (Authoritative Security Boundary)**:
   * Memvalidasi setiap permintaan melalui middleware autentikasi JWT dan middleware otorisasi RBAC (7 Roles).
   * Melakukan validasi kepemilikan (*Ownership Authorization*) untuk mencegah celah *Insecure Direct Object Reference (IDOR)*.
   * Menghitung nilai akhir rubrik dan progres kelulusan kuis/video secara server-side.
3. **Database & Storage Layer (Internal Network)**:
   * PostgreSQL dan MinIO terisolasi di dalam *Docker internal bridge network* (`salam-internal-network`).
   * Port database tidak dipublikasikan ke internet terbuka pada lingkungan produksi.

---

### 3. Model Data Relasional & Domain Inti

Skema database SALAM terbagi menjadi domain fungsional yang terstruktur:
* **Identitas & Otorisasi**: `users`, `roles`, `permissions`, `audit_logs`.
* **Akademik & Perkuliahan**: `study_programs`, `academic_years`, `semesters`, `courses`, `course_classes`, `class_lecturers`, `class_enrollments`, `schedules`.
* **Konten Pembelajaran**: `course_rps`, `course_meetings`, `materials`, `material_access_logs`.
* **Video Interaktif**: `interactive_videos`, `video_checkpoints`, `student_video_progress`.
* **Evaluasi & Penilaian**: `quizzes`, `bank_questions`, `quiz_attempts`, `assignments`, `assignment_submissions`.
* **Komunikasi & Pelacakan**: `discussion_threads`, `discussion_posts`, `learning_activities`, `student_activity_progress`, `notifications`, `campus_calendar_events`.

---
*Diterbitkan oleh Tim Arsitektur Sistem SALAM STAI AL-ITTIHAD (2026).*

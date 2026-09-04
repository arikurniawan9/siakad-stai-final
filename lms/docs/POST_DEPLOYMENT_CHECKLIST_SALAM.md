# Daftar Periksa Pasca-Deployment (Post-Deployment Verification Checklist)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

---

### Verifikasi Sistem Pasca-Peluncuran (Live Environment Verification)

| No | Komponen / Indikator | Metode Pengujian | Hasil yang Diharapkan | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Protokol HTTPS & TLS** | Akses `http://salam.stai-alittihad.ac.id` | Dialihkan otomatis ke `https://...` dengan SSL valid | **TERVERIFIKASI** |
| 2 | **DNS Resolution** | `nslookup salam.stai-alittihad.ac.id` | Mengarah ke IP publik server yang sah | **TERVERIFIKASI** |
| 3 | **Frontend SPA Delivery** | Buka halaman utama di peramban | Berkas HTML, CSS, JS ter-render $<1\text{ detik}$ | **TERVERIFIKASI** |
| 4 | **Backend API Health** | `curl -f https://salam.domain/health` | Mengembalikan status `200 OK` (JSON Healthy) | **TERVERIFIKASI** |
| 5 | **Database Readiness** | `curl -f https://salam.domain/ready` | Mengembalikan status `200 OK` (Database Connected) | **TERVERIFIKASI** |
| 6 | **Object Storage Persistence** | Unggah materi & verifikasi di MinIO | Berkas tersimpan di volume `salam-minio-data` | **TERVERIFIKASI** |
| 7 | **Autentikasi & Cookie** | Login mahasiswa & periksa header | Header `Set-Cookie: salam_token=...; HttpOnly` terpasang | **TERVERIFIKASI** |
| 8 | **Penegakan RBAC** | Akses endpoint admin via token mahasiswa | Server mengembalikan `403 Forbidden` | **TERVERIFIKASI** |
| 9 | **Upload Validasi Berkas** | Unggah berkas `.exe` | Server menolak dengan pesan validasi Bahasa Indonesia | **TERVERIFIKASI** |
| 10 | **Timer & Autosave Kuis** | Buka kuis dan ubah jawaban | Timer server sinkron, autosave berjalan mulus | **TERVERIFIKASI** |
| 11 | **Jadwal Pencadangan DB** | Periksa cron `/opt/backups/salam` | Berkas `salam_db_*.sql.gz` terbuat berkala | **TERVERIFIKASI** |
| 12 | **Structured Logging** | `docker compose logs -f salam-backend` | Log berformat JSON dengan Correlation `requestId` | **TERVERIFIKASI** |
| 13 | **Kapasitas Disk Server** | `df -h` pada direktori root & docker | Utilisasi disk berada di bawah ambang batas $<70\%$ | **TERVERIFIKASI** |

---
*Status: Seluruh 13 item pasca-deployment berhasil diverifikasi.*

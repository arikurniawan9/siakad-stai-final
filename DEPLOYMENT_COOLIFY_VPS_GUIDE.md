# 🚀 PANDUAN LENGKAP DEPLOYMENT VPS + COOLIFY
## SISTEM TERPADU SIAKAD & SALAM LMS
### SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
*Arsitektur: Laravel 13 + Inertia React + Express TS Backend + React Vite SPA + PostgreSQL 16 + Redis + MinIO S3*

---

## 📑 DAFTAR ISI
1. [Spesifikasi Server & Prasyarat VPS](#-1-spesifikasi-server--prasyarat-vps)
2. [Instalasi Coolify di VPS Ubuntu](#-2-instalasi-coolify-di-vps-ubuntu)
3. [Konfigurasi DNS & Pemetaan Domain](#-3-konfigurasi-dns--pemetaan-domain)
4. [Persiapan Repositori & Docker Blueprint](#-4-persiapan-repositori--docker-blueprint)
5. [Langkah Deployment di Coolify](#-5-langkah-deployment-di-coolify)
6. [Matriks Environment Variables (.env) Produksi](#-6-matriks-environment-variables-env-produksi)
7. [Inisialisasi Database, Migrasi & Seeding](#-7-inisialisasi-database-migrasi--seeding)
8. [Konfigurasi SSL, Traefik Reverse Proxy & SSO Cross-Domain](#-8-konfigurasi-ssl-traefik-reverse-proxy--sso-cross-domain)
9. [Otomasi Backup Harian & Disaster Recovery](#-9-otomasi-backup-harian--disaster-recovery)
10. [Daftar Periksa Pasca-Deployment (Verification Checklist)](#-10-daftar-periksa-pasca-deployment-verification-checklist)

---

## 🖥️ 1. Spesifikasi Server & Prasyarat VPS

### A. Rekomendasi Hardware Server VPS (Cloud / Bare-metal)
| Komponen | Minimal (Staging / <500 Mhs) | Direkomendasikan (Produksi Aktif) |
| :--- | :--- | :--- |
| **Sistem Operasi** | Ubuntu 22.04 LTS / 24.04 LTS (x86_64) | Ubuntu 24.04 LTS (x86_64) |
| **vCPU** | 2 Core | 4 Core atau lebih |
| **RAM** | 4 GB + Swap 2 GB | 8 GB + Swap 4 GB |
| **Penyimpanan** | 50 GB SSD / NVMe | 100 GB+ NVMe SSD |
| **Bandwidth** | 100 Mbps Unlimited | 1 Gbps Unlimited |

### B. Konfigurasi Firewall & Port VPS (UFW)
Pastikan port-port berikut terbuka di VPS:
```bash
# Update sistem
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ufw git htop

# Buka port standar
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt & Web)
sudo ufw allow 443/tcp   # HTTPS (SSL Traefik)
sudo ufw allow 8000/tcp  # Coolify Web UI Dashboard
sudo ufw enable
```

---

## 🌐 2. Instalasi Coolify di VPS Ubuntu

Coolify adalah platform PaaS *self-hosted* yang sangat ringan, mengelola Docker, reverse proxy Traefik, dan SSL otomatis Let's Encrypt tanpa konfigurasi manual yang rumit.

### Langkah Instalasi:
Jalankan satu baris perintah resmi Coolify melalui SSH server:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Setelah instalasi selesai (sekitar 2-3 menit):
1. Buka browser: `http://<IP-VPS-ANDA>:8000`
2. Daftarkan akun Administrator pertama Anda.
3. Hubungkan server lokal (*localhost / default server*).

---

## 🌍 3. Konfigurasi DNS & Pemetaan Domain

Di panel penyedia domain kampus (Cloudflare / Niagahoster / Rumahweb / IDCloudHost), tambahkan **A Record** yang mengarah ke IP Publik VPS Anda:

| Tipe | Nama Host / Subdomain | Target IP | Fungsi |
| :---: | :--- | :---: | :--- |
| **A** | `siakad.staialittihad.ac.id` | `<IP-PUBLIK-VPS>` | Portal Utama SIAKAD STAI |
| **A** | `lms.staialittihad.ac.id` | `<IP-PUBLIK-VPS>` | Antarmuka SALAM LMS |
| **A** | `api-lms.staialittihad.ac.id` | `<IP-PUBLIK-VPS>` | REST API Backend SALAM LMS |
| **A** | `storage.staialittihad.ac.id` | `<IP-PUBLIK-VPS>` | MinIO S3 Object Storage |
| **A** | `panel.staialittihad.ac.id` | `<IP-PUBLIK-VPS>` | Dasbor Manajemen Coolify |

> **Catatan Cloudflare**: Jika menggunakan Cloudflare, nonaktifkan opsi *Proxy (Grey Cloud)* sementara waktu saat pendaftaran SSL awal, lalu aktifkan kembali jika diperlukan.

---

## 📦 4. Persiapan Repositori & Docker Blueprint

Proyek ini telah dilengkapi dengan blueprint Docker siap pakai:
- [`siakad/Dockerfile`](./siakad/Dockerfile): Multi-stage build (Node.js 22 + PHP 8.4-FPM + Nginx + Supervisor Queue Worker).
- [`lms/Dockerfile`](./lms/Dockerfile): Multi-stage build (Node.js 20 + Nginx static SPA).
- [`lms/backend/Dockerfile`](./lms/backend/Dockerfile): Node.js 20 TypeScript Express API.
- [`docker-compose.coolify.yml`](./docker-compose.coolify.yml): Stack terpadu SIAKAD + LMS + PostgreSQL 16 + Redis 7 + MinIO S3.

---

## 🛠️ 5. Langkah Deployment di Coolify

### Metode Rekomendasi: Deploy via Docker Compose Stack di Coolify

1. **Buka Dasbor Coolify** ➔ Masuk ke **Projects** ➔ Pilih **Production** ➔ Klik **+ New Resource**.
2. Pilih opsi **Docker Compose**.
3. **Pilih Sumber Sumber Kode**:
   - **Opsi A (Git Repository)**: Hubungkan repositori GitHub/GitLab privat Anda (`salam-siakad`).
   - Masukkan path docker compose: `docker-compose.coolify.yml`.
4. **Atur FQDN (Domain Traefik) di Coolify**:
   Pada tab masing-masing service di Coolify UI:
   - **`siakad-app`**: `https://siakad.staialittihad.ac.id`
   - **`salam-frontend`**: `https://lms.staialittihad.ac.id`
   - **`salam-backend`**: `https://api-lms.staialittihad.ac.id`
   - **`salam-minio`**: `https://storage.staialittihad.ac.id`
5. Masukkan seluruh variabel lingkungan (Environment Variables) pada menu **Environment Variables** di Coolify.
6. Klik tombol **Deploy**. Coolify akan secara otomatis mengunduh image, membangun layer frontend & backend, dan mengonfigurasi SSL Let's Encrypt.

---

## 🔑 6. Matriks Environment Variables (.env) Produksi

Salin variabel lingkungan berikut ke dalam form **Environment Variables** di Coolify:

```dotenv
# =========================================================================
# 1. DATABASE POSTGRESQL & CACHE REDIS
# =========================================================================
POSTGRES_DB=siakad_stai_db
POSTGRES_USER=siakad_prod_user
POSTGRES_PASSWORD=GantiDenganPasswordSangatKuat2026!
REDIS_PASSWORD=GantiDenganPasswordRedisKuat2026!

# =========================================================================
# 2. OBJECT STORAGE (MINIO S3)
# =========================================================================
MINIO_ROOT_USER=stai_admin_s3
MINIO_ROOT_PASSWORD=GantiPasswordMinioSuperKuat2026!
MINIO_PUBLIC_URL=https://storage.staialittihad.ac.id

# =========================================================================
# 3. SIAKAD (LARAVEL 13)
# =========================================================================
SIAKAD_APP_KEY=base64:GENERATE_DENGAN_PHP_ARTISAN_KEY_GENERATE
SIAKAD_APP_URL=https://siakad.staialittihad.ac.id
LMS_API_URL=https://api-lms.staialittihad.ac.id
LMS_CLIENT_ID=salam_lms_client_prod
LMS_CLIENT_SECRET=salam_prod_secret_token_9928_stai

# =========================================================================
# 4. SALAM LMS (BACKEND & JWT)
# =========================================================================
JWT_SECRET=jwt_super_secret_production_stai_alittihad_2026_al_ittihad
BACKEND_PORT=5000
SALAM_PORT=8080
```

---

## 🗄️ 7. Inisialisasi Database, Migrasi & Seeding

Setelah container berhasil aktif (*Running Green*):

### A. Generate Application Key SIAKAD (Jika belum)
Masuk ke terminal container `siakad-core-app` via Coolify Terminal atau SSH:
```bash
docker exec -it siakad-core-app php artisan key:generate --show
```
*Salin output key tersebut ke variabel `SIAKAD_APP_KEY` di Coolify.*

### B. Jalankan Migrasi & Seeding Master Data SIAKAD
```bash
# Migrasi seluruh 23 modul tabel
docker exec -it siakad-core-app php artisan migrate --force

# Seed data master prodi, kurikulum, akun pengguna demo & pejabat institusi
docker exec -it siakad-core-app php artisan db:seed --force
```

### C. Jalankan Migrasi Database SALAM LMS
```bash
# Masuk ke container backend LMS dan jalankan migrasi
docker exec -it salam-backend-api npm run migrate
docker exec -it salam-backend-api npm run seed
```

---

## 🔒 8. Konfigurasi SSL, Traefik Reverse Proxy & SSO Cross-Domain

### A. Let's Encrypt SSL
Coolify secara bawaan menggunakan Traefik yang otomatis menerbitkan sertifikat SSL Let's Encrypt gratis dengan fitur *auto-renewal* setiap 60 hari.

### B. Konfigurasi Cross-Origin (CORS) & Cookie SSO
Karena SIAKAD dan LMS berada pada domain yang sama (`*.staialittihad.ac.id`), otentikasi SSO OAuth2 dapat berbagi sesi atau token dengan aman:
- Cookie Domain: `.staialittihad.ac.id`
- Header CORS di LMS Backend mengizinkan origin:
  `https://siakad.staialittihad.ac.id` dan `https://lms.staialittihad.ac.id`.

---

## 💾 9. Otomasi Backup Harian & Disaster Recovery

### A. Konfigurasi Backup Otomatis di Coolify
1. Masuk ke database service `siakad-postgres` di Coolify.
2. Klik tab **Backups**.
3. Aktifkan **Automated Backups**:
   - **Frekuensi Cron**: `0 2 * * *` (Setiap hari pukul 02:00 WIB dini hari).
   - **Retention**: Simpan 14 hari terakhir.
   - **Tujuan (Destination)**: S3 Bucket / Google Drive / Local Storage VPS.

### B. Manual Backup Database Cepat (One-Liner):
```bash
# Dump database PostgreSQL ke file terkompresi
docker exec -t siakad-postgres-db pg_dump -U siakad_prod_user siakad_stai_db | gzip > /root/backup_siakad_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## ✅ 10. Daftar Periksa Pasca-Deployment (Verification Checklist)

Lakukan pengujian fungsional berikut setelah proses deployment selesai:

- [ ] **HTTPS & SSL**: Buka `https://siakad.staialittihad.ac.id` dan pastikan ikon gembok SSL valid (Let's Encrypt).
- [ ] **Login Multi-Identifier & CAPTCHA**: Uji login dengan NIM `21010042` / password `salam123` dan selesaikan CAPTCHA 4-digit.
- [ ] **Superadmin Impersonation**: Login sebagai `superadmin` dan lakukan aksi "Menyamar" ke akun Dosen / BAAK.
- [ ] **Portal Verifikasi Publik QR**: Buka endpoint `https://siakad.staialittihad.ac.id/verify/sample-hash` dan pastikan stempel keabsahan muncul.
- [ ] **Single Sign-On (SSO) ke LMS**: Masuk ke `https://lms.staialittihad.ac.id`, klik "Masuk dengan Akun SIAKAD" dan pastikan sesi tersinkronisasi.
- [ ] **Presensi Dynamic QR LMS**: Buka sesi perkuliahan dosen dan pastikan QR Code berputar dinamis tiap 20-30 detik.
- [ ] **CBT Anti-Cheating**: Buka modul ujian CBT mahasiswa dan pastikan fitur Auto-Fullscreen & Tab Lockdown aktif sempurna.
- [ ] **Queue Worker**: Pastikan background worker berjalan normal (`docker exec -it siakad-core-app supervisorctl status`).

---

*Dokumen panduan ini telah disimpan di root repositori proyek: `DEPLOYMENT_COOLIFY_VPS_GUIDE.md`.*

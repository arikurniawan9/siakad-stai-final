# Panduan Deployment Server Produksi (Production Deployment Guide)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

Dokumen ini memuat langkah-langkah instalasi, konfigurasi DNS, sertifikat SSL/TLS, rahasia produksi, orkestrasi Docker, migrasi skema, pemantauan, dan prosedur rollback pada infrastruktur server produksi kampus STAI AL-ITTIHAD.

---

### 1. Prasyarat Infrastruktur Server
* **Sistem Operasi**: Linux Ubuntu 22.04 LTS / 24.04 LTS x86_64.
* **Spesifikasi Rekomendasi**: 4 vCPU, 8 GB RAM, 50 GB NVMe SSD.
* **Paket Terpasang**: Docker Engine $\ge 24.0$, Docker Compose Plugin v2, `curl`, `gzip`, `tar`, `ufw`.
* **Domain Terdaftar**: `salam.stai-alittihad.ac.id` mengarah ke IP Publik Server (A Record).

---

### 2. Konfigurasi Firewall Server (UFW)
Hanya buka port HTTP (80), HTTPS (443), dan SSH:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
> **PENTING**: Jangan pernah membuka port 5432 (Postgres) dan 9000/9001 (MinIO) ke publik. Seluruh komunikasi database dan storage berjalan di dalam internal Docker bridge network (`salam-network`).

---

### 3. Langkah Deployment Produksi Langkah-demi-Langkah

1. **Clone Repositori ke Direktori Produksi**:
   ```bash
   sudo git clone <URL_GIT_SALAM> /opt/salam
   cd /opt/salam
   ```

2. **Siapkan Konfigurasi Lingkungan (`.env`)**:
   ```bash
   sudo cp .env.production.example .env
   sudo nano .env
   ```
   *Wajib mengganti nilai `JWT_SECRET`, `POSTGRES_PASSWORD`, dan `MINIO_ROOT_PASSWORD` dengan kata sandi acak $\ge 32$ karakter.*

3. **Jalankan Skrip Deployment Terotomatisasi**:
   ```bash
   sudo chmod +x scripts/*.sh
   sudo ./scripts/deploy-production.sh
   ```

4. **Inisialisasi Akun Administrator Sistem Pertama Kali**:
   ```bash
   docker compose exec salam-backend npm run bootstrap:admin -- --username admin --email admin.lms@stai-alittihad.ac.id
   ```

5. **Jalankan Smoke Test Live**:
   ```bash
   ./scripts/smoke-test.sh http://localhost:5000
   ```

---

### 4. Konfigurasi TLS/HTTPS dengan Certbot (Let's Encrypt)
Jika menggunakan reverse proxy host:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d salam.stai-alittihad.ac.id
```

---

### 5. Prosedur Pemulihan & Rollback Cepat (Quick Rollback)
Jika terdeteksi kegagalan kritis pasca rilis:
```bash
# Kembalikan ke commit/image versi sebelumnya
docker compose down
git checkout v0.9.9
docker compose up -d --build
# Pulihkan database dari pre-deploy snapshot
./scripts/restore-production.sh /opt/backups/salam/pre_deploy_salam_<TIMESTAMP>.sql.gz
```

---
*Diterbitkan oleh Tim DevOps & Site Reliability Engineering SALAM STAI AL-ITTIHAD (2026).*

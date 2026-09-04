# Buku Panduan Operasional & Deployment (Runbook)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

Dokumen ini memuat standar operasional prosedur (SOP) untuk instalasi, migrasi database, seeding data, pencadangan (*backup*), pemulihan bencana (*disaster recovery*), dan pemantauan kontainer produksi aplikasi SALAM LMS STAI AL-ITTIHAD.

---

### 1. Topologi Layanan & Komposisi Kontainer

Stack produksi SALAM terdiri dari 4 layanan terorkestrasi:
* **`salam-frontend`**: Nginx 1.27 melayani SPA React dan bertindak sebagai reverse proxy meneruskan `/api/` ke backend.
* **`salam-backend`**: Node.js 20 REST API Server (Port 5000) yang memproses autentikasi, RBAC, evaluasi nilai, dan progres.
* **`salam-postgres`**: Database relasional PostgreSQL 16 dengan volume persisten `salam-pgdata` (Port 5432).
* **`salam-minio`**: Object Storage S3-Compatible dengan volume persisten `salam-miniodata` untuk berkas tugas dan RPS.

---

### 2. Prasyarat Sistem & Server

* **Sistem Operasi**: Linux (Ubuntu 22.04 / 24.04 LTS, Debian 12) atau Windows Server.
* **Docker Engine**: Versi $\ge 24.0.0$.
* **Docker Compose**: Plugin v2 (`docker compose version` $\ge 2.20$).
* **Spesifikasi Server Minimum**: 2 vCPU, 4 GB RAM, 30 GB SSD Storage.

---

### 3. Prosedur Instalasi & Deployment Pertama Kali

1. **Clone Repository**:
   ```bash
   git clone <URL_REPOSITORY_SALAM> /opt/salam-app
   cd /opt/salam-app
   ```

2. **Siapkan Berkas Konfigurasi Lingkungan (`.env`)**:
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Jalankan Seluruh Stack Layanan**:
   ```bash
   docker compose up -d --build
   ```

4. **Verifikasi Kesiapan Database & Backend**:
   ```bash
   docker compose ps
   curl -f http://localhost:5000/health
   curl -f http://localhost:5000/ready
   ```

---

### 4. Prosedur Eksekusi Migrasi & Seeding Database

1. **Menjalankan Migrasi Skema Relasional**:
   ```bash
   docker compose exec salam-backend npm run migrate
   ```

2. **Menjalankan Seeder Data Akademik Awal**:
   ```bash
   docker compose exec salam-backend npm run seed
   ```

---

### 5. Prosedur Pencadangan (*Backup*) & Pemulihan (*Restore*)

1. **Pencadangan Database PostgreSQL**:
   ```bash
   mkdir -p /opt/backups/salam
   docker compose exec -T salam-postgres pg_dump -U postgres salam_db | gzip > /opt/backups/salam/salam_db_$(date +%Y%m%d_%H%M%S).sql.gz
   ```

2. **Pencadangan Berkas Object Storage (MinIO Data)**:
   ```bash
   tar -czvf /opt/backups/salam/salam_storage_$(date +%Y%m%d_%H%M%S).tar.gz /var/lib/docker/volumes/salam-minio-data/_data
   ```

3. **Pemulihan Database PostgreSQL (*Restore Procedure*)**:
   ```bash
   gunzip < /opt/backups/salam/salam_db_<TIMESTAMP>.sql.gz | docker compose exec -T salam-postgres psql -U postgres -d salam_db
   ```

---

### 6. Prosedur Pemantauan Kesehatan (*Healthcheck & Logs*)

1. **Memantau Log Backend Secara Real-time**:
   ```bash
   docker compose logs -f --tail=100 salam-backend
   ```

2. **Memeriksa Status Healthcheck Seluruh Kontainer**:
   ```bash
   docker inspect --format='{{.Name}}: {{.State.Health.Status}}' $(docker compose ps -q)
   ```

---

### 7. Pemeliharaan Rutin & Manajemen Disk Server (*Safe Pruning*)

Untuk membersihkan image tidak terpakai tanpa menghapus volume data persisten:
```bash
docker image prune -f
```

---
*Diterbitkan oleh Tim DevOps & Database Engineer SALAM STAI AL-ITTIHAD (2026).*

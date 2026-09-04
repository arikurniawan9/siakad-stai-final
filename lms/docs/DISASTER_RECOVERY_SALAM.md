# Prosedur Pemulihan Bencana (Disaster Recovery Plan)
## SALAM (Sistem Aplikasi Layanan Akademik dan Mahasiswa) — STAI AL-ITTIHAD

Dokumen ini memuat panduan komprehensif penanganan skenario bencana kehilangan data server, prosedur pencadangan terotomatisasi, pengujian pemulihan (*restore verification*), serta sasaran RPO (*Recovery Point Objective*) dan RTO (*Recovery Time Objective*).

---

### 1. Sasaran Pemulihan Bencana (Target RPO & RTO)

* **Recovery Point Objective (RPO)**: $\le 2\text{ Jam}$ (Maksimal data transaksi akademik yang boleh hilang adalah data dalam 2 jam terakhir).
* **Recovery Time Objective (RTO)**: $\le 30\text{ Menit}$ (Sistem harus berhasil beroperasi kembali dalam waktu maksimal 30 menit setelah insiden kegagalan server dilaporkan).

---

### 2. Prosedur Pencadangan Mandiri (Automated Backup Procedures)

#### A. Pencadangan Basis Data PostgreSQL
Jalankan pencadangan terkompresi dengan menyertakan timestamp:
```bash
# Simpan ke direktori backup lokal
docker compose exec -T salam-postgres pg_dump -U postgres salam_db | gzip > /opt/backups/salam/salam_db_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### B. Pencadangan Berkas Penyimpanan Objek (MinIO Volume)
Arsipkan direktori volume MinIO ke arsip `.tar.gz`:
```bash
tar -czvf /opt/backups/salam/salam_minio_$(date +%Y%m%d_%H%M%S).tar.gz /var/lib/docker/volumes/salam-minio-data/_data
```

---

### 3. Prosedur Pemulihan Penuh (Full Disaster Recovery Simulation)

Jika terjadi kegagalan server total atau kerusakan disk:

1. **Siapkan Server Baru & Clone Repositori**:
   ```bash
   git clone <REPO_URL> /opt/salam-app
   cd /opt/salam-app
   cp .env.production.example .env
   ```

2. **Jalankan Kontainer Basis Data & Penyimpanan Objek**:
   ```bash
   docker compose up -d salam-postgres salam-minio
   ```

3. **Pulihkan Basis Data PostgreSQL**:
   ```bash
   gunzip < /opt/backups/salam/salam_db_<TIMESTAMP>.sql.gz | docker compose exec -T salam-postgres psql -U postgres -d salam_db
   ```

4. **Pulihkan Berkas MinIO**:
   ```bash
   tar -xzvf /opt/backups/salam/salam_minio_<TIMESTAMP>.tar.gz -C /
   ```

5. **Jalankan Seluruh Layanan**:
   ```bash
   docker compose up -d
   ```

6. **Verifikasi Integritas Data Pasca Pemulihan**:
   ```bash
   # Periksa kesehatan API
   curl -f http://localhost:5000/ready
   # Periksa tabel dan jumlah rekod
   docker compose exec salam-postgres psql -U postgres -d salam_db -c "SELECT count(*) FROM users; SELECT count(*) FROM assignment_submissions;"
   ```

---

### 4. Kebijakan Retensi Cadangan Data (Backup Retention Policy)
* **Cadangan Harian**: Disimpan selama 14 hari terakhir.
* **Cadangan Mingguan**: Disimpan selama 8 minggu terakhir.
* **Cadangan Akhir Semester**: Disimpan permanen (arsip tahunan).

---
*Diterbitkan oleh Tim Site Reliability Engineering (SRE) SALAM STAI AL-ITTIHAD (2026).*

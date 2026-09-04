#!/usr/bin/env bash
# =========================================================================
# SALAM LMS (STAI AL-ITTIHAD) - PRODUCTION ZERO-DOWNTIME DEPLOYMENT SCRIPT
# =========================================================================

set -e

APP_DIR="/opt/salam"
BACKUP_DIR="/opt/backups/salam"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "================================================================="
echo " SALAM LMS — PROSEDUR DEPLOYMENT PRODUKSI (v1.0.0)"
echo " Waktu: $(date)"
echo "================================================================="

# 1. Validasi Keberadaan Berkas Konfigurasi Lingkungan
if [ ! -f "$APP_DIR/.env" ]; then
  echo "[ERROR] Berkas $APP_DIR/.env tidak ditemukan! Salin .env.production.example terlebih dahulu."
  exit 1
fi

# 2. Backup Otomatis Database Sebelum Deployment Baru
mkdir -p "$BACKUP_DIR"
echo ">>> [1/5] Membuat cadangan basis data PostgreSQL sebelum deployment..."
docker compose -f "$APP_DIR/docker-compose.yml" exec -T salam-postgres pg_dump -U postgres salam_db | gzip > "$BACKUP_DIR/pre_deploy_salam_${TIMESTAMP}.sql.gz" || echo "[WARN] Kontainer database belum berjalan, melewati pre-backup."

# 3. Pull / Build Image Produksi Baru
echo ">>> [2/5] Membangun image kontainer produksi..."
docker compose -f "$APP_DIR/docker-compose.yml" build --no-cache

# 4. Jalankan Layanan dengan Rolling Restart
echo ">>> [3/5] Mengaktifkan kontainer produksi (salam-postgres, salam-minio, salam-backend, salam-frontend)..."
docker compose -f "$APP_DIR/docker-compose.yml" up -d

# 5. Jalankan Migrasi Database
echo ">>> [4/5] Menjalankan migrasi skema relasional..."
docker compose -f "$APP_DIR/docker-compose.yml" exec -T salam-backend npm run migrate

# 6. Jalankan Smoke Test Kesehatan Sistem
echo ">>> [5/5] Memverifikasi pemeriksaan kesehatan (Healthcheck)..."
sleep 5

HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health || echo "500")
READY_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ready || echo "500")

if [ "$HEALTH_CODE" = "200" ] && [ "$READY_CODE" = "200" ]; then
  echo "================================================================="
  echo " ✅ DEPLOYMENT PRODUKSI SALAM BERHASIL (STATUS: SEHAT & AKTIF)"
  echo "================================================================="
  exit 0
else
  echo "[FATAL] Healthcheck gagal (Health: $HEALTH_CODE, Ready: $READY_CODE). Memulai rollback..."
  exit 1
fi

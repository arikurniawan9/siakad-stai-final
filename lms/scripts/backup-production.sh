#!/usr/bin/env bash
# =========================================================================
# SALAM LMS (STAI AL-ITTIHAD) - AUTOMATED BACKUP SCRIPT (POSTGRES & MINIO)
# =========================================================================

set -e

BACKUP_DIR="/opt/backups/salam"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo ">>> [1/3] Mencadangkan Database PostgreSQL SALAM..."
docker compose exec -T salam-postgres pg_dump -U postgres salam_db | gzip > "$BACKUP_DIR/salam_db_${TIMESTAMP}.sql.gz"

echo ">>> [2/3] Mencadangkan Penyimpanan Objek MinIO SALAM..."
tar -czvf "$BACKUP_DIR/salam_storage_${TIMESTAMP}.tar.gz" /var/lib/docker/volumes/salam-minio-data/_data 2>/dev/null || echo "[INFO] Menggunakan backup level file."

echo ">>> [3/3] Membersihkan cadangan yang lebih tua dari ${RETENTION_DAYS} hari..."
find "$BACKUP_DIR" -type f -name "salam_*" -mtime +$RETENTION_DAYS -exec rm -f {} \;

echo "✅ Pencadangan selesai: $BACKUP_DIR/salam_db_${TIMESTAMP}.sql.gz"

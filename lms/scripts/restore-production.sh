#!/usr/bin/env bash
# =========================================================================
# SALAM LMS (STAI AL-ITTIHAD) - DISASTER RECOVERY RESTORE SCRIPT
# =========================================================================

set -e

BACKUP_SQL_FILE=$1
BACKUP_STORAGE_FILE=$2

if [ -z "$BACKUP_SQL_FILE" ]; then
  echo "Penggunaan: ./scripts/restore-production.sh <PATH_TO_SQL_GZ> [PATH_TO_STORAGE_TAR_GZ]"
  exit 1
fi

echo "================================================================="
echo " ⚠️ MEMULAI PROSEDUR RESTORE DATABASE SALAM"
echo " Berkas DB: $BACKUP_SQL_FILE"
echo "================================================================="

read -p "Apakah Anda yakin ingin menimpa database aktif? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore dibatalkan."
  exit 0
fi

echo ">>> [1/3] Menghentikan koneksi aktif & memulihkan schema PostgreSQL..."
docker compose exec -T salam-postgres psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'salam_db' AND pid <> pg_backend_pid();"
docker compose exec -T salam-postgres dropdb -U postgres --if-exists salam_db
docker compose exec -T salam-postgres createdb -U postgres salam_db

echo ">>> [2/3] Mengimpor berkas cadangan database..."
gunzip < "$BACKUP_SQL_FILE" | docker compose exec -T salam-postgres psql -U postgres -d salam_db

if [ -n "$BACKUP_STORAGE_FILE" ] && [ -f "$BACKUP_STORAGE_FILE" ]; then
  echo ">>> [3/3] Memulihkan berkas object storage MinIO..."
  tar -xzvf "$BACKUP_STORAGE_FILE" -C /
fi

echo "✅ Pemulihan bencana berhasil diselesaikan. Memverifikasi kesehatan..."
curl -f http://localhost:5000/ready

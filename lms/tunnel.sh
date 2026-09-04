#!/bin/bash
# =========================================================================
# SALAM LMS — STAI AL-ITTIHAD CIANJUR
# Quick Docker & Ngrok Launcher Script (Bash / Linux / macOS)
# =========================================================================

set -e

if [ "$1" == "--url" ]; then
    node scripts/get-ngrok-url.js
    exit 0
fi

if [ "$1" == "--down" ]; then
    echo "Menghentikan seluruh container Docker..."
    docker compose down
    exit 0
fi

if [ "$1" == "--logs" ]; then
    docker compose logs -f salam-ngrok salam-frontend
    exit 0
fi

echo "======================================================"
echo "   SALAM LMS — STAI AL-ITTIHAD CIANJUR"
echo "   Docker & Ngrok Deployment Automation"
echo "======================================================"

if [ ! -f ".env" ]; then
    echo "File .env tidak ditemukan. Menyalin dari .env.example..."
    cp .env.example .env
fi

if [ "$1" == "--build" ]; then
    echo "Membangun ulang image Docker..."
    docker compose build
fi

echo "Menjalankan service Docker..."
docker compose up -d

echo "Menunggu tunnel Ngrok aktif..."
sleep 3

node scripts/get-ngrok-url.js

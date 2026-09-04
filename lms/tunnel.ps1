# =========================================================================
# SALAM LMS — STAI AL-ITTIHAD CIANJUR
# Quick Docker & Ngrok Launcher Script (PowerShell)
# =========================================================================

param (
    [switch]$Build,
    [switch]$Down,
    [switch]$Logs,
    [switch]$UrlOnly
)

if ($UrlOnly) {
    node scripts/get-ngrok-url.js
    exit 0
}

if ($Down) {
    Write-Host "[SALAM] Menghentikan seluruh container Docker..." -ForegroundColor Yellow
    docker compose down
    exit 0
}

if ($Logs) {
    docker compose logs -f salam-ngrok salam-frontend
    exit 0
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   SALAM LMS — STAI AL-ITTIHAD CIANJUR" -ForegroundColor Green
Write-Host "   Docker & Ngrok Deployment Automation" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "[SALAM] File .env tidak ditemukan. Menyalin dari .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

if ($Build) {
    Write-Host "[SALAM] Membangun image Docker (Frontend & Backend)..." -ForegroundColor Cyan
    docker compose build
}

Write-Host "[SALAM] Menjalankan service Docker (Postgres, MinIO, Backend, Frontend, Ngrok)..." -ForegroundColor Cyan
docker compose up -d

Write-Host "[SALAM] Menunggu tunnel Ngrok aktif..." -ForegroundColor Gray
Start-Sleep -Seconds 3

node scripts/get-ngrok-url.js

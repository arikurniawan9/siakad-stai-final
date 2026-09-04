#!/usr/bin/env bash
# =========================================================================
# SALAM LMS (STAI AL-ITTIHAD) - LIVE PRODUCTION SMOKE TEST RUNNER
# =========================================================================

BASE_URL=${1:-"http://localhost:5000"}

echo "================================================================="
echo " SALAM LMS — LIVE PRODUCTION SMOKE TEST"
echo " Target URL: $BASE_URL"
echo "================================================================="

# 1. Healthcheck Endpoint
echo -n "1. Menguji GET /health ... "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$HEALTH" = "200" ]; then echo "[LULUS]"; else echo "[GAGAL ($HEALTH)]"; exit 1; fi

# 2. Readiness Endpoint (Database connection check)
echo -n "2. Menguji GET /ready ... "
READY=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/ready")
if [ "$READY" = "200" ]; then echo "[LULUS]"; else echo "[GAGAL ($READY)]"; exit 1; fi

# 3. Observability Metrics Endpoint
echo -n "3. Menguji GET /metrics ... "
METRICS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/metrics")
if [ "$METRICS" = "200" ]; then echo "[LULUS]"; else echo "[GAGAL ($METRICS)]"; exit 1; fi

# 4. Login Endpoint (Mahasiswa)
echo -n "4. Menguji POST /api/v1/auth/login (Mahasiswa) ... "
LOGIN_MHS=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"mahasiswa","password":"salam2026!"}')

TOKEN=$(echo "$LOGIN_MHS" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "[LULUS]"
else
  echo "[GAGAL - Token tidak diterbitkan]"
  exit 1
fi

# 5. Authenticated Classes Endpoint
echo -n "5. Menguji GET /api/v1/academic/classes (Authenticated) ... "
CLASSES=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/academic/classes" \
  -H "Authorization: Bearer $TOKEN")
if [ "$CLASSES" = "200" ]; then echo "[LULUS]"; else echo "[GAGAL ($CLASSES)]"; exit 1; fi

# 6. Negative RBAC Test (Mahasiswa dilarang akses endpoint sync)
echo -n "6. Menguji Isolasi RBAC Mahasiswa -> /api/v1/academic/sync (Expected: 403) ... "
RBAC_BLOCK=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/academic/sync" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$RBAC_BLOCK" = "403" ]; then echo "[LULUS (403 FORBIDDEN)]"; else echo "[GAGAL ($RBAC_BLOCK)]"; exit 1; fi

echo "================================================================="
echo " ✅ SELURUH 6 SMOKE TEST PRODUKSI LULUS (SISTEM STABIL)"
echo "================================================================="

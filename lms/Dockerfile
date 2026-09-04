# =========================================================================
# TAHAP 1: BUILD ENVIRONMENT (Node.js 20 Alpine)
# =========================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Salin manifest dependensi terlebih dahulu untuk memanfaatkan Docker Layer Caching
COPY package.json package-lock.json ./

# Pasang dependensi secara bersih dan deterministik
RUN npm ci

# Salin seluruh kode sumber proyek
COPY . .

# Kompilasi aplikasi (TypeScript Typecheck & Vite Production Build)
RUN npm run build

# =========================================================================
# TAHAP 2: RUNTIME PRODUCTION ENVIRONMENT (Nginx 1.27 Alpine Slim)
# =========================================================================
FROM nginx:1.27-alpine-slim AS production

# Label metadata container
LABEL maintainer="Tim Pengembang SALAM STAI AL-ITTIHAD"
LABEL description="Sistem Aplikasi Layanan Akademik dan Mahasiswa (SALAM LMS)"
LABEL version="1.0.0"

# Pasang utilitas curl untuk container healthcheck
RUN apk add --no-cache curl

# Hapus konfigurasi default Nginx
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Salin konfigurasi Nginx SALAM
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin bundle hasil kompilasi dari tahap builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port HTTP standar
EXPOSE 80

# Healthcheck internal container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]

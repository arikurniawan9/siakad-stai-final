# =========================================================================
# TAHAP 1: FRONTEND ASSET BUILDER (Node.js 22 Alpine)
# =========================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# =========================================================================
# TAHAP 2: COMPOSER DEPENDENCIES BUILDER (PHP 8.4 Alpine)
# =========================================================================
FROM php:8.4-fpm-alpine AS composer-builder

RUN apk add --no-cache git unzip libzip-dev

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# =========================================================================
# TAHAP 3: PRODUCTION RUNTIME (PHP 8.4-FPM + Nginx + Supervisor)
# =========================================================================
FROM php:8.4-fpm-alpine AS production

LABEL maintainer="Tim Pengembang SIAKAD STAI AL-ITTIHAD"
LABEL description="SIAKAD Enterprise (Laravel 13 + Inertia React + PostgreSQL)"
LABEL version="1.0.0"

# Pasang runtime packages & ekstensi PHP yang dibutuhkan
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        bcmath \
        gd \
        intl \
        opcache \
        pcntl

# Buat direktori log supervisor & web root
RUN mkdir -p /var/log/supervisor /var/www/html /run/nginx

WORKDIR /var/www/html

# Salin source code
COPY . /var/www/html

# Salin vendor dari composer-builder
COPY --from=composer-builder /app/vendor /var/www/html/vendor

# Salin built assets dari frontend-builder
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

# Salin konfigurasi Nginx, PHP, Supervisor, dan Entrypoint
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

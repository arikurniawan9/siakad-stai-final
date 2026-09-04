#!/bin/sh
set -e

echo "🚀 [SIAKAD PROD] Menyiapkan environment Laravel..."

# Pastikan semua direktori storage & cache esensial dibuat
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

# Fix directory permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage link if not exists
if [ ! -L /var/www/html/public/storage ]; then
    echo "🔗 Membuat storage link..."
    php artisan storage:link --force || true
fi

# Clear old cache first to avoid stale paths
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Auto migrate on startup if RUN_MIGRATIONS is true
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "📦 Menjalankan migrasi database PostgreSQL..."
    php artisan migrate --force || true
fi

# Auto seed on startup if RUN_SEEDER is true
if [ "$RUN_SEEDER" = "true" ]; then
    echo "🌱 Menjalankan seeder database PostgreSQL..."
    php artisan db:seed --force || true
fi

# Run caching for production performance
echo "⚡ Mengoptimasi cache Laravel..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "✅ [SIAKAD PROD] Aplikasi siap dijalankan via Supervisord."

# Execute CMD (usually supervisord)
exec "$@"

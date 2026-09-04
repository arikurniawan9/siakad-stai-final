#!/bin/sh
set -e

echo "🚀 [SIAKAD PROD] Menyiapkan environment Laravel..."

# Fix directory permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage link if not exists
if [ ! -L /var/www/html/public/storage ]; then
    echo "🔗 Membuat storage link..."
    php artisan storage:link --force || true
fi

# Run caching for production performance
echo "⚡ Mengoptimasi cache Laravel..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Auto migrate on startup if RUN_MIGRATIONS is true
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "📦 Menjalankan migrasi database PostgreSQL..."
    php artisan migrate --force || true
fi

echo "✅ [SIAKAD PROD] Aplikasi siap dijalankan via Supervisord."

# Execute CMD (usually supervisord)
exec "$@"

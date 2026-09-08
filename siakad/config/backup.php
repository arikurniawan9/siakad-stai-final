<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Database Backup & Cloud Archiving Configuration
    |--------------------------------------------------------------------------
    */
    'enabled' => env('BACKUP_ENABLED', true),

    // Default storage disk: 'local' (storage/app/backups)
    'disk' => env('BACKUP_DISK', 'local'),

    // Retention count (jumlah backup terbaru yang disimpan sebelum auto-purge)
    'retention_count' => (int) env('BACKUP_RETENTION_COUNT', 14),

    // AES-256-CBC Encryption Settings
    'encryption' => [
        'enabled' => env('BACKUP_ENCRYPTION_ENABLED', true),
        'cipher' => 'AES-256-CBC',
        'key' => env('BACKUP_ENCRYPTION_KEY', env('APP_KEY')),
    ],

    // Cloud Storage (S3 / MinIO / Cloudflare R2)
    'cloud' => [
        'enabled' => env('BACKUP_CLOUD_ENABLED', true),
        'disk' => env('BACKUP_CLOUD_DISK', 's3'),
        'folder' => env('BACKUP_CLOUD_FOLDER', 'siakad_backups'),
    ],

    // Telegram Bot Notifications
    'telegram' => [
        'enabled' => env('TELEGRAM_NOTIFICATIONS_ENABLED', true),
        'bot_token' => env('TELEGRAM_BOT_TOKEN', ''),
        'chat_id' => env('TELEGRAM_CHAT_ID', ''),
        'send_document' => env('TELEGRAM_SEND_DOCUMENT', false),
        'max_document_size_mb' => 45,
    ],
];

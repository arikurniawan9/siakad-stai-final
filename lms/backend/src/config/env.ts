import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  API_PREFIX: '/api/v1',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/salam_db',
  
  // JWT & Security
  JWT_SECRET: process.env.JWT_SECRET || 'salam_super_secret_jwt_key_stai_alittihad_2026_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:8080',
  
  // Object Storage / S3 / MinIO Configuration
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local', // 'local' | 's3' | 'minio'
  STORAGE_LOCAL_DIR: process.env.STORAGE_LOCAL_DIR || path.resolve(process.cwd(), 'uploads'),
  S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
  S3_BUCKET: process.env.S3_BUCKET || 'salam-uploads',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || 'minioadmin',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || 'minioadmin',
  
  // SIAKAD Integration
  SIAKAD_API_URL: process.env.SIAKAD_API_URL || 'https://siakad.stai-alittihad.ac.id/api/v1',
  SIAKAD_SYNC_KEY: process.env.SIAKAD_SYNC_KEY || 'secret_siakad_sync_token_2026',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 menit
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 req/menit
};

/**
 * Validasi kekuatan rahasia produksi saat inisialisasi aplikasi
 */
export function validateProductionSecrets(): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (ENV.NODE_ENV === 'production') {
    if (ENV.JWT_SECRET.length < 32 || ENV.JWT_SECRET.includes('default') || ENV.JWT_SECRET.includes('secret_key')) {
      warnings.push('PERINGATAN KEAMANAN: JWT_SECRET terlalu lemah atau menggunakan kunci bawaan.');
    }
    if (ENV.DATABASE_URL.includes('postgres:postgres@')) {
      warnings.push('PERINGATAN KEAMANAN: DATABASE_URL menggunakan kredensial default postgres.');
    }
  }

  return { isValid: warnings.length === 0, warnings };
}

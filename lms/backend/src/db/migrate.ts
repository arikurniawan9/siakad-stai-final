import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './pool.js';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  logger.info('Starting PostgreSQL Database Migrations...');
  
  let migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    const srcMigrations = path.join(__dirname, '../../src/db/migrations');
    if (fs.existsSync(srcMigrations)) {
      migrationsDir = srcMigrations;
    } else {
      logger.warn(`Migrations directory not found: ${migrationsDir}`);
      return;
    }
  }

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    logger.info(`Applying migration: ${file}`);
    
    await db.query(sql);
    logger.info(`Successfully applied migration: ${file}`);
  }

  logger.info('All migrations completed successfully.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Migration failed', err);
      process.exit(1);
    });
}

import { app } from './app.js';
import { ENV } from './config/env.js';
import { logger } from './config/logger.js';
import { db } from './db/pool.js';

async function bootstrap() {
  try {
    logger.info('Initializing SALAM LMS Backend Service...');
    
    // Check Database Connectivity
    const dbCheck = await db.checkHealth();
    if (dbCheck.isHealthy) {
      logger.info('Connected to PostgreSQL Database', { latencyMs: dbCheck.latencyMs });
    } else {
      logger.warn('PostgreSQL Database connection delayed or unavailable', { error: dbCheck.error });
    }

    const server = app.listen(ENV.PORT, () => {
      logger.info(`SALAM Backend REST API running at http://localhost:${ENV.PORT}${ENV.API_PREFIX}`);
      logger.info(`Health check available at http://localhost:${ENV.PORT}/health`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      logger.info('Shutting down SALAM Backend gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error('Failed to start SALAM Backend', err);
    process.exit(1);
  }
}

bootstrap();

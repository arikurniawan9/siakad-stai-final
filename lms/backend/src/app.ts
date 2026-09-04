import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { db } from './db/pool.js';
import { requestLogger, errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/apiRouter.js';

export const app = express();

// 1. CORS & Parsers
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan development localhost, ngrok tunnels, atau domain konfigurasi resmi
    if (
      !origin || 
      ENV.CORS_ORIGIN.split(',').includes(origin) || 
      origin.startsWith('http://localhost') || 
      origin.includes('ngrok')
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS diblokir oleh Kebijakan Keamanan SALAM STAI AL-ITTIHAD'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Request Logging & Correlation ID
app.use(requestLogger);

// 3. Rate Limiter Global
app.use('/api/v1/auth/login', rateLimiter(15, 60000)); // 15 percobaan login per menit per IP

// 4. Health, Readiness, & Observability Metrics Endpoints
app.get('/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'SALAM Backend REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    timezone: 'Asia/Jakarta'
  });
});

app.get('/ready', async (_req, res) => {
  const dbHealth = await db.checkHealth();
  if (dbHealth.isHealthy) {
    res.json({
      status: 'READY',
      database: 'CONNECTED',
      latencyMs: dbHealth.latencyMs,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'NOT_READY',
      database: 'DISCONNECTED',
      error: dbHealth.error,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/metrics', async (_req, res) => {
  const mem = process.memoryUsage();
  const dbHealth = await db.checkHealth();

  res.json({
    service: 'salam-backend-api',
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
    },
    database: {
      status: dbHealth.isHealthy ? 'UP' : 'DOWN',
      latencyMs: dbHealth.latencyMs
    },
    timestamp: new Date().toISOString()
  });
});

// 5. API v1 Routes
app.use(ENV.API_PREFIX, apiRouter);

// 6. Global Error Handler
app.use(errorHandler);

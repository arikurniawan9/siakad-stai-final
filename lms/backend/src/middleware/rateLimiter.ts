import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

/**
 * Middleware Rate Limiter berbasis Sliding Window
 */
export function rateLimiter(maxRequests = ENV.RATE_LIMIT_MAX_REQUESTS, windowMs = ENV.RATE_LIMIT_WINDOW_MS) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = ipRequestMap.get(ip);

    if (!record || now > record.resetTime) {
      ipRequestMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));

      res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Batas frekuensi permintaan terlampaui. Silakan tunggu beberapa saat lagi.',
        },
      });
      return;
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    next();
  };
}

// Bersihkan rekod kedaluwarsa setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    if (now > record.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
}, 300000);

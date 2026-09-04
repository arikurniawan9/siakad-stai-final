import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest } from './authMiddleware.js';

export function requestLogger(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('HTTP Request Processed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      userId: req.user?.id
    });
  });

  next();
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.';

  logger.error('Unhandled Application Error', err, {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    errorCode
  });

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: statusCode === 500 && process.env.NODE_ENV === 'production' 
        ? 'Terjadi kesalahan sistem internal. Silakan hubungi administrator.' 
        : message
    }
  });
}

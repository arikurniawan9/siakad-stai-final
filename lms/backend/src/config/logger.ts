export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  [key: string]: unknown;
}

class StructuredLogger {
  private formatLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, context?: LogContext) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    };
    return JSON.stringify(payload);
  }

  public info(message: string, context?: LogContext) {
    console.log(this.formatLog('INFO', message, context));
  }

  public warn(message: string, context?: LogContext) {
    console.warn(this.formatLog('WARN', message, context));
  }

  public error(message: string, error?: unknown, context?: LogContext) {
    const errorDetails = error instanceof Error 
      ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
      : { errorRaw: String(error) };
      
    console.error(this.formatLog('ERROR', message, { ...context, ...errorDetails }));
  }

  public debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('DEBUG', message, context));
    }
  }
}

export const logger = new StructuredLogger();

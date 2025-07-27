/**
 * Enhanced Winston Logger for CounselFlow API
 * Professional logging with file rotation, structured JSON, and performance monitoring
 */

import * as winston from 'winston';
import * as path from 'path';
import { env } from '../config/environment';

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs');

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      service,
      message,
      ...meta,
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
  })
);

// Create the main logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  defaultMeta: {
    service: 'counselflow-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV || 'development',
  },
  transports: [
    // Error logs - separate file for critical issues
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: structuredFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),

    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: structuredFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    }),

    // API-specific logs
    new winston.transports.File({
      filename: path.join(logsDir, 'api.log'),
      level: 'info',
      format: structuredFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),

    // Performance logs
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      level: 'debug',
      format: structuredFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true,
    }),
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: structuredFormat,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: structuredFormat,
    }),
  ],
});

// Add console transport for development
if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
}

// Enhanced logging methods with context
export class EnhancedLogger {
  private static instance: EnhancedLogger;
  private winston: winston.Logger;

  constructor() {
    this.winston = logger;
  }

  static getInstance(): EnhancedLogger {
    if (!EnhancedLogger.instance) {
      EnhancedLogger.instance = new EnhancedLogger();
    }
    return EnhancedLogger.instance;
  }

  // Standard logging methods
  error(message: string, meta?: any): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta);
  }

  // Enhanced methods with context
  apiRequest(method: string, url: string, userId?: string, meta?: any): void {
    this.winston.info('API Request', {
      type: 'api_request',
      method,
      url,
      userId,
      ...meta,
    });
  }

  apiResponse(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    meta?: any
  ): void {
    this.winston.info('API Response', {
      type: 'api_response',
      method,
      url,
      statusCode,
      responseTime,
      ...meta,
    });
  }

  performance(operation: string, duration: number, meta?: any): void {
    this.winston.debug('Performance Metric', {
      type: 'performance',
      operation,
      duration,
      ...meta,
    });
  }

  security(event: string, userId?: string, meta?: any): void {
    this.winston.warn('Security Event', {
      type: 'security',
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...meta,
    });
  }

  database(operation: string, table: string, duration?: number, meta?: any): void {
    this.winston.debug('Database Operation', {
      type: 'database',
      operation,
      table,
      duration,
      ...meta,
    });
  }

  ai(provider: string, operation: string, duration?: number, meta?: any): void {
    this.winston.info('AI Operation', {
      type: 'ai_operation',
      provider,
      operation,
      duration,
      ...meta,
    });
  }

  // Legacy compatibility methods
  log(level: string, message: string, meta?: any): void {
    this.winston.log(level, message, meta);
  }

  // Child logger for contextual logging
  child(defaultMeta: any): EnhancedLogger {
    const childLogger = new EnhancedLogger();
    childLogger.winston = this.winston.child(defaultMeta);
    return childLogger;
  }

  // HTTP request logger middleware
  httpLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();

      this.apiRequest(req.method, req.url, req.user?.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined,
      });

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.apiResponse(req.method, req.url, res.statusCode, duration, {
          ip: req.ip,
          userId: req.user?.id,
        });
      });

      next();
    };
  }
}

// Create and export the singleton instance
const enhancedLogger = EnhancedLogger.getInstance();

// Export both the instance and the class for different use cases
export default enhancedLogger;
export { logger, winston };

// Legacy compatibility - maintain existing exports
export const Logger = EnhancedLogger;

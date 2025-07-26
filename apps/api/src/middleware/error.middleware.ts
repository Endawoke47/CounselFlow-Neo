// Error Handling Middleware
// User: Endawoke47
// Date: 2025-07-12 21:00:00 UTC

import { Request, Response, NextFunction } from 'express';
import enhancedLogger from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

    enhancedLogger.error('Error handled:', {
    error: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    res.status(statusCode).json({
      success: false,
      message: 'Internal Server Error',
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }
};

export const notFoundHandler = (req: Request, res: Response) => {
  enhancedLogger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
};

export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

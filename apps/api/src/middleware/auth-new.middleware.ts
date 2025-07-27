/**
 * 🛡️ AUTHENTICATION MIDDLEWARE
 * ============================
 * JWT token verification and user authentication for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import { realAuthService } from '../services/real-auth.service';
import winston from 'winston';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/auth-middleware.log' }),
    new winston.transports.Console(),
  ],
});

/**
 * 🔐 Require Authentication Middleware
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const verificationResult = await realAuthService.verifyToken(token);

    if (!verificationResult.valid) {
      res.status(401).json({
        success: false,
        message: verificationResult.message || 'Invalid token',
      });
      return;
    }

    // Add user info to request object
    req.user = {
      id: verificationResult.payload!.userId,
      email: verificationResult.payload!.email,
      role: verificationResult.payload!.role,
    };

    logger.info(`Authenticated user: ${req.user.email} for ${req.method} ${req.path}`);
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service error',
    });
  }
};

/**
 * 👑 Require Admin Role Middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'PARTNER') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * ⚖️ Require Lawyer Role Middleware
 */
export const requireLawyer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (!['LAWYER', 'ADMIN', 'PARTNER'].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      message: 'Lawyer access required',
    });
    return;
  }

  next();
};

/**
 * 🔐 Require Specific Roles Middleware Factory
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * 🔒 Optional Authentication Middleware
 * Adds user info if token is present but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verificationResult = await realAuthService.verifyToken(token);

      if (verificationResult.valid) {
        req.user = {
          id: verificationResult.payload!.userId,
          email: verificationResult.payload!.email,
          role: verificationResult.payload!.role,
        };
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    // Continue without authentication for optional auth
    next();
  }
};

// Legacy authenticate function for backward compatibility
export const authenticate = requireAuth;

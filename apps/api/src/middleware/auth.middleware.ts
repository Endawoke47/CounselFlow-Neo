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

// Legacy authenticate function for backward compatibility
export const authenticate = requireAuth;

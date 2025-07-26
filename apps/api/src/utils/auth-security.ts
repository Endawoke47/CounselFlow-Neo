/**
 * Authentication Security Utilities for API
 * Core security functions for authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/environment';

// User interface
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

// JWT Payload interface
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Password Security Functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token Functions
export function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'CounselFlow',
    audience: env.APP_URL,
  } as jwt.SignOptions);
}

export function generateRefreshToken(userId: string): string {
  const payload = { id: userId };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'CounselFlow',
    audience: env.APP_URL,
  } as jwt.SignOptions);
}

export function generateTokens(user: User): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);

  // Calculate expiry in seconds
  const expiresIn = parseExpiry(env.JWT_EXPIRES_IN);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'CounselFlow',
    audience: env.APP_URL,
  }) as JWTPayload;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'CounselFlow',
    audience: env.APP_URL,
  }) as { id: string };
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Password Reset Token Functions
export function generatePasswordResetToken(email: string): string {
  const payload = {
    email,
    type: 'password_reset',
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.PASSWORD_RESET_TOKEN_EXPIRES_IN,
    issuer: 'CounselFlow',
    audience: env.APP_URL,
  } as jwt.SignOptions);
}

export function verifyPasswordResetToken(token: string): { email: string; type: string } {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'CounselFlow',
    audience: env.APP_URL,
  }) as { email: string; type: string };
}

// Validation Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const RegisterSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Login Attempt Tracking
export class LoginAttemptTracker {
  private attempts: Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }> =
    new Map();
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  canAttemptLogin(identifier: string): boolean {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return true;

    if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      return false;
    }

    return attempt.count < this.maxAttempts;
  }

  recordFailedAttempt(identifier: string): void {
    const attempt = this.attempts.get(identifier) || { count: 0, lastAttempt: new Date() };

    attempt.count++;
    attempt.lastAttempt = new Date();

    if (attempt.count >= this.maxAttempts) {
      attempt.lockedUntil = new Date(Date.now() + this.lockoutDuration);
    }

    this.attempts.set(identifier, attempt);
  }

  recordSuccessfulLogin(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getRemainingLockoutTime(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt || !attempt.lockedUntil) return 0;

    const remaining = attempt.lockedUntil.getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // Return seconds
  }
}

// Helper function to parse time expressions to seconds
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default 1 hour

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 3600;
  }
}

// Export instance for global use
export const loginTracker = new LoginAttemptTracker();

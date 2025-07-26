/**
 * 🔐 REAL AUTHENTICATION SERVICE IMPLEMENTATION
 * ===========================================
 * Replaces mock authentication with fully functional system
 * Features: JWT tokens, password hashing, user management, RBAC
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import winston from 'winston';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
  token?: string;
  message?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class RealAuthService {
  private prisma: PrismaClient;
  private logger!: winston.Logger;
  private jwtSecret: string;
  private jwtExpiry: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.jwtSecret = process.env.JWT_SECRET || this.generateSecretKey();
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    this.initializeLogger();
  }

  private initializeLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/auth.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  private generateSecretKey(): string {
    const secret = randomBytes(64).toString('hex');
    this.logger.warn(
      'Generated temporary JWT secret. Set JWT_SECRET environment variable for production.'
    );
    return secret;
  }

  /**
   * 🔐 USER REGISTRATION
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(data);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: data.role || 'USER',
          status: 'ACTIVE',
          isEmailVerified: false, // In real app, send verification email
          timezone: 'UTC',
          languagePreference: 'en',
        },
      });

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      this.logger.info(`User registered successfully: ${user.email}`);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        token,
        message: 'Registration successful',
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  /**
   * 🔑 USER LOGIN
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return { success: false, message: 'Email and password are required' };
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });

      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check account status
      if (user.status !== 'ACTIVE') {
        return { success: false, message: 'Account is inactive. Please contact support.' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      this.logger.info(`User logged in successfully: ${user.email}`);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        token,
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error('Login failed:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  /**
   * 🎫 TOKEN GENERATION
   */
  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
      issuer: 'counselflow-api',
      audience: 'counselflow-client',
    } as jwt.SignOptions);
  }

  /**
   * ✅ TOKEN VERIFICATION
   */
  async verifyToken(
    token: string
  ): Promise<{ valid: boolean; payload?: JWTPayload; message?: string }> {
    try {
      const payload = jwt.verify(token, this.jwtSecret, {
        issuer: 'counselflow-api',
        audience: 'counselflow-client',
      }) as JWTPayload;

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        return { valid: false, message: 'User account is invalid or inactive' };
      }

      return { valid: true, payload };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, message: 'Token has expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, message: 'Invalid token' };
      }

      this.logger.error('Token verification failed:', error);
      return { valid: false, message: 'Token verification failed' };
    }
  }

  /**
   * 📝 GET USER PROFILE
   */
  async getUserProfile(
    userId: string
  ): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          avatarUrl: true,
          bio: true,
          phoneNumber: true,
          timezone: true,
          languagePreference: true,
          isEmailVerified: true,
          isMfaEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      return { success: true, user };
    } catch (error) {
      this.logger.error('Get user profile failed:', error);
      return { success: false, message: 'Failed to retrieve user profile' };
    }
  }

  /**
   * 🔄 UPDATE USER PROFILE
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<RegisterData & { bio?: string; phoneNumber?: string; timezone?: string }>
  ): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(updates.firstName && { firstName: updates.firstName.trim() }),
          ...(updates.lastName && { lastName: updates.lastName.trim() }),
          ...(updates.bio !== undefined && { bio: updates.bio }),
          ...(updates.phoneNumber !== undefined && { phoneNumber: updates.phoneNumber }),
          ...(updates.timezone && { timezone: updates.timezone }),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          bio: true,
          phoneNumber: true,
          timezone: true,
          updatedAt: true,
        },
      });

      this.logger.info(`User profile updated: ${user.email}`);
      return { success: true, user, message: 'Profile updated successfully' };
    } catch (error) {
      this.logger.error('Update user profile failed:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  }

  /**
   * 🔒 CHANGE PASSWORD
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get current user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Validate new password
      if (newPassword.length < 8) {
        return { success: false, message: 'New password must be at least 8 characters long' };
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      });

      this.logger.info(`Password changed for user: ${user.email}`);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      this.logger.error('Change password failed:', error);
      return { success: false, message: 'Failed to change password' };
    }
  }

  /**
   * ✅ INPUT VALIDATION
   */
  private validateRegistrationData(data: RegisterData): { valid: boolean; message?: string } {
    if (!data.firstName || data.firstName.trim().length < 2) {
      return { valid: false, message: 'First name must be at least 2 characters long' };
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      return { valid: false, message: 'Last name must be at least 2 characters long' };
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      return { valid: false, message: 'Valid email address is required' };
    }

    if (!data.password || data.password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (data.role && !['USER', 'LAWYER', 'ADMIN', 'PARTNER'].includes(data.role)) {
      return { valid: false, message: 'Invalid role specified' };
    }

    return { valid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 🧹 CLEANUP
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const realAuthService = new RealAuthService();

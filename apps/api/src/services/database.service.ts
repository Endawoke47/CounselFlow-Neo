/**
 * Database Service
 * Handles all database operations using Prisma ORM
 */

import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/auth-security';
import { logger } from '../utils/logger';

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// User-related database operations
export class UserService {
  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      logger.error('Error fetching user by email', { error, email });
      throw new Error('Database operation failed');
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      logger.error('Error fetching user by ID', { error, id });
      throw new Error('Database operation failed');
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: string;
  }): Promise<User> {
    try {
      // Hash the password
      const passwordHash = await hashPassword(userData.password);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          passwordHash,
          role: userData.role || 'USER',
          status: 'ACTIVE',
          isEmailVerified: false,
        },
      });

      logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
      });

      return user;
    } catch (error: any) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        logger.warn('Attempted to create user with existing email', { email: userData.email });
        throw new Error('User with this email already exists');
      }

      logger.error('Error creating user', { error, email: userData.email });
      throw new Error('Failed to create user');
    }
  }

  /**
   * Verify user password
   */
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return null;
      }

      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return user;
    } catch (error) {
      logger.error('Error verifying password', { error, email });
      throw new Error('Authentication failed');
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date() },
      });
    } catch (error) {
      logger.error('Error updating last login', { error, userId });
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Check if user exists by email
   */
  static async userExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      logger.error('Error checking if user exists', { error, email });
      return false;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(
    userId: string,
    updates: Partial<{
      firstName: string;
      lastName: string;
      phoneNumber: string;
      bio: string;
      avatarUrl: string;
      timezone: string;
      languagePreference: string;
    }>
  ): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });

      logger.info('User profile updated', { userId, updates: Object.keys(updates) });
      return user;
    } catch (error) {
      logger.error('Error updating user profile', { error, userId });
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Delete user (soft delete by setting status to INACTIVE)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'INACTIVE',
          updatedAt: new Date(),
        },
      });

      logger.info('User deactivated', { userId });
    } catch (error) {
      logger.error('Error deactivating user', { error, userId });
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 50
  ): Promise<{
    users: User[];
    total: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          where: { status: { not: 'INACTIVE' } },
        }),
        prisma.user.count({
          where: { status: { not: 'INACTIVE' } },
        }),
      ]);

      const pages = Math.ceil(total / limit);

      return { users, total, pages };
    } catch (error) {
      logger.error('Error fetching all users', { error, page, limit });
      throw new Error('Failed to fetch users');
    }
  }
}

// Token blacklist service for logout functionality
export class TokenService {
  private static blacklistedTokens = new Set<string>();
  private static cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize token cleanup
   */
  static initialize(): void {
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      60 * 60 * 1000
    );
  }

  /**
   * Add token to blacklist
   */
  static blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
    logger.info('Token blacklisted', { tokenLength: token.length });
  }

  /**
   * Check if token is blacklisted
   */
  static isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Clean up expired tokens (simple implementation)
   */
  private static cleanup(): void {
    // In a real implementation, you would check token expiration
    // For now, we'll clear the set periodically to prevent memory leaks
    if (this.blacklistedTokens.size > 10000) {
      this.blacklistedTokens.clear();
      logger.info('Token blacklist cleared due to size limit');
    }
  }

  /**
   * Shutdown cleanup
   */
  static shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Initialize token service
TokenService.initialize();

// Graceful shutdown
process.on('SIGTERM', () => {
  TokenService.shutdown();
  prisma.$disconnect();
});

process.on('SIGINT', () => {
  TokenService.shutdown();
  prisma.$disconnect();
});

export default { UserService, TokenService, prisma };

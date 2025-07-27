// Secure Authentication Routes
// User: Endawoke47
// Date: 2025-07-12 21:00:00 UTC

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { UserService, TokenService } from '../services/database.service';
import { emailService } from '../services/email.service';
import {
  generateTokens,
  generatePasswordResetToken,
  LoginSchema,
  RegisterSchema,
  PasswordResetSchema,
} from '../utils/auth-security';

const router = Router();

// Environment configuration
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  (() => {
    throw new Error('JWT_REFRESH_SECRET environment variable is required');
  })();

// Rate limiting map for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Helper functions for rate limiting

const checkRateLimit = (identifier: string): boolean => {
  const record = loginAttempts.get(identifier);
  if (!record) return true;

  // Check if account is locked
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    return false;
  }

  // Reset if lockout period has passed
  if (record.lockedUntil && record.lockedUntil <= new Date()) {
    loginAttempts.delete(identifier);
    return true;
  }

  return record.count < MAX_LOGIN_ATTEMPTS;
};

const recordFailedAttempt = (identifier: string): void => {
  const record = loginAttempts.get(identifier) || { count: 0, lastAttempt: new Date() };
  record.count++;
  record.lastAttempt = new Date();

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = new Date(Date.now() + LOCKOUT_TIME);
  }

  loginAttempts.set(identifier, record);
};

const recordSuccessfulLogin = (identifier: string): void => {
  loginAttempts.delete(identifier);
};

// Demo user for development (remove in production)
const isDevelopment = process.env.NODE_ENV !== 'production';
const DEMO_USER = isDevelopment
  ? {
      id: 'demo-user-id',
      email: 'demo@counselflow.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: '$2b$12$demo.hash.for.development.only', // This would be a real hash in development
    }
  : null;

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user credentials and return JWT tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 expiresIn:
 *                   type: integer
 *                   description: Token expiration in seconds
 *                   example: 86400
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Login endpoint
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Check rate limiting
    if (!checkRateLimit(email)) {
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Account temporarily locked.',
      });
    }

    // Development-only demo authentication
    if (isDevelopment && DEMO_USER && email === DEMO_USER.email && password === 'demo') {
      const tokens = generateTokens(DEMO_USER);
      recordSuccessfulLogin(email);

      logger.info('Demo user login successful', { email });

      return res.json({
        success: true,
        user: {
          id: DEMO_USER.id,
          email: DEMO_USER.email,
          firstName: DEMO_USER.firstName,
          lastName: DEMO_USER.lastName,
          role: DEMO_USER.role,
          status: DEMO_USER.status,
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      });
    }

    // Database user lookup and password verification
    const user = await UserService.verifyPassword(email, password);
    if (!user) {
      recordFailedAttempt(email);
      logger.warn('Failed login attempt', { email, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if user account is active
    if (user.status !== 'ACTIVE') {
      logger.warn('Login attempt for inactive user', { email, status: user.status });
      return res.status(401).json({
        success: false,
        error: 'Account is not active',
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);
    recordSuccessfulLogin(email);

    logger.info('User login successful', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.flatten().fieldErrors,
      });
    }
    next(error);
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user and send a welcome email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Register endpoint
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: User already exists
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const { email, password, firstName, lastName } = validatedData;

    // Check if registration is enabled
    if (!process.env.ENABLE_REGISTRATION || process.env.ENABLE_REGISTRATION === 'false') {
      return res.status(403).json({
        success: false,
        message: 'Registration is currently disabled',
      });
    }

    // Hash password
    // Hash password before storing
    // The UserService.createUser will handle password hashing internally

    // User creation in database
    try {
      // Check if user already exists
      const existingUser = await UserService.userExists(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
        });
      }

      // Create user in database
      const user = await UserService.createUser({
        email,
        firstName,
        lastName,
        password,
      });

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.firstName);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
        });
      }
      throw error;
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.flatten().fieldErrors,
      });
    }
    next(error);
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Get current user
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // For demo purposes, return the demo user
      if (isDevelopment && DEMO_USER && req.user?.id === 'demo-user-id') {
        return res.json({
          success: true,
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            firstName: DEMO_USER.firstName,
            lastName: DEMO_USER.lastName,
            role: DEMO_USER.role,
            status: DEMO_USER.status,
          },
        });
      }

      // Check if user ID exists
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'User ID not found in token',
        });
      }

      // Fetch user from database
      const user = await UserService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh token
 *     description: Generate a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: New JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: New JWT refresh token
 *                 expiresIn:
 *                   type: integer
 *                   description: Token expiration in seconds
 *                   example: 86400
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Refresh token
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate new access token using valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: New JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: New JWT refresh token
 *                 expiresIn:
 *                   type: integer
 *                   description: Token expiration in seconds
 *                   example: 86400
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid refresh token
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
      issuer: 'CounselFlow',
      audience: process.env.APP_URL || 'http://localhost:3000',
    }) as any;

    // For demo purposes
    if (isDevelopment && DEMO_USER && decoded.id === 'demo-user-id') {
      const tokens = generateTokens(DEMO_USER);
      return res.json({
        success: true,
        token: tokens.accessToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      });
    }

    // Verify user exists in database
    const user = await UserService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    logger.info('Token refreshed successfully', { userId: user.id });

    return res.json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Invalidate the current access token and refresh token
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Logout endpoint
router.post(
  '/logout',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        // Blacklist the current token
        TokenService.blacklistToken(token);
      }

      logger.info('User logout', { userId: req.user?.id });

      return res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Initiate password reset process and send reset link to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: If an account with that email exists, a password reset link has been sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: If an account with that email exists, a password reset link has been sent.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Forgot password
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { email } = PasswordResetSchema.parse(req.body);

    // Check if user exists
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      // Don't reveal whether user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user.id);

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, resetToken);

    logger.info('Password reset initiated', { userId: user.id });

    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

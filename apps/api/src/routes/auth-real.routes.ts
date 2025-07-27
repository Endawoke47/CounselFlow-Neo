/**
 * 🔐 REAL AUTHENTICATION ROUTES
 * ============================
 * Fully functional authentication endpoints with real database integration
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { realAuthService } from '../services/real-auth.service';
import { requireAuth } from '../middleware/auth-new.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const RegisterSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'LAWYER', 'ADMIN', 'PARTNER']).optional(),
});

const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string().optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * 📝 POST /api/auth/register
 * User Registration
 */
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { firstName, lastName, email, password, role } = validation.data;

    // Register user
    const result = await realAuthService.register({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 🔑 POST /api/auth/login
 * User Login
 */
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { email, password } = validation.data;

    // Attempt login
    const result = await realAuthService.login({ email, password });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 👤 GET /api/auth/profile
 * Get User Profile (Protected)
 */
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result = await realAuthService.getUserProfile(req.user.id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: { user: result.user },
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * ✏️ PUT /api/auth/profile
 * Update User Profile (Protected)
 */
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = UpdateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const result = await realAuthService.updateUserProfile(req.user.id, validation.data);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: { user: result.user },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 🔒 PUT /api/auth/change-password
 * Change User Password (Protected)
 */
router.put('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = ChangePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { currentPassword, newPassword } = validation.data;

    const result = await realAuthService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 🔓 POST /api/auth/logout
 * User Logout (Protected) - In stateless JWT, this is mostly client-side
 */
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is primarily handled client-side
    // But we can log the event and potentially blacklist the token if needed

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please remove the token from client storage.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * ✅ GET /api/auth/verify
 * Verify Token (Protected)
 */
router.get('/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 📊 GET /api/auth/status
 * Health check for auth service
 */
router.get('/status', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Authentication service is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

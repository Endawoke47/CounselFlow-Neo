/**
 * 📄 REAL CONTRACT ROUTES IMPLEMENTATION
 * =====================================
 * Fully functional contract management API endpoints
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { realContractService } from '../services/real-contract.service';
import { requireAuth, requireRoles } from '../middleware/auth-new.middleware';

const router = Router();

// ⚡ Rate limiting
const contractRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many contract requests, please try again later',
  },
});

// 📋 Validation schemas
const contractCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  type: z.string().min(1, 'Contract type is required'),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'TERMINATED']).optional(),
  value: z.number().positive().optional(),
  currency: z.string().optional(),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format').optional(),
  terminationDate: z.string().datetime('Invalid termination date format').optional(),
  renewalTerms: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  tags: z.string().optional(),
  clientId: z.string().min(1, 'Client ID is required'),
  assignedLawyerId: z.string().min(1, 'Assigned lawyer ID is required'),
});

const contractUpdateSchema = contractCreateSchema.partial().extend({
  id: z.string().min(1, 'Contract ID is required'),
});

const contractQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  clientId: z.string().optional(),
  assignedLawyerId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// 🛡️ Apply rate limiting and authentication to all routes
router.use(contractRateLimit);
router.use(requireAuth);

/**
 * 📋 GET /contracts - Get all contracts with filtering and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const validatedQuery = contractQuerySchema.parse(req.query);
    const userId = req.user!.id;

    const result = await realContractService.getAllContracts(userId, validatedQuery);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors,
      });
    }

    console.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 📄 GET /contracts/:id - Get specific contract by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contractId = req.params.id;
    const userId = req.user!.id;

    if (!contractId) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID is required',
      });
    }

    const result = await realContractService.getContractById(contractId, userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Get contract by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * ➕ POST /contracts - Create new contract
 */
router.post(
  '/',
  requireRoles(['LAWYER', 'ADMIN', 'PARTNER']),
  async (req: Request, res: Response) => {
    try {
      const validatedData = contractCreateSchema.parse(req.body);
      const userId = req.user!.id;

      const result = await realContractService.createContract(validatedData, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contract data',
          errors: error.errors,
        });
      }

      console.error('Create contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

/**
 * ✏️ PUT /contracts/:id - Update contract
 */
router.put(
  '/:id',
  requireRoles(['LAWYER', 'ADMIN', 'PARTNER']),
  async (req: Request, res: Response) => {
    try {
      const contractId = req.params.id;
      const updateData = { ...req.body, id: contractId };
      const validatedData = contractUpdateSchema.parse(updateData);
      const userId = req.user!.id;

      const result = await realContractService.updateContract(validatedData, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid update data',
          errors: error.errors,
        });
      }

      console.error('Update contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

/**
 * 🗑️ DELETE /contracts/:id - Delete contract
 */
router.delete('/:id', requireRoles(['ADMIN', 'PARTNER']), async (req: Request, res: Response) => {
  try {
    const contractId = req.params.id;
    const userId = req.user!.id;

    if (!contractId) {
      return res.status(400).json({
        success: false,
        message: 'Contract ID is required',
      });
    }

    const result = await realContractService.deleteContract(contractId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Delete contract error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 📊 GET /contracts/dashboard/metrics - Get contract dashboard metrics
 */
router.get('/dashboard/metrics', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await realContractService.getDashboardMetrics(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 📄 GET /contracts/:id/download - Download contract document
 * (Placeholder for future implementation)
 */
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    // TODO: Implement document download functionality
    res.status(501).json({
      success: false,
      message: 'Document download not yet implemented',
    });
  } catch (error) {
    console.error('Download contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 🔍 POST /contracts/:id/analyze - AI Contract Analysis
 * (Placeholder for future AI integration)
 */
router.post(
  '/:id/analyze',
  requireRoles(['LAWYER', 'ADMIN', 'PARTNER']),
  async (req: Request, res: Response) => {
    try {
      // TODO: Implement AI contract analysis
      res.status(501).json({
        success: false,
        message: 'AI contract analysis not yet implemented',
      });
    } catch (error) {
      console.error('Analyze contract error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

export default router;

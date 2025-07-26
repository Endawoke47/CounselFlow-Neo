/**
 * 👥 REAL CLIENT ROUTES IMPLEMENTATION
 * ==========================  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors,
      });
    }

    console.error('Get all clients error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }lly functional client management API endpoints
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { realClientService } from '../services/real-client.service';
import { requireAuth, requireRoles } from '../middleware/auth-new.middleware';

const router = Router();

// ⚡ Rate limiting
const clientRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many client requests, please try again later',
  },
});

// 📋 Validation schemas
const clientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  clientType: z.enum(['INDIVIDUAL', 'CORPORATION', 'NON_PROFIT', 'GOVERNMENT'], {
    required_error: 'Client type is required',
  }),
  industry: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).optional(),
  assignedLawyerId: z.string().min(1, 'Assigned lawyer ID is required'),
});

const clientUpdateSchema = clientCreateSchema.partial().extend({
  id: z.string().min(1, 'Client ID is required'),
});

const clientQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  clientType: z.string().optional(),
  status: z.string().optional(),
  assignedLawyerId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// 🛡️ Apply rate limiting and authentication to all routes
router.use(clientRateLimit);
router.use(requireAuth);

/**
 * 👥 GET /clients - Get all clients with filtering and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const validatedQuery = clientQuerySchema.parse(req.query);
    const userId = req.user!.id;

    const result = await realClientService.getAllClients(userId, validatedQuery);

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

    console.error('Get clients error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 👤 GET /clients/:id - Get specific client by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const userId = req.user!.id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required',
      });
    }

    const result = await realClientService.getClientById(clientId, userId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Get client by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * ➕ POST /clients - Create new client
 */
router.post(
  '/',
  requireRoles(['LAWYER', 'ADMIN', 'PARTNER']),
  async (req: Request, res: Response) => {
    try {
      const validatedData = clientCreateSchema.parse(req.body);
      const userId = req.user!.id;

      const result = await realClientService.createClient(validatedData, userId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid client data',
          errors: error.errors,
        });
      }

      console.error('Create client error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

/**
 * ✏️ PUT /clients/:id - Update client
 */
router.put(
  '/:id',
  requireRoles(['LAWYER', 'ADMIN', 'PARTNER']),
  async (req: Request, res: Response) => {
    try {
      const clientId = req.params.id;
      const updateData = { ...req.body, id: clientId };
      const validatedData = clientUpdateSchema.parse(updateData);
      const userId = req.user!.id;

      const result = await realClientService.updateClient(validatedData, userId);

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

      console.error('Update client error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

/**
 * 🗑️ DELETE /clients/:id - Delete client
 */
router.delete('/:id', requireRoles(['ADMIN', 'PARTNER']), async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const userId = req.user!.id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required',
      });
    }

    const result = await realClientService.deleteClient(clientId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Delete client error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 📊 GET /clients/dashboard/metrics - Get client dashboard metrics
 */
router.get('/dashboard/metrics', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await realClientService.getDashboardMetrics(userId);

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
 * 📄 GET /clients/:id/contracts - Get client contracts
 */
router.get('/:id/contracts', async (req: Request, res: Response) => {
  try {
    // TODO: Implement get client contracts
    // This would use the contract service to get contracts for specific client

    res.status(501).json({
      success: false,
      message: 'Client contracts endpoint not yet implemented',
    });
  } catch (error) {
    console.error('Get client contracts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * ⚖️ GET /clients/:id/matters - Get client matters
 */
router.get('/:id/matters', async (req: Request, res: Response) => {
  try {
    // TODO: Implement get client matters
    // This would use the matter service to get matters for specific client

    res.status(501).json({
      success: false,
      message: 'Client matters endpoint not yet implemented',
    });
  } catch (error) {
    console.error('Get client matters error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * 🗂️ GET /clients/:id/documents - Get client documents
 */
router.get('/:id/documents', async (req: Request, res: Response) => {
  try {
    // TODO: Implement get client documents
    // This would use the document service to get documents for specific client

    res.status(501).json({
      success: false,
      message: 'Client documents endpoint not yet implemented',
    });
  } catch (error) {
    console.error('Get client documents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;




// Legal Workflow Automation API Routes
// Phase 3: Feature 1 - Advanced Workflow Management & Process Automation
// REST API endpoints for workflow management, execution, and analytics

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { WorkflowAutomationService } from '../services/workflow-automation.service';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { rateLimit } from '../middleware/rate-limit.middleware';
import {
  WorkflowType,
  WorkflowStatus,
  WorkflowPriority,
  WorkflowComplexity,
  TriggerType,
  StepType,
  AnalyticsPeriod,
} from '../types/workflow-automation.types';
import { LegalJurisdiction } from '../types/ai.types';
import { LegalArea } from '../types/legal-research.types';

const router = Router();
const workflowService = new WorkflowAutomationService();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    type: z.nativeEnum(WorkflowType),
    category: z.string().min(1).max(100),
    priority: z.nativeEnum(WorkflowPriority).optional().default('MEDIUM'),
    complexity: z.nativeEnum(WorkflowComplexity).optional().default('MODERATE'),
    jurisdiction: z.nativeEnum(LegalJurisdiction).optional(),
    legalArea: z.nativeEnum(LegalArea).optional(),
    version: z.string().optional().default('1.0.0'),
    tags: z.array(z.string()).optional().default([]),
    isActive: z.boolean().optional().default(true),
    isPublic: z.boolean().optional().default(false),
    steps: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          type: z.nativeEnum(StepType),
          isRequired: z.boolean().optional().default(true),
          estimatedDuration: z.number().optional(),
          dependencies: z.array(z.string()).optional(),
          successors: z.array(z.string()).optional(),
          assignedTo: z.array(z.string()).optional(),
          assignedRoles: z.array(z.string()).optional(),
          conditions: z
            .array(
              z.object({
                id: z.string(),
                expression: z.string(),
                description: z.string().optional(),
              })
            )
            .optional(),
          config: z.record(z.any()).optional(),
        })
      )
      .min(1),
    triggers: z
      .array(
        z.object({
          id: z.string(),
          type: z.nativeEnum(TriggerType),
          config: z.record(z.any()).optional(),
        })
      )
      .optional(),
    variables: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'OBJECT', 'ARRAY']),
          defaultValue: z.any().optional(),
          isRequired: z.boolean().optional().default(false),
          description: z.string().optional(),
          validation: z
            .object({
              pattern: z.string().optional(),
              minLength: z.number().optional(),
              maxLength: z.number().optional(),
              min: z.number().optional(),
              max: z.number().optional(),
              allowedValues: z.array(z.any()).optional(),
            })
            .optional(),
        })
      )
      .optional(),
    notifications: z
      .object({
        onStart: z.boolean().optional().default(false),
        onComplete: z.boolean().optional().default(true),
        onError: z.boolean().optional().default(true),
        onApprovalRequired: z.boolean().optional().default(true),
        channels: z.array(z.enum(['EMAIL', 'SMS', 'SLACK', 'TEAMS', 'WEBHOOK'])).optional(),
      })
      .optional(),
    sla: z
      .object({
        maxDuration: z.number().optional(),
        escalationRules: z
          .array(
            z.object({
              condition: z.string(),
              action: z.string(),
              delay: z.number(),
            })
          )
          .optional(),
      })
      .optional(),
  }),
});

const updateWorkflowSchema = z.object({
  params: z.object({
    workflowId: z.string(),
  }),
  body: createWorkflowSchema.shape.body.partial(),
});

const executeWorkflowSchema = z.object({
  body: z.object({
    workflowId: z.string(),
    triggerType: z.nativeEnum(TriggerType).optional().default('MANUAL_START'),
    priority: z.nativeEnum(WorkflowPriority).optional().default('MEDIUM'),
    variables: z.record(z.any()).optional().default({}),
    metadata: z.record(z.any()).optional(),
    context: z
      .object({
        userId: z.string().optional(),
        userRoles: z.array(z.string()).optional(),
        organizationId: z.string().optional(),
        teamId: z.string().optional(),
        caseId: z.string().optional(),
        clientId: z.string().optional(),
        matterId: z.string().optional(),
        documentIds: z.array(z.string()).optional(),
        sessionId: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        customData: z.record(z.any()).optional(),
      })
      .optional(),
  }),
});

const getWorkflowsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(WorkflowType).optional(),
    status: z.nativeEnum(WorkflowStatus).optional(),
    category: z.string().optional(),
    jurisdiction: z.nativeEnum(LegalJurisdiction).optional(),
    legalArea: z.nativeEnum(LegalArea).optional(),
    createdBy: z.string().optional(),
    isActive: z
      .string()
      .transform(val => val === 'true')
      .optional(),
    limit: z
      .string()
      .transform(val => parseInt(val))
      .optional(),
    offset: z
      .string()
      .transform(val => parseInt(val))
      .optional(),
  }),
});

const getAnalyticsSchema = z.object({
  query: z.object({
    workflowIds: z
      .string()
      .transform(val => val.split(','))
      .optional(),
    period: z.nativeEnum(AnalyticsPeriod).optional().default('LAST_30_DAYS'),
    includeStepAnalytics: z
      .string()
      .transform(val => val === 'true')
      .optional()
      .default(false),
    includeTrends: z
      .string()
      .transform(val => val === 'true')
      .optional()
      .default(false),
  }),
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Rate limiting for workflow operations
const workflowRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many workflow requests from this IP, please try again later',
});

const executionRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 executions per windowMs
  message: 'Too many workflow executions from this IP, please try again later',
});

// ============================================================================
// WORKFLOW DEFINITION ROUTES
// ============================================================================

/**
 * @route   POST /api/workflows
 * @desc    Create a new workflow definition
 * @access  Private (requires authentication)
 */
router.post(
  '/',
  authenticate,
  authorize(['workflow:create']),
  workflowRateLimit,
  validateRequest(createWorkflowSchema),
  async (req: Request, res: Response) => {
    try {
      const { body } = req as any;
      const userId = (req as any).user?.id;

      const workflow = await workflowService.createWorkflow({
        ...body,
        createdBy: userId,
        organizationId: (req as any).user?.organizationId,
      });

      res.status(201).json({
        success: true,
        data: workflow,
        message: 'Workflow created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workflow',
      });
    }
  }
);

/**
 * @route   GET /api/workflows
 * @desc    List workflows with filtering and pagination
 * @access  Private (requires authentication)
 */
router.get(
  '/',
  authenticate,
  authorize(['workflow:read']),
  validateRequest(getWorkflowsSchema),
  async (req: Request, res: Response) => {
    try {
      const { query } = req as any;
      const organizationId = (req as any).user?.organizationId;

      const result = await workflowService.listWorkflows({
        ...query,
        createdBy: query.createdBy || (req as any).user?.id, // Filter by user if not admin
      });

      res.json({
        success: true,
        data: result.workflows,
        meta: {
          total: result.total,
          limit: query.limit,
          offset: query.offset,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflows',
      });
    }
  }
);

/**
 * @route   GET /api/workflows/:workflowId
 * @desc    Get a specific workflow by ID
 * @access  Private (requires authentication)
 */
router.get(
  '/:workflowId',
  authenticate,
  authorize(['workflow:read']),
  async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;
      const workflow = await workflowService.getWorkflow(workflowId);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
      }

      res.json({
        success: true,
        data: workflow,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflow',
      });
    }
  }
);

/**
 * @route   PUT /api/workflows/:workflowId
 * @desc    Update a workflow definition
 * @access  Private (requires authentication)
 */
router.put(
  '/:workflowId',
  authenticate,
  authorize(['workflow:update']),
  workflowRateLimit,
  validateRequest(updateWorkflowSchema),
  async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;
      const { body } = req as any;

      const workflow = await workflowService.updateWorkflow(workflowId, body);

      res.json({
        success: true,
        data: workflow,
        message: 'Workflow updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workflow',
      });
    }
  }
);

/**
 * @route   DELETE /api/workflows/:workflowId
 * @desc    Delete a workflow definition
 * @access  Private (requires authentication)
 */
router.delete(
  '/:workflowId',
  authenticate,
  authorize(['workflow:delete']),
  async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;
      const success = await workflowService.deleteWorkflow(workflowId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
      }

      res.json({
        success: true,
        message: 'Workflow deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete workflow',
      });
    }
  }
);

// ============================================================================
// WORKFLOW EXECUTION ROUTES
// ============================================================================

/**
 * @route   POST /api/workflows/execute
 * @desc    Execute a workflow
 * @access  Private (requires authentication)
 */
router.post(
  '/execute',
  authenticate,
  authorize(['workflow:execute']),
  executionRateLimit,
  validateRequest(executeWorkflowSchema),
  async (req: Request, res: Response) => {
    try {
      const { body } = req as any;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles || [];
      const organizationId = (req as any).user?.organizationId;

      // Enhance context with user information
      const executionRequest = {
        ...body,
        context: {
          ...body.context,
          userId,
          userRoles,
          organizationId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      };

      const result = await workflowService.executeWorkflow(executionRequest);

      res.status(201).json({
        success: true,
        data: result,
        message:
          result.status === 'ERROR' ? 'Workflow execution failed' : 'Workflow execution started',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute workflow',
      });
    }
  }
);

/**
 * @route   GET /api/workflows/executions/:executionId
 * @desc    Get workflow execution status
 * @access  Private (requires authentication)
 */
router.get(
  '/executions/:executionId',
  authenticate,
  authorize(['workflow:read']),
  async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const execution = await workflowService.getExecutionStatus(executionId);

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found',
        });
      }

      res.json({
        success: true,
        data: execution,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch execution status',
      });
    }
  }
);

/**
 * @route   POST /api/workflows/executions/:executionId/cancel
 * @desc    Cancel a running workflow execution
 * @access  Private (requires authentication)
 */
router.post(
  '/executions/:executionId/cancel',
  authenticate,
  authorize(['workflow:execute']),
  async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const success = await workflowService.cancelExecution(executionId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found or cannot be cancelled',
        });
      }

      res.json({
        success: true,
        message: 'Execution cancelled successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel execution',
      });
    }
  }
);

/**
 * @route   POST /api/workflows/executions/:executionId/retry
 * @desc    Retry a failed workflow execution
 * @access  Private (requires authentication)
 */
router.post(
  '/executions/:executionId/retry',
  authenticate,
  authorize(['workflow:execute']),
  async (req: Request, res: Response) => {
    try {
      const { executionId } = req.params;
      const result = await workflowService.retryExecution(executionId);

      res.json({
        success: true,
        data: result,
        message: result.status === 'ERROR' ? 'Retry failed' : 'Execution retried successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retry execution',
      });
    }
  }
);

// ============================================================================
// WORKFLOW ANALYTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/workflows/analytics
 * @desc    Get workflow analytics and performance metrics
 * @access  Private (requires authentication)
 */
router.get(
  '/analytics',
  authenticate,
  authorize(['workflow:analytics']),
  validateRequest(getAnalyticsSchema),
  async (req: Request, res: Response) => {
    try {
      const { query } = req as any;

      const analyticsRequest = {
        workflowIds: query.workflowIds,
        period: query.period,
        includeStepAnalytics: query.includeStepAnalytics,
        includeTrends: query.includeTrends,
      };

      const analytics = await workflowService.getWorkflowAnalytics(analyticsRequest);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      });
    }
  }
);

/**
 * @route   GET /api/workflows/:workflowId/analytics
 * @desc    Get analytics for a specific workflow
 * @access  Private (requires authentication)
 */
router.get(
  '/:workflowId/analytics',
  authenticate,
  authorize(['workflow:analytics']),
  async (req: Request, res: Response) => {
    try {
      const { workflowId } = req.params;
      const period = (req.query.period as AnalyticsPeriod) || AnalyticsPeriod.LAST_30_DAYS;

      const analytics = await workflowService.getWorkflowAnalytics({
        workflowIds: [workflowId],
        period,
      });

      if (!analytics.analytics || analytics.analytics.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Workflow analytics not found',
        });
      }

      res.json({
        success: true,
        data: analytics.analytics[0],
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflow analytics',
      });
    }
  }
);

// ============================================================================
// WORKFLOW TEMPLATES ROUTES
// ============================================================================

/**
 * @route   GET /api/workflows/templates
 * @desc    Get available workflow templates
 * @access  Private (requires authentication)
 */
router.get(
  '/templates',
  authenticate,
  authorize(['workflow:read']),
  async (req: Request, res: Response) => {
    try {
      // For now, return empty array as templates are stored internally
      // In a full implementation, this would fetch from the templates collection
      res.json({
        success: true,
        data: [],
        message: 'Templates feature will be available in the next update',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
      });
    }
  }
);

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

/**
 * @route   GET /api/workflows/health
 * @desc    Health check for workflow service
 * @access  Public
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Workflow Automation Service',
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;

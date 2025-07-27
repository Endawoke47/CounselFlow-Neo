/**
 * AI Contract Analysis Routes
 * Provides REST API endpoints for AI-powered contract analysis
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth-new.middleware';
import { AIContractAnalysisService } from '../services/ai-contract-analysis.service';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();
const aiContractService = new AIContractAnalysisService();

// Validation schemas
const contractAnalysisSchema = z.object({
  contractText: z.string().min(100, 'Contract text must be at least 100 characters'),
  contractType: z.string().optional().default('general'),
});

const clauseExtractionSchema = z.object({
  contractText: z.string().min(100, 'Contract text must be at least 100 characters'),
});

const contractComparisonSchema = z.object({
  contract1: z.string().min(100, 'Contract 1 text must be at least 100 characters'),
  contract2: z.string().min(100, 'Contract 2 text must be at least 100 characters'),
  focusAreas: z.array(z.string()).optional(),
});

const contractSummarySchema = z.object({
  contractText: z.string().min(100, 'Contract text must be at least 100 characters'),
});

/**
 * @route POST /api/ai/contracts/analyze-risk
 * @desc Analyze contract for legal risks and compliance issues
 * @access Private
 */
router.post(
  '/analyze-risk',
  requireAuth,
  validateRequest(contractAnalysisSchema),
  async (req, res) => {
    try {
      const { contractText, contractType } = req.body;
      const userId = req.user?.id || 'anonymous';

      const analysis = await aiContractService.analyzeContractRisk(
        contractText,
        contractType,
        userId
      );

      res.json({
        success: true,
        message: 'Contract risk analysis completed successfully',
        data: { analysis },
      });
    } catch (error: any) {
      console.error('Contract risk analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze contract risk',
        error: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ai/contracts/extract-clauses
 * @desc Extract and analyze contract clauses
 * @access Private
 */
router.post(
  '/extract-clauses',
  requireAuth,
  validateRequest(clauseExtractionSchema),
  async (req, res) => {
    try {
      const { contractText } = req.body;
      const userId = req.user?.id || 'anonymous';

      const extraction = await aiContractService.extractContractClauses(contractText, userId);

      res.json({
        success: true,
        message: 'Contract clause extraction completed successfully',
        data: { extraction },
      });
    } catch (error: any) {
      console.error('Clause extraction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extract contract clauses',
        error: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ai/contracts/compare
 * @desc Compare two contracts and identify differences
 * @access Private
 */
router.post(
  '/compare',
  requireAuth,
  validateRequest(contractComparisonSchema),
  async (req, res) => {
    try {
      const { contract1, contract2, focusAreas } = req.body;
      const userId = req.user?.id || 'anonymous';

      const comparison = await aiContractService.compareContracts(
        contract1,
        contract2,
        userId,
        focusAreas
      );

      res.json({
        success: true,
        message: 'Contract comparison completed successfully',
        data: { comparison },
      });
    } catch (error: any) {
      console.error('Contract comparison error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to compare contracts',
        error: error.message,
      });
    }
  }
);

/**
 * @route POST /api/ai/contracts/summarize
 * @desc Generate comprehensive contract summary
 * @access Private
 */
router.post('/summarize', requireAuth, validateRequest(contractSummarySchema), async (req, res) => {
  try {
    const { contractText } = req.body;
    const userId = req.user?.id || 'anonymous';

    const summary = await aiContractService.generateContractSummary(contractText, userId);

    res.json({
      success: true,
      message: 'Contract summary generated successfully',
      data: { summary },
    });
  } catch (error: any) {
    console.error('Contract summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate contract summary',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/ai/contracts/capabilities
 * @desc Get AI contract analysis capabilities and supported features
 * @access Private
 */
router.get('/capabilities', requireAuth, async (req, res) => {
  try {
    const capabilities = {
      supportedAnalysisTypes: [
        'risk_assessment',
        'clause_extraction',
        'contract_comparison',
        'contract_summary',
      ],
      supportedContractTypes: [
        'service_agreement',
        'employment_contract',
        'lease_agreement',
        'nda',
        'partnership_agreement',
        'licensing_agreement',
        'general',
      ],
      supportedLanguages: ['english'],
      supportedJurisdictions: ['kenya', 'international'],
      features: {
        riskAnalysis: {
          enabled: true,
          description: 'Comprehensive legal risk assessment with scoring',
        },
        clauseExtraction: {
          enabled: true,
          description: 'Automatic identification and categorization of contract clauses',
        },
        contractComparison: {
          enabled: true,
          description: 'Side-by-side contract analysis with difference highlighting',
        },
        contractSummary: {
          enabled: true,
          description: 'Executive summary generation for business stakeholders',
        },
      },
      limitations: [
        'Analysis quality depends on contract text clarity',
        'Complex multi-party agreements may require manual review',
        'Recommendations are advisory and not legal advice',
      ],
    };

    res.json({
      success: true,
      message: 'AI contract analysis capabilities retrieved successfully',
      data: { capabilities },
    });
  } catch (error: any) {
    console.error('Capabilities retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve capabilities',
      error: error.message,
    });
  }
});

export default router;

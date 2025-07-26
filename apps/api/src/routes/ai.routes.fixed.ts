// Enhanced AI Routes - Full Legal AI Platform
import { Router } from 'express';
import { z } from 'zod';
import { AIGatewayService } from '../services/ai-gateway.service';
import {
  aiRequestSchema,
  AIAnalysisType,
  LegalJurisdiction,
  SupportedLanguage,
  LegalSystem,
} from '../types/ai.types';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();
const aiGateway = new AIGatewayService();

// Apply authentication to all AI routes
router.use(authenticate);

// Main AI Analysis Endpoint
router.post('/analyze', async (req: AuthenticatedRequest, res) => {
  try {
    const validatedRequest = aiRequestSchema.parse(req.body);
    const userId = req.user?.id || 'anonymous';

    const result = await aiGateway.processRequest(validatedRequest, userId);

    res.json({
      success: true,
      data: result,
      metadata: {
        processingTime: result.processingTime,
        provider: result.provider,
        model: result.model,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        cached: result.cached,
      },
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
    });
  }
});

// Contract Analysis Endpoint
router.post('/contract/analyze', async (req: AuthenticatedRequest, res) => {
  try {
    const contractSchema = z.object({
      contract: z.any(),
      jurisdiction: z.nativeEnum(LegalJurisdiction).optional(),
      language: z.nativeEnum(SupportedLanguage).optional(),
      confidentialityLevel: z.enum(['public', 'confidential', 'privileged']).optional(),
    });

    const { contract, jurisdiction, language, confidentialityLevel } = contractSchema.parse(
      req.body
    );

    const request = {
      type: AIAnalysisType.CONTRACT_ANALYSIS,
      input: contract,
      context: {
        jurisdiction: jurisdiction || LegalJurisdiction.NIGERIA,
        legalSystem: LegalSystem.COMMON_LAW,
        language: language || SupportedLanguage.ENGLISH,
        practiceArea: 'contract_law',
        confidentialityLevel: confidentialityLevel || 'confidential',
      },
    };

    const result = await aiGateway.processRequest(request, req.user?.id || 'anonymous');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Contract analysis failed',
    });
  }
});

// Legal Research Endpoint
router.post('/research', async (req: AuthenticatedRequest, res) => {
  try {
    const researchSchema = z.object({
      query: z.string(),
      jurisdiction: z.nativeEnum(LegalJurisdiction),
      practiceArea: z.string().optional(),
      language: z.nativeEnum(SupportedLanguage).optional(),
    });

    const { query, jurisdiction, practiceArea, language } = researchSchema.parse(req.body);

    const request = {
      type: AIAnalysisType.LEGAL_RESEARCH,
      input: { query, practiceArea },
      context: {
        jurisdiction,
        legalSystem: LegalSystem.MIXED_SYSTEM,
        language: language || SupportedLanguage.ENGLISH,
        practiceArea: practiceArea || 'general',
        confidentialityLevel: 'public' as const,
      },
    };

    const result = await aiGateway.processRequest(request, req.user?.id || 'anonymous');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Research failed',
    });
  }
});

// Helper Routes
router.get('/jurisdictions', (req: AuthenticatedRequest, res) => {
  const jurisdictions = Object.values(LegalJurisdiction);
  res.json({
    success: true,
    data: jurisdictions,
  });
});

router.get('/languages', (req: AuthenticatedRequest, res) => {
  const languages = Object.values(SupportedLanguage);
  res.json({
    success: true,
    data: languages,
  });
});

// Health Check
router.get('/health', async (req: AuthenticatedRequest, res) => {
  try {
    const health = await aiGateway.healthCheck();
    res.json({
      success: true,
      data: {
        status: 'healthy',
        providers: health,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
    });
  }
});

export default router;

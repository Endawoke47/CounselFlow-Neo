// Legal Intelligence API Routes
// Phase 2: Feature 3 - REST API Endpoints for Legal Intelligence Dashboard

import { Router, Request, Response } from 'express';
import { LegalIntelligenceService } from '../services/legal-intelligence.service';
import {
  LegalIntelligenceRequest,
  IntelligenceType,
  AnalyticsPeriod,
  VisualizationType,
} from '../types/legal-intelligence.types';
import { LegalJurisdiction, SupportedLanguage } from '../types/ai.types';
import { LegalArea } from '../types/legal-research.types';

// Initialize service
const legalIntelligenceService = new LegalIntelligenceService();
const router = Router();

// Rate limiting middleware (simplified for basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimit = (req: Request, res: Response, next: Function) => {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 20; // 20 requests per 15 minutes

  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + windowMs,
    });
    next();
  } else if (clientData.count < maxRequests) {
    clientData.count++;
    next();
  } else {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
    });
  }
};

// Validation middleware
const validateRequest = (req: Request, res: Response, next: Function) => {
  try {
    const { analysisTypes, jurisdictions, legalAreas, period, customDateRange } = req.body;

    // Validate required fields
    if (!analysisTypes || !Array.isArray(analysisTypes) || analysisTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'analysisTypes is required and must be a non-empty array',
      });
    }

    if (!jurisdictions || !Array.isArray(jurisdictions) || jurisdictions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'jurisdictions is required and must be a non-empty array',
      });
    }

    if (!legalAreas || !Array.isArray(legalAreas) || legalAreas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'legalAreas is required and must be a non-empty array',
      });
    }

    // Validate custom date range
    if (period === AnalyticsPeriod.CUSTOM_RANGE) {
      if (!customDateRange || !customDateRange.startDate || !customDateRange.endDate) {
        return res.status(400).json({
          success: false,
          error:
            'customDateRange with startDate and endDate is required when period is CUSTOM_RANGE',
        });
      }

      const startDate = new Date(customDateRange.startDate);
      const endDate = new Date(customDateRange.endDate);

      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date range: startDate must be before endDate',
        });
      }
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid request format',
    });
  }
};

// POST /analyze - Comprehensive legal intelligence analysis
router.post('/analyze', rateLimit, validateRequest, async (req: Request, res: Response) => {
  try {
    const request: LegalIntelligenceRequest = req.body;

    const result = await legalIntelligenceService.analyzeLegalIntelligence(request);

    res.json({
      success: true,
      data: result,
      metadata: {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        executionTime: result.metadata.executionTime,
        dataPoints: result.metadata.coverage.sampleSize,
        confidence: result.metadata.accuracy.overall,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Legal intelligence analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform legal intelligence analysis',
    });
  }
});

// POST /trends - Trend analysis
router.post('/trends', rateLimit, async (req: Request, res: Response) => {
  try {
    const {
      jurisdictions = [LegalJurisdiction.NIGERIA],
      legalAreas = [LegalArea.CORPORATE],
      period = AnalyticsPeriod.LAST_6_MONTHS,
      language = SupportedLanguage.ENGLISH,
    } = req.body;

    const request: LegalIntelligenceRequest = {
      analysisTypes: [IntelligenceType.TREND_ANALYSIS],
      jurisdictions,
      legalAreas,
      period,
      filters: {},
      insights: {
        includeRecommendations: false,
        includePredictions: false,
        includeComparisons: false,
        includeTrends: true,
        includeAlerts: false,
        detailLevel: 'summary',
        visualizations: [],
      },
      language,
      confidentialityLevel: 'public',
    };

    const result = await legalIntelligenceService.analyzeLegalIntelligence(request);

    res.json({
      success: true,
      data: {
        trends: result.trendAnalysis,
        insights: result.keyInsights.filter(insight => insight.category === 'legal_trends'),
        visualizations: result.visualizations,
      },
      metadata: {
        trendsFound: result.trendAnalysis?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform trend analysis',
    });
  }
});

// POST /predictions - Predictive analysis
router.post('/predictions', rateLimit, async (req: Request, res: Response) => {
  try {
    const {
      jurisdictions = [LegalJurisdiction.NIGERIA],
      legalAreas = [LegalArea.CORPORATE],
      language = SupportedLanguage.ENGLISH,
    } = req.body;

    const request: LegalIntelligenceRequest = {
      analysisTypes: [IntelligenceType.PREDICTIVE_MODELING],
      jurisdictions,
      legalAreas,
      period: AnalyticsPeriod.LAST_6_MONTHS,
      filters: {},
      insights: {
        includeRecommendations: true,
        includePredictions: true,
        includeComparisons: false,
        includeTrends: false,
        includeAlerts: true,
        detailLevel: 'detailed',
        visualizations: [],
      },
      language,
      confidentialityLevel: 'public',
    };

    const result = await legalIntelligenceService.analyzeLegalIntelligence(request);

    res.json({
      success: true,
      data: {
        predictions: result.predictiveInsights,
        recommendations: result.recommendations,
        alerts: result.alerts,
        insights: result.keyInsights.filter(insight => insight.category === 'case_outcomes'),
      },
      metadata: {
        predictionsGenerated: result.predictiveInsights?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Predictive analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform predictive analysis',
    });
  }
});

// GET /capabilities - System capabilities
router.get('/capabilities', (req: Request, res: Response) => {
  try {
    const capabilities = {
      analysisTypes: Object.values(IntelligenceType),
      supportedJurisdictions: Object.values(LegalJurisdiction),
      supportedLegalAreas: Object.values(LegalArea),
      analyticsPeriods: Object.values(AnalyticsPeriod),
      visualizationTypes: Object.values(VisualizationType),
      supportedLanguages: Object.values(SupportedLanguage),
      rateLimits: {
        requestsPerHour: 80,
        requestsPerDay: 500,
        windowMinutes: 15,
        maxPerWindow: 20,
      },
      features: {
        trendAnalysis: true,
        predictiveModeling: true,
        comparativeAnalysis: true,
        riskIntelligence: true,
        marketIntelligence: true,
        regulatoryIntelligence: true,
        realTimeAlerts: true,
        customVisualizations: true,
        multiLanguageSupport: true,
        jurisdictionSpecific: true,
      },
    };

    res.json({
      success: true,
      data: capabilities,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Capabilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system capabilities',
    });
  }
});

export { router };
export default router;

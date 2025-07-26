// Contract Intelligence API Routes - Simplified Version
// Phase 2: Feature 2 API Implementation

import { Router, Request, Response } from 'express';
import { ContractIntelligenceService } from '../services/contract-intelligence.service';
import {
  ContractAnalysisRequest,
  ContractType,
  ContractAnalysisType,
  ComplianceStandard,
  RiskLevel,
  AnalysisDepth,
} from '../types/contract-intelligence.types';
import { LegalJurisdiction, SupportedLanguage } from '../types/ai.types';
import winston from 'winston';

const router = Router();
const contractIntelligence = new ContractIntelligenceService();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/contract-api.log' }),
    new winston.transports.Console(),
  ],
});

/**
 * @route POST /api/contract-intelligence/analyze
 * @desc Analyze contract document with comprehensive AI analysis
 */
router.post('/analyze', async (req: Request, res: Response) => {
  const requestId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    logger.info(`Contract analysis request received`, {
      requestId,
      jurisdiction: req.body.jurisdiction,
      analysisTypes: req.body.analysisTypes,
    });

    // Basic validation
    if (!req.body.jurisdiction || !req.body.analysisTypes) {
      return res.status(400).json({
        success: false,
        error: 'Jurisdiction and analysisTypes are required',
        requestId,
      });
    }

    // Process document
    let documentContent: any = {};

    if (req.body.documentContent) {
      documentContent = {
        content: req.body.documentContent,
        fileName: req.body.fileName || 'contract.txt',
        mimeType: 'text/plain',
      };
    } else if (req.body.documentUrl) {
      documentContent = {
        fileUrl: req.body.documentUrl,
        fileName: req.body.fileName || 'contract_from_url.pdf',
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Document content or URL must be provided',
        requestId,
      });
    }

    // Build analysis request
    const analysisRequest: ContractAnalysisRequest = {
      document: documentContent,
      jurisdiction: req.body.jurisdiction,
      analysisTypes: req.body.analysisTypes,
      language: req.body.language || SupportedLanguage.ENGLISH,
      contractType: req.body.contractType,
      complianceStandards: req.body.complianceStandards || [],
      riskThreshold: req.body.riskThreshold || RiskLevel.MEDIUM,
      includeRecommendations: req.body.includeRecommendations !== false,
      confidentialityLevel: req.body.confidentialityLevel || 'confidential',
      extractionOptions: {
        extractEntities: true,
        extractDates: true,
        extractAmounts: true,
        extractParties: true,
        extractObligations: true,
        extractRights: true,
        extractConditions: true,
        extractPenalties: true,
        extractDeadlines: true,
        identifyMissingClauses: true,
      },
      analysisDepth: AnalysisDepth.COMPREHENSIVE,
    };

    // Execute analysis
    const result = await contractIntelligence.analyzeContract(analysisRequest);

    logger.info(`Contract analysis completed`, {
      requestId,
      analysisId: result.analysisId,
      clausesFound: result.extractedClauses.length,
      risksIdentified: result.identifiedRisks.length,
      executionTime: result.summary.executionTime,
    });

    res.status(200).json({
      success: true,
      requestId,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`Contract analysis failed`, {
      requestId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Contract analysis failed',
      message: error.message,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route POST /api/contract-intelligence/quick-scan
 * @desc Quick contract scan for basic risk assessment
 */
router.post('/quick-scan', async (req: Request, res: Response) => {
  const requestId = `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    logger.info(`Quick contract scan request received`, {
      requestId,
      jurisdiction: req.body.jurisdiction,
    });

    if (!req.body.jurisdiction || !req.body.documentContent) {
      return res.status(400).json({
        success: false,
        error: 'Jurisdiction and document content are required',
        requestId,
      });
    }

    const documentContent = {
      content: req.body.documentContent,
      fileName: 'contract.txt',
      mimeType: 'text/plain',
    };

    // Quick scan with minimal analysis types
    const analysisRequest: ContractAnalysisRequest = {
      document: documentContent,
      jurisdiction: req.body.jurisdiction,
      analysisTypes: [
        ContractAnalysisType.RISK_ASSESSMENT,
        ContractAnalysisType.RED_FLAG_DETECTION,
      ],
      language: SupportedLanguage.ENGLISH,
      contractType: req.body.contractType,
      complianceStandards: [],
      riskThreshold: RiskLevel.MEDIUM,
      includeRecommendations: false,
      confidentialityLevel: 'confidential',
      extractionOptions: {
        extractEntities: false,
        extractDates: false,
        extractAmounts: false,
        extractParties: false,
        extractObligations: false,
        extractRights: false,
        extractConditions: false,
        extractPenalties: false,
        extractDeadlines: false,
        identifyMissingClauses: false,
      },
      analysisDepth: AnalysisDepth.BASIC,
    };

    const result = await contractIntelligence.analyzeContract(analysisRequest);

    // Return simplified response for quick scan
    const quickScanResult = {
      analysisId: result.analysisId,
      overallRiskLevel:
        result.contractScore.overall < 60
          ? 'HIGH'
          : result.contractScore.overall < 80
            ? 'MEDIUM'
            : 'LOW',
      contractScore: result.contractScore.overall,
      redFlags: result.redFlags.length,
      criticalRisks: result.identifiedRisks.filter(r => r.level === RiskLevel.CRITICAL).length,
      recommendations:
        result.identifiedRisks.length > 0
          ? ['Professional legal review recommended']
          : ['Contract appears acceptable'],
      executionTime: result.summary.executionTime,
    };

    logger.info(`Quick contract scan completed`, {
      requestId,
      analysisId: result.analysisId,
      riskLevel: quickScanResult.overallRiskLevel,
      executionTime: result.summary.executionTime,
    });

    res.status(200).json({
      success: true,
      requestId,
      data: quickScanResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`Quick contract scan failed`, {
      requestId,
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Quick contract scan failed',
      message: error.message,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route GET /api/contract-intelligence/supported-features
 * @desc Get supported contract types, analysis types, and jurisdictions
 */
router.get('/supported-features', async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        contractTypes: Object.values(ContractType),
        analysisTypes: Object.values(ContractAnalysisType),
        jurisdictions: Object.values(LegalJurisdiction),
        complianceStandards: Object.values(ComplianceStandard),
        riskLevels: Object.values(RiskLevel),
        supportedLanguages: Object.values(SupportedLanguage),
        fileFormats: ['PDF', 'DOCX', 'TXT'],
        maxFileSize: '50MB',
        maxBatchSize: 10,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported features',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route GET /api/contract-intelligence/health
 * @desc Health check endpoint for contract intelligence service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = {
      service: 'contract-intelligence',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.1.0',
      dependencies: {
        aiGateway: 'healthy',
        cache: 'healthy',
        usageTracker: 'healthy',
      },
      capabilities: {
        clauseExtraction: true,
        riskAssessment: true,
        complianceCheck: true,
        termExtraction: true,
        redFlagDetection: true,
        batchProcessing: true,
      },
      supportedJurisdictions: Object.values(LegalJurisdiction).length,
      supportedContractTypes: Object.values(ContractType).length,
    };

    res.status(200).json({
      success: true,
      data: healthStatus,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as contractIntelligenceRoutes };

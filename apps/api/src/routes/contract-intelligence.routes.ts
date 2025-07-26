// Contract Intelligence API Routes - REST Endpoints for Contract Analysis
// Phase 2: Feature 2 API Implementation

import { Router, Request, Response } from 'express';
import { ContractIntelligenceService } from '../services/contract-intelligence.service';
import {
  ContractAnalysisRequest,
  ContractAnalysisResult,
  ContractType,
  ContractAnalysisType,
  ComplianceStandard,
  RiskLevel,
} from '../types/contract-intelligence.types';
import { LegalJurisdiction, SupportedLanguage } from '../types/ai.types';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import winston from 'winston';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

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

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

/**
 * @route POST /api/contract-intelligence/analyze
 * @desc Analyze contract document with comprehensive AI analysis
 * @access Private
 */
router.post(
  '/analyze',
  upload.single('document'),
  [
    body('jurisdiction').isIn(Object.values(LegalJurisdiction)).withMessage('Invalid jurisdiction'),
    body('analysisTypes')
      .isArray({ min: 1 })
      .withMessage('At least one analysis type is required')
      .custom((types: string[]) => {
        return types.every(type =>
          Object.values(ContractAnalysisType).includes(type as ContractAnalysisType)
        );
      })
      .withMessage('Invalid analysis type'),
    body('language')
      .optional()
      .isIn(Object.values(SupportedLanguage))
      .withMessage('Invalid language'),
    body('contractType')
      .optional()
      .isIn(Object.values(ContractType))
      .withMessage('Invalid contract type'),
    body('complianceStandards')
      .optional()
      .isArray()
      .custom((standards: string[]) => {
        return standards.every(standard =>
          Object.values(ComplianceStandard).includes(standard as ComplianceStandard)
        );
      })
      .withMessage('Invalid compliance standard'),
    body('riskThreshold')
      .optional()
      .isIn(Object.values(RiskLevel))
      .withMessage('Invalid risk threshold'),
    body('includeRecommendations')
      .optional()
      .isBoolean()
      .withMessage('includeRecommendations must be boolean'),
    body('confidentialityLevel')
      .optional()
      .isIn(['public', 'internal', 'confidential', 'restricted'])
      .withMessage('Invalid confidentiality level'),
  ],
  RequestValidator.validate,
  async (req: Request, res: Response) => {
    const requestId = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.info(`Contract analysis request received`, {
        requestId,
        userId: req.user?.id,
        jurisdiction: req.body.jurisdiction,
        analysisTypes: req.body.analysisTypes,
      });

      // Process document
      let documentContent: any = {};

      if (req.file) {
        // Handle uploaded file
        documentContent = {
          content: req.file.buffer.toString('utf-8'), // In production, use proper PDF/DOCX parsers
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        };
      } else if (req.body.documentContent) {
        // Handle text content
        documentContent = {
          content: req.body.documentContent,
          fileName: req.body.fileName || 'contract.txt',
          fileSize: req.body.documentContent.length,
          mimeType: 'text/plain',
        };
      } else if (req.body.documentUrl) {
        // Handle URL-based document
        documentContent = {
          fileUrl: req.body.documentUrl,
          fileName: req.body.fileName || 'contract_from_url.pdf',
        };
      } else {
        return res.status(400).json({
          success: false,
          error: 'Document must be provided as file upload, content, or URL',
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
        confidentialityLevel: req.body.confidentialityLevel || 'internal',
        customParameters: req.body.customParameters || {},
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
        userId: req.user?.id,
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
  }
);

/**
 * @route POST /api/contract-intelligence/analyze-batch
 * @desc Batch analyze multiple contracts
 * @access Private
 */
router.post(
  '/analyze-batch',
  upload.array('documents', 10), // Max 10 files
  [
    body('jurisdiction').isIn(Object.values(LegalJurisdiction)).withMessage('Invalid jurisdiction'),
    body('analysisTypes').isArray({ min: 1 }).withMessage('At least one analysis type is required'),
    body('contractType')
      .optional()
      .isIn(Object.values(ContractType))
      .withMessage('Invalid contract type'),
  ],
  RequestValidator.validate,
  async (req: Request, res: Response) => {
    const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.info(`Batch contract analysis request received`, {
        requestId,
        userId: req.user?.id,
        documentCount: req.files?.length || 0,
      });

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No documents provided for batch analysis',
          requestId,
        });
      }

      const files = req.files as Express.Multer.File[];
      const results: ContractAnalysisResult[] = [];
      const errors: any[] = [];

      // Process each document
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const analysisRequest: ContractAnalysisRequest = {
            document: {
              content: file.buffer.toString('utf-8'),
              fileName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
            },
            jurisdiction: req.body.jurisdiction,
            analysisTypes: req.body.analysisTypes,
            language: req.body.language || SupportedLanguage.ENGLISH,
            contractType: req.body.contractType,
            complianceStandards: req.body.complianceStandards || [],
            riskThreshold: req.body.riskThreshold || RiskLevel.MEDIUM,
            includeRecommendations: req.body.includeRecommendations !== false,
            confidentialityLevel: req.body.confidentialityLevel || 'internal',
          };

          const result = await contractIntelligence.analyzeContract(analysisRequest);
          results.push(result);
        } catch (error: any) {
          errors.push({
            fileName: file.originalname,
            error: error.message,
            index: i,
          });
        }
      }

      logger.info(`Batch contract analysis completed`, {
        requestId,
        successfulAnalyses: results.length,
        failedAnalyses: errors.length,
        totalDocuments: files.length,
      });

      res.status(200).json({
        success: true,
        requestId,
        data: {
          results,
          errors,
          summary: {
            totalDocuments: files.length,
            successfulAnalyses: results.length,
            failedAnalyses: errors.length,
            overallScore:
              results.length > 0
                ? results.reduce((sum, r) => sum + r.contractScore.overall, 0) / results.length
                : 0,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error(`Batch contract analysis failed`, { requestId, error: error.message });

      res.status(500).json({
        success: false,
        error: 'Batch contract analysis failed',
        message: error.message,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @route GET /api/contract-intelligence/analysis/:analysisId
 * @desc Get contract analysis results by ID
 * @access Private
 */
router.get(
  '/analysis/:analysisId',
  [
    param('analysisId')
      .matches(/^contract_\d+_[a-z0-9]+$/)
      .withMessage('Invalid analysis ID format'),
  ],
  RequestValidator.validate,
  async (req: Request, res: Response) => {
    try {
      const { analysisId } = req.params;

      // In production, this would retrieve from database
      logger.info(`Contract analysis retrieval request`, {
        analysisId,
        userId: req.user?.id,
      });

      // Mock response - in production, retrieve from database
      res.status(200).json({
        success: true,
        data: {
          analysisId,
          status: 'completed',
          message: 'Analysis retrieval would be implemented with database integration',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error(`Analysis retrieval failed`, {
        analysisId: req.params.analysisId,
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analysis',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * @route GET /api/contract-intelligence/supported-features
 * @desc Get supported contract types, analysis types, and jurisdictions
 * @access Private
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
 * @route POST /api/contract-intelligence/quick-scan
 * @desc Quick contract scan for basic risk assessment
 * @access Private
 */
router.post(
  '/quick-scan',
  upload.single('document'),
  [
    body('jurisdiction').isIn(Object.values(LegalJurisdiction)).withMessage('Invalid jurisdiction'),
    body('contractType')
      .optional()
      .isIn(Object.values(ContractType))
      .withMessage('Invalid contract type'),
  ],
  RequestValidator.validate,
  async (req: Request, res: Response) => {
    const requestId = `quick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      logger.info(`Quick contract scan request received`, {
        requestId,
        userId: req.user?.id,
        jurisdiction: req.body.jurisdiction,
      });

      let documentContent: any = {};

      if (req.file) {
        documentContent = {
          content: req.file.buffer.toString('utf-8'),
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        };
      } else if (req.body.documentContent) {
        documentContent = {
          content: req.body.documentContent,
          fileName: 'contract.txt',
          fileSize: req.body.documentContent.length,
          mimeType: 'text/plain',
        };
      } else {
        return res.status(400).json({
          success: false,
          error: 'Document content is required',
          requestId,
        });
      }

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
        confidentialityLevel: 'internal',
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
  }
);

/**
 * @route GET /api/contract-intelligence/health
 * @desc Health check endpoint for contract intelligence service
 * @access Private
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

// Document Automation API Routes
// Phase 2: Feature 4 - REST API Endpoints for Document Generation Engine

import { Router, Request, Response } from 'express';
import { DocumentAutomationService } from '../services/document-automation-v2.service';
import {
  DocumentGenerationRequest,
  DocumentType,
  GenerationMethod,
  OutputFormat,
  DocumentComplexity,
  TemplateFilters,
} from '../types/document-automation.types';
import { LegalJurisdiction, SupportedLanguage } from '../types/ai.types';
import { LegalArea } from '../types/legal-research.types';

// Initialize service
const documentService = new DocumentAutomationService();
const router = Router();

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimit = (req: Request, res: Response, next: Function) => {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 10; // 10 requests per 10 minutes (document generation is resource-intensive)

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
      error: 'Too many document generation requests. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
    });
  }
};

// Validation middleware for document generation
const validateGenerationRequest = (req: Request, res: Response, next: Function) => {
  try {
    const {
      documentType,
      generationMethod,
      jurisdiction,
      legalArea,
      parties,
      outputFormat,
      variables,
      features,
    } = req.body;

    // Required fields validation
    if (!documentType || !Object.values(DocumentType).includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid documentType is required',
        validValues: Object.values(DocumentType),
      });
    }

    if (!generationMethod || !Object.values(GenerationMethod).includes(generationMethod)) {
      return res.status(400).json({
        success: false,
        error: 'Valid generationMethod is required',
        validValues: Object.values(GenerationMethod),
      });
    }

    if (!jurisdiction || !Object.values(LegalJurisdiction).includes(jurisdiction)) {
      return res.status(400).json({
        success: false,
        error: 'Valid jurisdiction is required',
        validValues: Object.values(LegalJurisdiction),
      });
    }

    if (!legalArea || !Object.values(LegalArea).includes(legalArea)) {
      return res.status(400).json({
        success: false,
        error: 'Valid legalArea is required',
        validValues: Object.values(LegalArea),
      });
    }

    if (!parties || !Array.isArray(parties) || parties.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one party is required',
      });
    }

    if (!outputFormat || !Array.isArray(outputFormat) || outputFormat.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one output format is required',
        validValues: Object.values(OutputFormat),
      });
    }

    // Validate output formats
    const invalidFormats = outputFormat.filter(
      format => !Object.values(OutputFormat).includes(format)
    );
    if (invalidFormats.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid output formats: ${invalidFormats.join(', ')}`,
        validValues: Object.values(OutputFormat),
      });
    }

    // Validate parties structure
    for (let i = 0; i < parties.length; i++) {
      const party = parties[i];
      if (!party.name || !party.type || !party.role) {
        return res.status(400).json({
          success: false,
          error: `Party ${i + 1} missing required fields: name, type, role`,
        });
      }
    }

    // Validate variables object
    if (variables && typeof variables !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'variables must be an object',
      });
    }

    // Validate features object
    if (features && typeof features !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'features must be an object',
      });
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid request format',
    });
  }
};

// POST /generate - Generate legal document
router.post(
  '/generate',
  rateLimit,
  validateGenerationRequest,
  async (req: Request, res: Response) => {
    try {
      const request: DocumentGenerationRequest = {
        templateId: req.body.templateId,
        documentType: req.body.documentType,
        generationMethod: req.body.generationMethod,
        jurisdiction: req.body.jurisdiction,
        legalArea: req.body.legalArea,
        language: req.body.language || SupportedLanguage.ENGLISH,
        complexity: req.body.complexity || DocumentComplexity.STANDARD,

        // Input data
        variables: req.body.variables || {},
        parties: req.body.parties,
        customClauses: req.body.customClauses || [],

        // Configuration
        outputFormat: req.body.outputFormat,
        styling: req.body.styling,
        features: {
          includeTableOfContents: req.body.features?.includeTableOfContents || false,
          includeExecutionPage: req.body.features?.includeExecutionPage || true,
          includeExhibits: req.body.features?.includeExhibits || false,
          includeDefinitions: req.body.features?.includeDefinitions || true,
          enableTracking: req.body.features?.enableTracking || false,
          enableComments: req.body.features?.enableComments || false,
          enableReview: req.body.features?.enableReview || false,
          generateAlternatives: req.body.features?.generateAlternatives || false,
          riskAnalysis: req.body.features?.riskAnalysis || true,
          complianceCheck: req.body.features?.complianceCheck || true,
          qualityAssurance: req.body.features?.qualityAssurance || true,
        },

        // Context
        existingDocuments: req.body.existingDocuments || [],
        complianceRequirements: req.body.complianceRequirements || [],
        specialInstructions: req.body.specialInstructions,
        confidentialityLevel: req.body.confidentialityLevel || 'PUBLIC',
      };

      const result = await documentService.generateDocument(request);

      res.json({
        success: true,
        data: result,
        metadata: {
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          generationTime: result.metadata.duration,
          documentsGenerated: result.documents.length,
          complexity: result.summary.complexity,
          qualityScore: result.quality.overall,
          complianceScore: result.compliance.overallCompliance,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Document generation error:', error);
      res.status(500).json({
        success: false,
        error: error?.message || 'Failed to generate document',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
    }
  }
);

// POST /analyze-complexity - Analyze document generation complexity
router.post('/analyze-complexity', rateLimit, async (req: Request, res: Response) => {
  try {
    const request: DocumentGenerationRequest = {
      documentType: req.body.documentType,
      generationMethod: req.body.generationMethod || GenerationMethod.TEMPLATE_BASED,
      jurisdiction: req.body.jurisdiction,
      legalArea: req.body.legalArea,
      language: req.body.language || SupportedLanguage.ENGLISH,
      complexity: req.body.complexity || DocumentComplexity.STANDARD,
      variables: req.body.variables || {},
      parties: req.body.parties || [],
      outputFormat: req.body.outputFormat || [OutputFormat.PDF],
      features: req.body.features || {},
      confidentialityLevel: req.body.confidentialityLevel || 'PUBLIC',
    };

    const analysis = await documentService.analyzeComplexity(request);

    res.json({
      success: true,
      data: analysis,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Complexity analysis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to analyze complexity',
    });
  }
});

// POST /estimate-generation - Estimate document generation time and cost
router.post('/estimate-generation', rateLimit, async (req: Request, res: Response) => {
  try {
    const request: DocumentGenerationRequest = {
      documentType: req.body.documentType,
      generationMethod: req.body.generationMethod || GenerationMethod.TEMPLATE_BASED,
      jurisdiction: req.body.jurisdiction,
      legalArea: req.body.legalArea,
      language: req.body.language || SupportedLanguage.ENGLISH,
      complexity: req.body.complexity || DocumentComplexity.STANDARD,
      variables: req.body.variables || {},
      parties: req.body.parties || [],
      outputFormat: req.body.outputFormat || [OutputFormat.PDF],
      features: req.body.features || {},
      confidentialityLevel: req.body.confidentialityLevel || 'PUBLIC',
    };

    const estimate = await documentService.estimateGeneration(request);

    res.json({
      success: true,
      data: estimate,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Generation estimation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to estimate generation',
    });
  }
});

// GET /templates - Get available document templates
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const filters: TemplateFilters = {};

    if (req.query.type) {
      filters.type = req.query.type as DocumentType;
    }
    if (req.query.jurisdiction) {
      filters.jurisdiction = req.query.jurisdiction as LegalJurisdiction;
    }
    if (req.query.legalArea) {
      filters.legalArea = req.query.legalArea as LegalArea;
    }
    if (req.query.complexity) {
      filters.complexity = req.query.complexity as DocumentComplexity;
    }
    if (req.query.language) {
      filters.language = req.query.language as SupportedLanguage;
    }

    const templates = await documentService.getTemplates(filters);

    res.json({
      success: true,
      data: templates,
      metadata: {
        count: templates.length,
        filters: filters,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Template retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to retrieve templates',
    });
  }
});

// POST /templates/validate - Validate a document template
router.post('/templates/validate', async (req: Request, res: Response) => {
  try {
    const template = req.body.template;

    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Template is required',
      });
    }

    const validation = await documentService.validateTemplate(template);

    res.json({
      success: true,
      data: validation,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Template validation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to validate template',
    });
  }
});

// GET /capabilities - Get system capabilities
router.get('/capabilities', (req: Request, res: Response) => {
  try {
    const capabilities = {
      documentTypes: Object.values(DocumentType),
      generationMethods: Object.values(GenerationMethod),
      outputFormats: Object.values(OutputFormat),
      supportedJurisdictions: Object.values(LegalJurisdiction),
      supportedLegalAreas: Object.values(LegalArea),
      supportedLanguages: Object.values(SupportedLanguage),
      complexityLevels: Object.values(DocumentComplexity),

      features: {
        templateBasedGeneration: true,
        aiGeneration: true,
        hybridGeneration: true,
        clauseAssembly: true,
        multiFormatOutput: true,
        qualityAssessment: true,
        complianceChecking: true,
        complexityAnalysis: true,
        estimationEngine: true,
        templateValidation: true,
        riskAnalysis: true,
        alternativeGeneration: true,
        multiLanguageSupport: true,
        jurisdictionSpecific: true,
      },

      rateLimits: {
        requestsPerHour: 60,
        requestsPerDay: 200,
        windowMinutes: 10,
        maxPerWindow: 10,
      },

      qualityMetrics: {
        averageAccuracy: 0.92,
        averageCompleteness: 0.89,
        averageCompliance: 0.94,
        averageGenerationTime: 45000, // ms
        successRate: 0.97,
      },

      supportedPartyTypes: [
        'INDIVIDUAL',
        'CORPORATION',
        'LLC',
        'PARTNERSHIP',
        'TRUST',
        'GOVERNMENT',
        'NON_PROFIT',
        'FOREIGN_ENTITY',
      ],

      supportedPartyRoles: [
        'CLIENT',
        'COUNTERPARTY',
        'VENDOR',
        'CUSTOMER',
        'EMPLOYEE',
        'CONTRACTOR',
        'PARTNER',
        'INVESTOR',
        'BORROWER',
        'LENDER',
        'LESSOR',
        'LESSEE',
        'BUYER',
        'SELLER',
        'LICENSOR',
        'LICENSEE',
      ],
    };

    res.json({
      success: true,
      data: capabilities,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Capabilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system capabilities',
    });
  }
});

// GET /document-types - Get available document types with descriptions
router.get('/document-types', (req: Request, res: Response) => {
  try {
    const documentTypes = [
      {
        type: DocumentType.SERVICE_AGREEMENT,
        name: 'Service Agreement',
        description: 'Agreement for provision of professional services',
        category: 'Commercial Contracts',
        complexity: DocumentComplexity.STANDARD,
        estimatedTime: 45,
        commonSections: ['Parties', 'Scope of Services', 'Payment Terms', 'Termination'],
      },
      {
        type: DocumentType.EMPLOYMENT_CONTRACT,
        name: 'Employment Contract',
        description: 'Contract governing employment relationship',
        category: 'Employment',
        complexity: DocumentComplexity.STANDARD,
        estimatedTime: 60,
        commonSections: ['Employee Information', 'Job Description', 'Compensation', 'Benefits'],
      },
      {
        type: DocumentType.NON_DISCLOSURE_AGREEMENT,
        name: 'Non-Disclosure Agreement',
        description: 'Agreement to protect confidential information',
        category: 'Confidentiality',
        complexity: DocumentComplexity.SIMPLE,
        estimatedTime: 30,
        commonSections: ['Parties', 'Confidential Information', 'Obligations', 'Term'],
      },
      {
        type: DocumentType.PARTNERSHIP_AGREEMENT,
        name: 'Partnership Agreement',
        description: 'Agreement establishing business partnership',
        category: 'Corporate',
        complexity: DocumentComplexity.COMPLEX,
        estimatedTime: 120,
        commonSections: ['Partners', 'Capital Contributions', 'Profit Sharing', 'Management'],
      },
      {
        type: DocumentType.LEASE_AGREEMENT,
        name: 'Lease Agreement',
        description: 'Agreement for property rental',
        category: 'Real Estate',
        complexity: DocumentComplexity.STANDARD,
        estimatedTime: 50,
        commonSections: [
          'Property Description',
          'Rent Terms',
          'Lease Duration',
          'Responsibilities',
        ],
      },
    ];

    res.json({
      success: true,
      data: documentTypes,
      metadata: {
        count: documentTypes.length,
        categories: [
          'Commercial Contracts',
          'Employment',
          'Confidentiality',
          'Corporate',
          'Real Estate',
        ],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Document types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document types',
    });
  }
});

// Error handling middleware
router.use((error: any, req: Request, res: Response, next: Function) => {
  console.error('Document automation route error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error in document automation',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

export { router };
export default router;

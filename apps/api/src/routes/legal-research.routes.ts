// Legal Research API Routes - Phase 2 Feature 1
// Advanced Semantic Search & Legal Discovery

import { Router, Request, Response } from 'express';
import { LegalResearchService } from '../services/legal-research.service';
import {
  LegalResearchRequest,
  LegalArea,
  DocumentType,
  CitationFormat,
  ResearchComplexity,
} from '../types/legal-research.types';
import { LegalJurisdiction, SupportedLanguage } from '../types/ai.types';
import { body, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = Router();
const legalResearchService = new LegalResearchService();

// Rate limiting for research endpoints
const researchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many research requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ===== VALIDATION MIDDLEWARE =====

const validateResearchRequest = [
  body('query')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Query must be between 3 and 1000 characters'),

  body('jurisdictions')
    .isArray({ min: 1, max: 10 })
    .withMessage('Must specify 1-10 jurisdictions')
    .custom((jurisdictions: string[]) => {
      const validJurisdictions = Object.values(LegalJurisdiction);
      return jurisdictions.every(j => validJurisdictions.includes(j as LegalJurisdiction));
    })
    .withMessage('Invalid jurisdiction(s) specified'),

  body('legalAreas')
    .isArray({ min: 1, max: 5 })
    .withMessage('Must specify 1-5 legal areas')
    .custom((areas: string[]) => {
      const validAreas = Object.values(LegalArea);
      return areas.every(a => validAreas.includes(a as LegalArea));
    })
    .withMessage('Invalid legal area(s) specified'),

  body('documentTypes')
    .isArray({ min: 1 })
    .withMessage('Must specify at least one document type')
    .custom((types: string[]) => {
      const validTypes = Object.values(DocumentType);
      return types.every(t => validTypes.includes(t as DocumentType));
    })
    .withMessage('Invalid document type(s) specified'),

  body('maxResults')
    .isInt({ min: 1, max: 100 })
    .withMessage('maxResults must be between 1 and 100'),

  body('languages')
    .optional()
    .isArray()
    .custom((languages: string[]) => {
      if (!languages) return true;
      const validLanguages = Object.values(SupportedLanguage);
      return languages.every(l => validLanguages.includes(l as SupportedLanguage));
    })
    .withMessage('Invalid language(s) specified'),

  body('citationFormat')
    .optional()
    .isIn(Object.values(CitationFormat))
    .withMessage('Invalid citation format'),

  body('complexity')
    .optional()
    .isIn(Object.values(ResearchComplexity))
    .withMessage('Invalid complexity level'),

  body('confidenceThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence threshold must be between 0 and 1'),

  body('dateRange.from').optional().isISO8601().withMessage('Invalid start date format'),

  body('dateRange.to').optional().isISO8601().withMessage('Invalid end date format'),
];

// ===== ROUTES =====

/**
 * POST /api/v2/legal/research
 * Execute advanced legal research with semantic search
 */
router.post(
  '/research',
  researchRateLimit,
  validateResearchRequest,
  async (req: Request, res: Response) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      // Extract and process request
      const researchRequest: LegalResearchRequest = {
        query: req.body.query,
        jurisdictions: req.body.jurisdictions,
        legalAreas: req.body.legalAreas,
        languages: req.body.languages || [SupportedLanguage.ENGLISH],
        documentTypes: req.body.documentTypes,
        maxResults: req.body.maxResults,
        includeAnalysis: req.body.includeAnalysis ?? true,
        includeCitations: req.body.includeCitations ?? true,
        citationFormat: req.body.citationFormat || CitationFormat.BLUEBOOK,
        complexity: req.body.complexity || ResearchComplexity.INTERMEDIATE,
        semanticSearch: req.body.semanticSearch ?? true,
        includeRelatedCases: req.body.includeRelatedCases ?? true,
        confidenceThreshold: req.body.confidenceThreshold || 0.7,
        dateRange: req.body.dateRange
          ? {
              from: new Date(req.body.dateRange.from),
              to: new Date(req.body.dateRange.to),
            }
          : undefined,
      };

      // Execute research
      const result = await legalResearchService.research(researchRequest);

      // Return results
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Legal research error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during legal research',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/v2/legal/research/suggestions
 * Get research suggestions based on query
 */
router.get(
  '/research/suggestions',
  query('q')
    .isLength({ min: 2, max: 200 })
    .withMessage('Query must be between 2 and 200 characters'),

  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const query = req.query.q as string;

      // Generate suggestions (simplified implementation)
      const suggestions = [
        `${query} recent developments`,
        `${query} case law`,
        `${query} regulatory updates`,
        `${query} comparative analysis`,
        `${query} compliance requirements`,
      ];

      res.json({
        success: true,
        data: {
          query,
          suggestions,
          count: suggestions.length,
        },
      });
    } catch (error) {
      console.error('Research suggestions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate research suggestions',
      });
    }
  }
);

/**
 * GET /api/v2/legal/research/jurisdictions
 * Get supported jurisdictions for research
 */
router.get('/jurisdictions', async (req: Request, res: Response) => {
  try {
    const jurisdictions = Object.entries(LegalJurisdiction).map(([name, code]) => ({
      name: name.toLowerCase().replace(/_/g, ' '),
      code,
      region: getRegionForJurisdiction(code as LegalJurisdiction),
    }));

    res.json({
      success: true,
      data: {
        jurisdictions,
        total: jurisdictions.length,
        regions: {
          africa: jurisdictions.filter(j => j.region === 'africa').length,
          middleEast: jurisdictions.filter(j => j.region === 'middle_east').length,
          international: jurisdictions.filter(j => j.region === 'international').length,
        },
      },
    });
  } catch (error) {
    console.error('Jurisdictions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jurisdictions',
    });
  }
});

/**
 * GET /api/v2/legal/research/areas
 * Get supported legal areas for research
 */
router.get('/areas', async (req: Request, res: Response) => {
  try {
    const legalAreas = Object.entries(LegalArea).map(([name, value]) => ({
      name: name.toLowerCase().replace(/_/g, ' '),
      value,
      description: getLegalAreaDescription(value),
    }));

    res.json({
      success: true,
      data: {
        legalAreas,
        total: legalAreas.length,
      },
    });
  } catch (error) {
    console.error('Legal areas error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch legal areas',
    });
  }
});

/**
 * GET /api/v2/legal/research/document-types
 * Get supported document types for research
 */
router.get('/document-types', async (req: Request, res: Response) => {
  try {
    const documentTypes = Object.entries(DocumentType).map(([name, value]) => ({
      name: name.toLowerCase().replace(/_/g, ' '),
      value,
      description: getDocumentTypeDescription(value),
    }));

    res.json({
      success: true,
      data: {
        documentTypes,
        total: documentTypes.length,
      },
    });
  } catch (error) {
    console.error('Document types error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document types',
    });
  }
});

/**
 * POST /api/v2/legal/research/validate
 * Validate research request before execution
 */
router.post('/validate', validateResearchRequest, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({
        success: false,
        valid: false,
        errors: errors.array(),
        suggestions: generateValidationSuggestions(errors.array()),
      });
    }

    // Additional business logic validation
    const businessValidation = validateBusinessRules(req.body);

    res.json({
      success: true,
      valid: businessValidation.valid,
      warnings: businessValidation.warnings,
      estimatedResults: businessValidation.estimatedResults,
      estimatedTime: businessValidation.estimatedTime,
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation service error',
    });
  }
});

// ===== UTILITY FUNCTIONS =====

function getRegionForJurisdiction(jurisdiction: LegalJurisdiction): string {
  const africanJurisdictions = [
    LegalJurisdiction.ALGERIA,
    LegalJurisdiction.ANGOLA,
    LegalJurisdiction.BENIN,
    LegalJurisdiction.BOTSWANA,
    LegalJurisdiction.BURKINA_FASO,
    LegalJurisdiction.BURUNDI,
    LegalJurisdiction.CAMEROON,
    LegalJurisdiction.CAPE_VERDE,
    LegalJurisdiction.CAR,
    LegalJurisdiction.CHAD,
    LegalJurisdiction.COMOROS,
    LegalJurisdiction.CONGO,
    LegalJurisdiction.DRC,
    LegalJurisdiction.DJIBOUTI,
    LegalJurisdiction.EGYPT,
    LegalJurisdiction.EQUATORIAL_GUINEA,
    LegalJurisdiction.ERITREA,
    LegalJurisdiction.ESWATINI,
    LegalJurisdiction.ETHIOPIA,
    LegalJurisdiction.GABON,
    LegalJurisdiction.GAMBIA,
    LegalJurisdiction.GHANA,
    LegalJurisdiction.GUINEA,
    LegalJurisdiction.GUINEA_BISSAU,
    LegalJurisdiction.IVORY_COAST,
    LegalJurisdiction.KENYA,
    LegalJurisdiction.LESOTHO,
    LegalJurisdiction.LIBERIA,
    LegalJurisdiction.LIBYA,
    LegalJurisdiction.MADAGASCAR,
    LegalJurisdiction.MALAWI,
    LegalJurisdiction.MALI,
    LegalJurisdiction.MAURITANIA,
    LegalJurisdiction.MAURITIUS,
    LegalJurisdiction.MOROCCO,
    LegalJurisdiction.MOZAMBIQUE,
    LegalJurisdiction.NAMIBIA,
    LegalJurisdiction.NIGER,
    LegalJurisdiction.NIGERIA,
    LegalJurisdiction.RWANDA,
    LegalJurisdiction.SAO_TOME,
    LegalJurisdiction.SENEGAL,
    LegalJurisdiction.SEYCHELLES,
    LegalJurisdiction.SIERRA_LEONE,
    LegalJurisdiction.SOMALIA,
    LegalJurisdiction.SOUTH_AFRICA,
    LegalJurisdiction.SOUTH_SUDAN,
    LegalJurisdiction.SUDAN,
    LegalJurisdiction.TANZANIA,
    LegalJurisdiction.TOGO,
    LegalJurisdiction.TUNISIA,
    LegalJurisdiction.UGANDA,
    LegalJurisdiction.ZAMBIA,
    LegalJurisdiction.ZIMBABWE,
  ];

  const middleEastJurisdictions = [
    LegalJurisdiction.BAHRAIN,
    LegalJurisdiction.CYPRUS,
    LegalJurisdiction.IRAN,
    LegalJurisdiction.IRAQ,
    LegalJurisdiction.ISRAEL,
    LegalJurisdiction.JORDAN,
    LegalJurisdiction.KUWAIT,
    LegalJurisdiction.LEBANON,
    LegalJurisdiction.OMAN,
    LegalJurisdiction.PALESTINE,
    LegalJurisdiction.QATAR,
    LegalJurisdiction.SAUDI_ARABIA,
    LegalJurisdiction.SYRIA,
    LegalJurisdiction.TURKEY,
    LegalJurisdiction.UAE,
    LegalJurisdiction.YEMEN,
  ];

  if (africanJurisdictions.includes(jurisdiction)) return 'africa';
  if (middleEastJurisdictions.includes(jurisdiction)) return 'middle_east';
  return 'international';
}

function getLegalAreaDescription(area: LegalArea): string {
  const descriptions = {
    [LegalArea.CORPORATE]: 'Corporate law, business structures, and commercial transactions',
    [LegalArea.CONTRACT]: 'Contract law, agreement analysis, and commercial contracts',
    [LegalArea.INTELLECTUAL_PROPERTY]: 'Patents, trademarks, copyrights, and IP protection',
    [LegalArea.EMPLOYMENT]: 'Labor law, employment contracts, and workplace regulations',
    [LegalArea.REAL_ESTATE]: 'Property law, real estate transactions, and land rights',
    [LegalArea.LITIGATION]: 'Court procedures, dispute resolution, and civil litigation',
    [LegalArea.REGULATORY]: 'Regulatory compliance and administrative law',
    [LegalArea.TAX]: 'Tax law, fiscal regulations, and tax planning',
    [LegalArea.FAMILY]: 'Family law, divorce, custody, and domestic relations',
    [LegalArea.CRIMINAL]: 'Criminal law, criminal procedures, and penal codes',
    [LegalArea.INTERNATIONAL]: 'International law, treaties, and cross-border legal issues',
    [LegalArea.CONSTITUTIONAL]: 'Constitutional law and fundamental rights',
    [LegalArea.ADMINISTRATIVE]: 'Administrative law and government procedures',
    [LegalArea.ENVIRONMENTAL]: 'Environmental law and sustainability regulations',
    [LegalArea.BANKING_FINANCE]: 'Banking law, financial regulations, and securities',
  };
  return descriptions[area] || 'Legal area description not available';
}

function getDocumentTypeDescription(type: DocumentType): string {
  const descriptions = {
    [DocumentType.CASE_LAW]: 'Court decisions and judicial precedents',
    [DocumentType.STATUTE]: 'Legislative acts and statutory provisions',
    [DocumentType.REGULATION]: 'Administrative regulations and rules',
    [DocumentType.CONTRACT]: 'Contractual agreements and commercial contracts',
    [DocumentType.LEGAL_OPINION]: 'Legal opinions and advisory documents',
    [DocumentType.COURT_DECISION]: 'Court judgments and rulings',
    [DocumentType.TREATY]: 'International treaties and agreements',
    [DocumentType.CONSTITUTION]: 'Constitutional texts and amendments',
    [DocumentType.LEGAL_BRIEF]: 'Legal briefs and court submissions',
    [DocumentType.ACADEMIC_PAPER]: 'Legal scholarship and academic research',
    [DocumentType.PRACTICE_GUIDE]: 'Legal practice guides and procedures',
    [DocumentType.LEGAL_FORM]: 'Legal forms and templates',
  };
  return descriptions[type] || 'Document type description not available';
}

function generateValidationSuggestions(errors: any[]): string[] {
  const suggestions: string[] = [];

  errors.forEach(error => {
    switch (error.path) {
      case 'query':
        suggestions.push('Provide a more specific search query (3-1000 characters)');
        break;
      case 'jurisdictions':
        suggestions.push('Select 1-10 valid jurisdictions from the supported list');
        break;
      case 'legalAreas':
        suggestions.push('Choose 1-5 relevant legal practice areas');
        break;
      case 'maxResults':
        suggestions.push('Set maxResults between 1 and 100');
        break;
      default:
        suggestions.push(`Check the ${error.path} field`);
    }
  });

  return [...new Set(suggestions)]; // Remove duplicates
}

function validateBusinessRules(requestBody: any): {
  valid: boolean;
  warnings: string[];
  estimatedResults: number;
  estimatedTime: number;
} {
  const warnings: string[] = [];
  let estimatedResults = 50;
  let estimatedTime = 3000; // milliseconds

  // Adjust estimates based on request complexity
  if (requestBody.jurisdictions?.length > 5) {
    warnings.push('Large number of jurisdictions may slow down search');
    estimatedTime += requestBody.jurisdictions.length * 500;
  }

  if (requestBody.maxResults > 50) {
    warnings.push('High result count may increase processing time');
    estimatedTime += (requestBody.maxResults - 50) * 100;
  }

  if (requestBody.semanticSearch === false) {
    warnings.push('Disabling semantic search may reduce result quality');
    estimatedResults *= 0.7;
  }

  if (requestBody.includeAnalysis) {
    warnings.push('Analysis generation will increase processing time');
    estimatedTime += 2000;
  }

  return {
    valid: true,
    warnings,
    estimatedResults: Math.round(estimatedResults),
    estimatedTime: Math.round(estimatedTime),
  };
}

export default router;

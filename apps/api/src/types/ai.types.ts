// AI Gateway Service - Multi-Provider Architecture
// Supports self-hosted models + hybrid premium APIs

import { z } from 'zod';

// Provider Types
export enum AIProvider {
  OLLAMA = 'ollama',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  HUGGINGFACE = 'huggingface',
  LEGAL_BERT = 'legal_bert',
}

// Legal AI Model Types
export enum LegalModelType {
  LEGAL_BERT = 'nlpaueb/legal-bert-base-uncased',
  LEGALBERT = 'zlucia/legalbert',
  LEGAL_ROBERTA = 'saibo/legal-roberta-base',
  CUSTOM_AFRICAN_LEGAL = 'counselflow/african-legal-model',
  CUSTOM_MIDDLE_EAST_LEGAL = 'counselflow/middle-east-legal-model',
}

// Supported Legal Jurisdictions
export enum LegalJurisdiction {
  // African Countries (54)
  ALGERIA = 'DZ',
  ANGOLA = 'AO',
  BENIN = 'BJ',
  BOTSWANA = 'BW',
  BURKINA_FASO = 'BF',
  BURUNDI = 'BI',
  CAMEROON = 'CM',
  CAPE_VERDE = 'CV',
  CAR = 'CF',
  CHAD = 'TD',
  COMOROS = 'KM',
  CONGO = 'CG',
  DRC = 'CD',
  DJIBOUTI = 'DJ',
  EGYPT = 'EG',
  EQUATORIAL_GUINEA = 'GQ',
  ERITREA = 'ER',
  ESWATINI = 'SZ',
  ETHIOPIA = 'ET',
  GABON = 'GA',
  GAMBIA = 'GM',
  GHANA = 'GH',
  GUINEA = 'GN',
  GUINEA_BISSAU = 'GW',
  IVORY_COAST = 'CI',
  KENYA = 'KE',
  LESOTHO = 'LS',
  LIBERIA = 'LR',
  LIBYA = 'LY',
  MADAGASCAR = 'MG',
  MALAWI = 'MW',
  MALI = 'ML',
  MAURITANIA = 'MR',
  MAURITIUS = 'MU',
  MOROCCO = 'MA',
  MOZAMBIQUE = 'MZ',
  NAMIBIA = 'NA',
  NIGER = 'NE',
  NIGERIA = 'NG',
  RWANDA = 'RW',
  SAO_TOME = 'ST',
  SENEGAL = 'SN',
  SEYCHELLES = 'SC',
  SIERRA_LEONE = 'SL',
  SOMALIA = 'SO',
  SOUTH_AFRICA = 'ZA',
  SOUTH_SUDAN = 'SS',
  SUDAN = 'SD',
  TANZANIA = 'TZ',
  TOGO = 'TG',
  TUNISIA = 'TN',
  UGANDA = 'UG',
  ZAMBIA = 'ZM',
  ZIMBABWE = 'ZW',

  // Middle Eastern Countries (17)
  BAHRAIN = 'BH',
  CYPRUS = 'CY',
  IRAN = 'IR',
  IRAQ = 'IQ',
  ISRAEL = 'IL',
  JORDAN = 'JO',
  KUWAIT = 'KW',
  LEBANON = 'LB',
  OMAN = 'OM',
  PALESTINE = 'PS',
  QATAR = 'QA',
  SAUDI_ARABIA = 'SA',
  SYRIA = 'SY',
  TURKEY = 'TR',
  UAE = 'AE',
  YEMEN = 'YE',

  // International/Cross-border
  INTERNATIONAL = 'INTL',
}

// Legal System Types
export enum LegalSystem {
  COMMON_LAW = 'common_law',
  CIVIL_LAW = 'civil_law',
  ISLAMIC_LAW = 'islamic_law',
  CUSTOMARY_LAW = 'customary_law',
  MIXED_SYSTEM = 'mixed_system',
}

// Supported Languages (10)
export enum SupportedLanguage {
  ENGLISH = 'en',
  FRENCH = 'fr',
  ARABIC = 'ar',
  PORTUGUESE = 'pt',
  SWAHILI = 'sw',
  AMHARIC = 'am',
  HEBREW = 'he',
  PERSIAN = 'fa',
  TURKISH = 'tr',
  GERMAN = 'de',
}

// AI Request Types
export interface AIRequest {
  id: string;
  type: AIAnalysisType;
  provider: AIProvider;
  model: string;
  input: any;
  context?: LegalContext;
  options?: AIOptions;
  createdAt: Date;
}

export interface LegalContext {
  jurisdiction: LegalJurisdiction;
  legalSystem: LegalSystem;
  language: SupportedLanguage;
  practiceArea: string;
  confidentialityLevel: 'public' | 'confidential' | 'privileged';
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  streaming?: boolean;
  cacheEnabled?: boolean;
  fallbackProvider?: AIProvider;
}

export interface AIResponse {
  id: string;
  requestId: string;
  provider: AIProvider;
  model: string;
  output: any;
  confidence: number;
  processingTime: number;
  tokensUsed: number;
  cost: number;
  cached: boolean;
  completedAt: Date;
}

// Analysis Types
export enum AIAnalysisType {
  CONTRACT_ANALYSIS = 'contract_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  CASE_PREDICTION = 'case_prediction',
  DOCUMENT_REVIEW = 'document_review',
  LEGAL_RESEARCH = 'legal_research',
  COMPLIANCE_CHECK = 'compliance_check',
  CLAUSE_EXTRACTION = 'clause_extraction',
  ENTITY_RECOGNITION = 'entity_recognition',
  CITATION_ANALYSIS = 'citation_analysis',
  PRECEDENT_MATCHING = 'precedent_matching',
}

// Provider Configuration
export interface ProviderConfig {
  provider: AIProvider;
  enabled: boolean;
  priority: number;
  models: string[];
  apiKey?: string;
  baseURL?: string;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  costs: {
    inputTokenCost: number;
    outputTokenCost: number;
  };
}

// Usage Tracking
export interface AIUsage {
  id: string;
  userId: string;
  requestId: string;
  provider: AIProvider;
  model: string;
  analysisType: AIAnalysisType;
  tokensUsed: number;
  cost: number;
  processingTime: number;
  success: boolean;
  timestamp: Date;
}

// Validation Schemas
export const aiRequestSchema = z.object({
  type: z.nativeEnum(AIAnalysisType),
  provider: z.nativeEnum(AIProvider).optional(),
  model: z.string().optional(),
  input: z.any(),
  context: z
    .object({
      jurisdiction: z.nativeEnum(LegalJurisdiction),
      legalSystem: z.nativeEnum(LegalSystem),
      language: z.nativeEnum(SupportedLanguage),
      practiceArea: z.string(),
      confidentialityLevel: z.enum(['public', 'confidential', 'privileged']),
    })
    .optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(1).optional(),
      maxTokens: z.number().positive().optional(),
      timeout: z.number().positive().optional(),
      streaming: z.boolean().optional(),
      cacheEnabled: z.boolean().optional(),
      fallbackProvider: z.nativeEnum(AIProvider).optional(),
    })
    .optional(),
});

export type ValidatedAIRequest = z.infer<typeof aiRequestSchema>;

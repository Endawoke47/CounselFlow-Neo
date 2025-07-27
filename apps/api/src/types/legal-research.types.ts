// Legal Research Engine - Advanced Types & Interfaces
// Phase 2: Feature 1 Implementation

import { LegalJurisdiction, SupportedLanguage } from './ai.types';

// ===== CORE RESEARCH TYPES =====

export enum LegalArea {
  CORPORATE = 'corporate',
  CONTRACT = 'contract',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  EMPLOYMENT = 'employment',
  REAL_ESTATE = 'real_estate',
  LITIGATION = 'litigation',
  REGULATORY = 'regulatory',
  TAX = 'tax',
  FAMILY = 'family',
  CRIMINAL = 'criminal',
  INTERNATIONAL = 'international',
  CONSTITUTIONAL = 'constitutional',
  ADMINISTRATIVE = 'administrative',
  ENVIRONMENTAL = 'environmental',
  BANKING_FINANCE = 'banking_finance',
}

export enum DocumentType {
  CASE_LAW = 'case_law',
  STATUTE = 'statute',
  REGULATION = 'regulation',
  CONTRACT = 'contract',
  LEGAL_OPINION = 'legal_opinion',
  COURT_DECISION = 'court_decision',
  TREATY = 'treaty',
  CONSTITUTION = 'constitution',
  LEGAL_BRIEF = 'legal_brief',
  ACADEMIC_PAPER = 'academic_paper',
  PRACTICE_GUIDE = 'practice_guide',
  LEGAL_FORM = 'legal_form',
}

export enum CitationFormat {
  BLUEBOOK = 'bluebook',
  HARVARD = 'harvard',
  APA = 'apa',
  MLA = 'mla',
  OSCOLA = 'oscola',
  CUSTOM = 'custom',
}

export enum ResearchComplexity {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

// ===== REQUEST INTERFACES =====

export interface LegalResearchRequest {
  query: string;
  jurisdictions: LegalJurisdiction[];
  legalAreas: LegalArea[];
  languages: SupportedLanguage[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  documentTypes: DocumentType[];
  maxResults: number;
  includeAnalysis: boolean;
  includeCitations: boolean;
  citationFormat: CitationFormat;
  complexity: ResearchComplexity;
  semanticSearch: boolean;
  includeRelatedCases: boolean;
  confidenceThreshold: number; // 0.0 to 1.0
}

export interface SemanticSearchOptions {
  enableVectorSearch: boolean;
  similarityThreshold: number;
  maxSimilarDocuments: number;
  includeConceptualMatches: boolean;
  weightFactors: {
    recency: number;
    relevance: number;
    authority: number;
    jurisdiction: number;
  };
}

// ===== RESPONSE INTERFACES =====

export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  documentType: DocumentType;
  jurisdiction: LegalJurisdiction;
  language: SupportedLanguage;
  legalAreas: LegalArea[];
  publicationDate: Date;
  lastUpdated: Date;
  authority: AuthorityLevel;
  source: LegalSource;
  metadata: DocumentMetadata;
  relevanceScore: number;
  confidenceScore: number;
}

export interface Citation {
  id: string;
  document: LegalDocument;
  format: CitationFormat;
  citation: string;
  shortForm: string;
  pinpoint?: string;
  accessed: Date;
  validatedAt: Date;
  isValid: boolean;
}

export interface Precedent {
  id: string;
  case: LegalDocument;
  principle: string;
  bindingLevel: BindingLevel;
  applicableJurisdictions: LegalJurisdiction[];
  similarCases: LegalDocument[];
  keyFacts: string[];
  legalReasoning: string;
  relevanceToQuery: number;
  isOverruled: boolean;
  relatedStatutes: LegalDocument[];
}

export interface ResearchAnalysis {
  summary: string;
  keyFindings: string[];
  legalTrends: LegalTrend[];
  jurisdictionalAnalysis: JurisdictionalAnalysis[];
  recommendedActions: string[];
  researchGaps: string[];
  confidenceLevel: number;
  methodologyUsed: string[];
  limitations: string[];
}

export interface LegalResearchResult {
  requestId: string;
  query: string;
  executionTime: number;
  totalDocuments: number;
  documents: LegalDocument[];
  citations: Citation[];
  precedents: Precedent[];
  analysis: ResearchAnalysis;
  overallConfidence: number;
  sources: LegalSource[];
  suggestions: ResearchSuggestion[];
  relatedQueries: string[];
  metadata: ResultMetadata;
}

// ===== SUPPORTING INTERFACES =====

export interface LegalSource {
  id: string;
  name: string;
  type: SourceType;
  jurisdiction: LegalJurisdiction;
  credibility: CredibilityRating;
  accessLevel: AccessLevel;
  lastUpdated: Date;
  subscription: boolean;
  apiEndpoint?: string;
  searchCapabilities: SearchCapability[];
}

export interface DocumentMetadata {
  wordCount: number;
  pageCount: number;
  tableOfContents: string[];
  keyTerms: string[];
  entities: NamedEntity[];
  topics: TopicTag[];
  complexity: ResearchComplexity;
  readingTime: number;
  checksum: string;
  version: string;
}

export interface LegalTrend {
  trend: string;
  direction: TrendDirection;
  confidence: number;
  timeframe: string;
  supportingCases: LegalDocument[];
  jurisdiction: LegalJurisdiction;
  legalArea: LegalArea;
}

export interface JurisdictionalAnalysis {
  jurisdiction: LegalJurisdiction;
  applicableLaws: LegalDocument[];
  keyDifferences: string[];
  recommendations: string[];
  riskFactors: string[];
  compliance: ComplianceStatus;
}

export interface ResearchSuggestion {
  type: SuggestionType;
  suggestion: string;
  reason: string;
  priority: Priority;
  estimatedValue: number;
  relatedQueries: string[];
}

export interface NamedEntity {
  text: string;
  type: EntityType;
  confidence: number;
  startPosition: number;
  endPosition: number;
  metadata?: Record<string, any>;
}

export interface TopicTag {
  topic: string;
  relevance: number;
  category: LegalArea;
  subTopics: string[];
}

export interface ResultMetadata {
  searchStrategy: string[];
  providersUsed: string[];
  cachingUsed: boolean;
  qualityScore: number;
  completeness: number;
  freshness: number;
  diversityScore: number;
}

// ===== ENUMS =====

export enum AuthorityLevel {
  SUPREME_COURT = 'supreme_court',
  APPELLATE_COURT = 'appellate_court',
  TRIAL_COURT = 'trial_court',
  ADMINISTRATIVE = 'administrative',
  ACADEMIC = 'academic',
  PRACTITIONER = 'practitioner',
  UNKNOWN = 'unknown',
}

export enum BindingLevel {
  BINDING = 'binding',
  PERSUASIVE = 'persuasive',
  DISTINGUISHABLE = 'distinguishable',
  OVERRULED = 'overruled',
  SUPERSEDED = 'superseded',
}

export enum SourceType {
  COURT_SYSTEM = 'court_system',
  LEGAL_DATABASE = 'legal_database',
  GOVERNMENT = 'government',
  ACADEMIC = 'academic',
  PROFESSIONAL = 'professional',
  NEWS = 'news',
  BLOG = 'blog',
  CUSTOM = 'custom',
}

export enum CredibilityRating {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNKNOWN = 'unknown',
}

export enum AccessLevel {
  PUBLIC = 'public',
  SUBSCRIPTION = 'subscription',
  PREMIUM = 'premium',
  RESTRICTED = 'restricted',
  INTERNAL = 'internal',
}

export enum SearchCapability {
  FULL_TEXT = 'full_text',
  SEMANTIC = 'semantic',
  CITATION = 'citation',
  METADATA = 'metadata',
  BOOLEAN = 'boolean',
  NATURAL_LANGUAGE = 'natural_language',
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  FLUCTUATING = 'fluctuating',
  EMERGING = 'emerging',
  DECLINING = 'declining',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  UNKNOWN = 'unknown',
  NOT_APPLICABLE = 'not_applicable',
}

export enum SuggestionType {
  RELATED_SEARCH = 'related_search',
  BROADER_SEARCH = 'broader_search',
  NARROWER_SEARCH = 'narrower_search',
  ALTERNATIVE_JURISDICTION = 'alternative_jurisdiction',
  RECENT_DEVELOPMENTS = 'recent_developments',
  EXPERT_CONSULTATION = 'expert_consultation',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational',
}

export enum EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  LOCATION = 'location',
  LEGAL_CONCEPT = 'legal_concept',
  STATUTE = 'statute',
  CASE = 'case',
  COURT = 'court',
  DATE = 'date',
  MONEY = 'money',
  PERCENTAGE = 'percentage',
}

// ===== VALIDATION SCHEMAS =====

export const legalResearchRequestSchema = {
  type: 'object',
  required: ['query', 'jurisdictions', 'legalAreas', 'documentTypes', 'maxResults'],
  properties: {
    query: { type: 'string', minLength: 3, maxLength: 1000 },
    jurisdictions: {
      type: 'array',
      items: { enum: Object.values(LegalJurisdiction) },
      minItems: 1,
      maxItems: 10,
    },
    legalAreas: {
      type: 'array',
      items: { enum: Object.values(LegalArea) },
      minItems: 1,
      maxItems: 5,
    },
    languages: {
      type: 'array',
      items: { enum: Object.values(SupportedLanguage) },
    },
    documentTypes: {
      type: 'array',
      items: { enum: Object.values(DocumentType) },
      minItems: 1,
    },
    maxResults: { type: 'number', minimum: 1, maximum: 100 },
    includeAnalysis: { type: 'boolean' },
    includeCitations: { type: 'boolean' },
    citationFormat: { enum: Object.values(CitationFormat) },
    complexity: { enum: Object.values(ResearchComplexity) },
    semanticSearch: { type: 'boolean' },
    includeRelatedCases: { type: 'boolean' },
    confidenceThreshold: { type: 'number', minimum: 0, maximum: 1 },
  },
};

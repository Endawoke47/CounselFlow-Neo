// Contract Intelligence Engine - Advanced Types & Interfaces
// Phase 2: Feature 2 Implementation

import { LegalJurisdiction, SupportedLanguage } from './ai.types';

// ===== CORE CONTRACT TYPES =====

export enum ContractType {
  EMPLOYMENT = 'employment',
  SERVICE_AGREEMENT = 'service_agreement',
  PURCHASE_AGREEMENT = 'purchase_agreement',
  LEASE_AGREEMENT = 'lease_agreement',
  NDA = 'nda',
  PARTNERSHIP = 'partnership',
  JOINT_VENTURE = 'joint_venture',
  LICENSING = 'licensing',
  DISTRIBUTION = 'distribution',
  FRANCHISE = 'franchise',
  MERGER_ACQUISITION = 'merger_acquisition',
  LOAN_AGREEMENT = 'loan_agreement',
  INSURANCE = 'insurance',
  CONSTRUCTION = 'construction',
  TECHNOLOGY_TRANSFER = 'technology_transfer',
  CONSULTANCY = 'consultancy',
  SUPPLY_CHAIN = 'supply_chain',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  REAL_ESTATE = 'real_estate',
  INTERNATIONAL_TRADE = 'international_trade',
}

export enum ClauseType {
  // Core Contract Clauses
  PARTIES = 'parties',
  RECITALS = 'recitals',
  DEFINITIONS = 'definitions',
  SCOPE_OF_WORK = 'scope_of_work',
  PAYMENT_TERMS = 'payment_terms',
  TERM_DURATION = 'term_duration',
  TERMINATION = 'termination',

  // Risk Management Clauses
  INDEMNIFICATION = 'indemnification',
  LIABILITY_LIMITATION = 'liability_limitation',
  WARRANTIES = 'warranties',
  REPRESENTATIONS = 'representations',
  FORCE_MAJEURE = 'force_majeure',
  INSURANCE_REQUIREMENTS = 'insurance_requirements',

  // IP and Confidentiality
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  CONFIDENTIALITY = 'confidentiality',
  NON_DISCLOSURE = 'non_disclosure',
  NON_COMPETE = 'non_compete',

  // Dispute Resolution
  DISPUTE_RESOLUTION = 'dispute_resolution',
  ARBITRATION = 'arbitration',
  MEDIATION = 'mediation',
  GOVERNING_LAW = 'governing_law',
  JURISDICTION = 'jurisdiction',

  // Compliance and Regulatory
  COMPLIANCE = 'compliance',
  REGULATORY = 'regulatory',
  DATA_PROTECTION = 'data_protection',
  ANTI_CORRUPTION = 'anti_corruption',

  // Commercial Terms
  PRICING = 'pricing',
  DELIVERY = 'delivery',
  PERFORMANCE_STANDARDS = 'performance_standards',
  SERVICE_LEVELS = 'service_levels',
  MILESTONES = 'milestones',

  // Change Management
  AMENDMENTS = 'amendments',
  CHANGE_ORDERS = 'change_orders',
  VARIATION = 'variation',

  // Miscellaneous
  ENTIRE_AGREEMENT = 'entire_agreement',
  SEVERABILITY = 'severability',
  NOTICES = 'notices',
  ASSIGNMENT = 'assignment',
  SURVIVAL = 'survival',
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical',
}

export enum RiskCategory {
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  OPERATIONAL = 'operational',
  COMPLIANCE = 'compliance',
  REPUTATIONAL = 'reputational',
  TECHNICAL = 'technical',
  COMMERCIAL = 'commercial',
  STRATEGIC = 'strategic',
  ENVIRONMENTAL = 'environmental',
  SECURITY = 'security',
}

export enum ContractAnalysisType {
  FULL_ANALYSIS = 'full_analysis',
  CLAUSE_EXTRACTION = 'clause_extraction',
  RISK_ASSESSMENT = 'risk_assessment',
  COMPLIANCE_CHECK = 'compliance_check',
  COMPARISON = 'comparison',
  TERM_EXTRACTION = 'term_extraction',
  NEGOTIATION_POINTS = 'negotiation_points',
  RED_FLAG_DETECTION = 'red_flag_detection',
}

export enum ComplianceStandard {
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  HIPAA = 'hipaa',
  SOX = 'sox',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  SOC_2 = 'soc_2',
  FCPA = 'fcpa',
  UK_BRIBERY_ACT = 'uk_bribery_act',
  LOCAL_LABOR_LAW = 'local_labor_law',
  LOCAL_COMMERCIAL_LAW = 'local_commercial_law',
  INTERNATIONAL_TRADE = 'international_trade',
}

// ===== REQUEST INTERFACES =====

export interface DocumentInput {
  content?: string;
  fileUrl?: string;
  fileBuffer?: Buffer;
  fileName?: string;
  mimeType?: string;
  encoding?: string;
}

export interface ContractAnalysisRequest {
  document: DocumentInput;
  analysisTypes: ContractAnalysisType[];
  contractType?: ContractType;
  jurisdiction: LegalJurisdiction;
  language: SupportedLanguage;
  compareWith?: ContractTemplate[];
  riskThreshold: RiskLevel;
  complianceStandards: ComplianceStandard[];
  extractionOptions: ExtractionOptions;
  analysisDepth: AnalysisDepth;
  includeRecommendations: boolean;
  confidentialityLevel: 'public' | 'confidential' | 'privileged';
}

export interface ExtractionOptions {
  extractEntities: boolean;
  extractDates: boolean;
  extractAmounts: boolean;
  extractParties: boolean;
  extractObligations: boolean;
  extractRights: boolean;
  extractConditions: boolean;
  extractPenalties: boolean;
  extractDeadlines: boolean;
  identifyMissingClauses: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  jurisdiction: LegalJurisdiction;
  clauses: TemplateClause[];
  riskProfile: RiskProfile;
  lastUpdated: Date;
}

export interface TemplateClause {
  type: ClauseType;
  content: string;
  required: boolean;
  riskLevel: RiskLevel;
  alternatives: string[];
}

// ===== RESPONSE INTERFACES =====

export interface ContractAnalysisResult {
  analysisId: string;
  document: DocumentInfo;
  contractType: ContractType;
  extractedClauses: ExtractedClause[];
  missingClauses: MissingClause[];
  identifiedRisks: IdentifiedRisk[];
  complianceChecks: ComplianceCheck[];
  extractedTerms: ExtractedTerm[];
  recommendations: Recommendation[];
  negotiationPoints: NegotiationPoint[];
  redFlags: RedFlag[];
  contractScore: ContractScore;
  comparison?: ContractComparison;
  summary: AnalysisSummary;
  metadata: AnalysisMetadata;
}

export interface DocumentInfo {
  fileName: string;
  fileSize: number;
  pageCount: number;
  wordCount: number;
  language: SupportedLanguage;
  detectedType: ContractType;
  confidence: number;
  processedAt: Date;
  checksum: string;
}

export interface ExtractedClause {
  id: string;
  type: ClauseType;
  content: string;
  location: TextLocation;
  confidence: number;
  riskLevel: RiskLevel;
  riskFactors: string[];
  suggestions: string[];
  standardCompliance: boolean;
  jurisdiction: LegalJurisdiction;
  relatedClauses: string[];
  keyTerms: ExtractedTerm[];
}

export interface MissingClause {
  type: ClauseType;
  importance: 'critical' | 'important' | 'recommended' | 'optional';
  riskImplications: string[];
  suggestedContent: string[];
  jurisdiction: LegalJurisdiction;
  alternatives: string[];
  reason: string;
}

export interface IdentifiedRisk {
  id: string;
  category: RiskCategory;
  level: RiskLevel;
  description: string;
  location: TextLocation;
  impact: RiskImpact;
  likelihood: number; // 0-1
  severity: number; // 0-1
  mitigationStrategies: MitigationStrategy[];
  relatedClauses: string[];
  complianceIssues: string[];
  recommendedActions: string[];
  jurisdiction: LegalJurisdiction;
}

export interface ComplianceCheck {
  standard: ComplianceStandard;
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'unknown';
  requirements: ComplianceRequirement[];
  issues: ComplianceIssue[];
  recommendations: string[];
  lastChecked: Date;
  jurisdiction: LegalJurisdiction;
}

export interface ExtractedTerm {
  id: string;
  type: TermType;
  value: string;
  normalizedValue: any;
  location: TextLocation;
  confidence: number;
  context: string;
  relatedTerms: string[];
  validationStatus: 'valid' | 'invalid' | 'needs_review';
  jurisdiction: LegalJurisdiction;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: Priority;
  title: string;
  description: string;
  rationale: string;
  suggestedActions: string[];
  estimatedImpact: Impact;
  relatedClauses: string[];
  jurisdiction: LegalJurisdiction;
  implementationComplexity: 'low' | 'medium' | 'high';
}

export interface NegotiationPoint {
  id: string;
  clause: ClauseType;
  issue: string;
  currentPosition: string;
  suggestedPosition: string;
  leverage: 'weak' | 'neutral' | 'strong';
  importance: Priority;
  alternativeOptions: string[];
  marketStandard: string;
  riskIfUnchanged: RiskLevel;
}

export interface RedFlag {
  id: string;
  severity: 'warning' | 'error' | 'critical';
  category: RiskCategory;
  title: string;
  description: string;
  location: TextLocation;
  potentialImpact: string[];
  immediateActions: string[];
  longTermImplications: string[];
  precedentCases?: string[];
}

export interface ContractScore {
  overall: number; // 0-100
  breakdown: ScoreBreakdown;
  benchmarkComparison: BenchmarkComparison;
  improvementAreas: ImprovementArea[];
  strengths: string[];
  weaknesses: string[];
}

export interface ContractComparison {
  baselineDocument: string;
  comparisonResults: ComparisonResult[];
  overallSimilarity: number;
  keyDifferences: Difference[];
  missingFromTarget: string[];
  additionalInTarget: string[];
  riskDelta: RiskDelta;
}

export interface AnalysisSummary {
  executionTime: number;
  analysisTypes: ContractAnalysisType[];
  clausesFound: number;
  risksIdentified: number;
  complianceIssues: number;
  recommendationsGenerated: number;
  confidenceLevel: number;
  completeness: number;
}

// ===== SUPPORTING INTERFACES =====

export interface TextLocation {
  page: number;
  paragraph: number;
  sentence: number;
  startChar: number;
  endChar: number;
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RiskImpact {
  financial: number; // Estimated financial impact
  operational: string[];
  legal: string[];
  reputational: string[];
  timeline: string; // When impact might occur
}

export interface MitigationStrategy {
  description: string;
  implementation: string[];
  cost: 'low' | 'medium' | 'high';
  effectiveness: number; // 0-1
  timeframe: string;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  mandatory: boolean;
  status: 'met' | 'not_met' | 'partially_met';
  evidence: string[];
  jurisdiction: LegalJurisdiction;
}

export interface ComplianceIssue {
  requirement: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  remediation: string[];
  deadline?: Date;
}

export interface RiskProfile {
  overall: RiskLevel;
  categories: Record<RiskCategory, number>;
  trending: 'increasing' | 'stable' | 'decreasing';
  benchmarkComparison: number;
}

export interface ScoreBreakdown {
  clauses: number;
  risks: number;
  compliance: number;
  clarity: number;
  completeness: number;
  enforceability: number;
}

export interface BenchmarkComparison {
  industry: string;
  contractType: ContractType;
  jurisdiction: LegalJurisdiction;
  percentile: number;
  averageScore: number;
  bestPracticeGap: number;
}

export interface ImprovementArea {
  area: string;
  currentScore: number;
  targetScore: number;
  priority: Priority;
  recommendations: string[];
}

export interface ComparisonResult {
  section: string;
  similarity: number;
  differences: Difference[];
  riskImplications: string[];
}

export interface Difference {
  type: 'added' | 'removed' | 'modified';
  description: string;
  location: TextLocation;
  impact: 'low' | 'medium' | 'high';
  riskChange: RiskLevel;
}

export interface RiskDelta {
  overall: number;
  categories: Record<RiskCategory, number>;
  newRisks: IdentifiedRisk[];
  resolvedRisks: string[];
}

export interface AnalysisMetadata {
  modelsUsed: string[];
  providersUsed: string[];
  analysisVersion: string;
  processingTime: number;
  accuracy: AccuracyMetrics;
  reviewStatus: 'pending' | 'reviewed' | 'approved';
  lastModified: Date;
}

export interface AccuracyMetrics {
  clauseDetection: number;
  riskAssessment: number;
  termExtraction: number;
  complianceCheck: number;
  overall: number;
}

// ===== ENUMS =====

export enum AnalysisDepth {
  BASIC = 'basic',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive',
  EXPERT = 'expert',
}

export enum TermType {
  PARTY = 'party',
  DATE = 'date',
  AMOUNT = 'amount',
  DURATION = 'duration',
  LOCATION = 'location',
  OBLIGATION = 'obligation',
  RIGHT = 'right',
  CONDITION = 'condition',
  PENALTY = 'penalty',
  DEADLINE = 'deadline',
  REFERENCE = 'reference',
  DEFINITION = 'definition',
}

export enum RecommendationType {
  CLAUSE_IMPROVEMENT = 'clause_improvement',
  RISK_MITIGATION = 'risk_mitigation',
  COMPLIANCE_FIX = 'compliance_fix',
  NEGOTIATION_STRATEGY = 'negotiation_strategy',
  BEST_PRACTICE = 'best_practice',
  LEGAL_UPDATE = 'legal_update',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational',
}

export enum Impact {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  MINIMAL = 'minimal',
}

// ===== VALIDATION SCHEMAS =====

export const contractAnalysisRequestSchema = {
  type: 'object',
  required: ['document', 'analysisTypes', 'jurisdiction', 'language', 'riskThreshold'],
  properties: {
    document: {
      type: 'object',
      required: [],
      properties: {
        content: { type: 'string' },
        fileUrl: { type: 'string', format: 'uri' },
        fileName: { type: 'string' },
        mimeType: { type: 'string' },
      },
      oneOf: [{ required: ['content'] }, { required: ['fileUrl'] }, { required: ['fileBuffer'] }],
    },
    analysisTypes: {
      type: 'array',
      items: { enum: Object.values(ContractAnalysisType) },
      minItems: 1,
    },
    contractType: { enum: Object.values(ContractType) },
    jurisdiction: { enum: Object.values(LegalJurisdiction) },
    language: { enum: Object.values(SupportedLanguage) },
    riskThreshold: { enum: Object.values(RiskLevel) },
    complianceStandards: {
      type: 'array',
      items: { enum: Object.values(ComplianceStandard) },
    },
    analysisDepth: { enum: Object.values(AnalysisDepth) },
    includeRecommendations: { type: 'boolean' },
    confidentialityLevel: { enum: ['public', 'confidential', 'privileged'] },
  },
};

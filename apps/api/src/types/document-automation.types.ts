// Document Automation Engine Types
// Phase 2: Feature 4 - AI-Powered Legal Document Generation and Management

import { LegalJurisdiction, SupportedLanguage, AIProvider } from './ai.types';
import { LegalArea } from './legal-research.types';

// Define confidentiality level locally
export enum ConfidentialityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  HIGHLY_CONFIDENTIAL = 'HIGHLY_CONFIDENTIAL',
  TOP_SECRET = 'TOP_SECRET',
}

// ================== DOCUMENT TYPES ==================

export enum DocumentType {
  // Contracts & Agreements
  SERVICE_AGREEMENT = 'SERVICE_AGREEMENT',
  EMPLOYMENT_CONTRACT = 'EMPLOYMENT_CONTRACT',
  NON_DISCLOSURE_AGREEMENT = 'NON_DISCLOSURE_AGREEMENT',
  PARTNERSHIP_AGREEMENT = 'PARTNERSHIP_AGREEMENT',
  LEASE_AGREEMENT = 'LEASE_AGREEMENT',
  SALES_CONTRACT = 'SALES_CONTRACT',
  CONSULTING_AGREEMENT = 'CONSULTING_AGREEMENT',
  VENDOR_AGREEMENT = 'VENDOR_AGREEMENT',
  DISTRIBUTION_AGREEMENT = 'DISTRIBUTION_AGREEMENT',
  LICENSING_AGREEMENT = 'LICENSING_AGREEMENT',

  // Corporate Documents
  ARTICLES_OF_INCORPORATION = 'ARTICLES_OF_INCORPORATION',
  BYLAWS = 'BYLAWS',
  BOARD_RESOLUTION = 'BOARD_RESOLUTION',
  SHAREHOLDER_AGREEMENT = 'SHAREHOLDER_AGREEMENT',
  OPERATING_AGREEMENT = 'OPERATING_AGREEMENT',
  CERTIFICATE_OF_FORMATION = 'CERTIFICATE_OF_FORMATION',
  PROXY_STATEMENT = 'PROXY_STATEMENT',
  STOCK_PURCHASE_AGREEMENT = 'STOCK_PURCHASE_AGREEMENT',

  // Legal Pleadings
  COMPLAINT = 'COMPLAINT',
  ANSWER = 'ANSWER',
  MOTION = 'MOTION',
  BRIEF = 'BRIEF',
  AFFIDAVIT = 'AFFIDAVIT',
  SUBPOENA = 'SUBPOENA',
  DISCOVERY_REQUEST = 'DISCOVERY_REQUEST',
  SETTLEMENT_AGREEMENT = 'SETTLEMENT_AGREEMENT',

  // Real Estate
  PURCHASE_AGREEMENT = 'PURCHASE_AGREEMENT',
  DEED = 'DEED',
  MORTGAGE = 'MORTGAGE',
  TITLE_INSURANCE = 'TITLE_INSURANCE',
  PROPERTY_MANAGEMENT_AGREEMENT = 'PROPERTY_MANAGEMENT_AGREEMENT',

  // Intellectual Property
  PATENT_APPLICATION = 'PATENT_APPLICATION',
  TRADEMARK_APPLICATION = 'TRADEMARK_APPLICATION',
  COPYRIGHT_REGISTRATION = 'COPYRIGHT_REGISTRATION',
  IP_ASSIGNMENT = 'IP_ASSIGNMENT',

  // Compliance & Regulatory
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  COMPLIANCE_MANUAL = 'COMPLIANCE_MANUAL',
  REGULATORY_FILING = 'REGULATORY_FILING',

  // Financial & Tax
  LOAN_AGREEMENT = 'LOAN_AGREEMENT',
  SECURITY_AGREEMENT = 'SECURITY_AGREEMENT',
  TAX_OPINION = 'TAX_OPINION',
  FINANCIAL_STATEMENT = 'FINANCIAL_STATEMENT',

  // Employment
  EMPLOYEE_HANDBOOK = 'EMPLOYEE_HANDBOOK',
  JOB_OFFER_LETTER = 'JOB_OFFER_LETTER',
  TERMINATION_AGREEMENT = 'TERMINATION_AGREEMENT',
  NON_COMPETE_AGREEMENT = 'NON_COMPETE_AGREEMENT',

  // Immigration
  VISA_APPLICATION = 'VISA_APPLICATION',
  WORK_PERMIT = 'WORK_PERMIT',
  IMMIGRATION_PETITION = 'IMMIGRATION_PETITION',

  // Other
  POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
  WILL = 'WILL',
  TRUST_AGREEMENT = 'TRUST_AGREEMENT',
  CUSTOM_DOCUMENT = 'CUSTOM_DOCUMENT',
}

export enum DocumentComplexity {
  SIMPLE = 'SIMPLE',
  STANDARD = 'STANDARD',
  COMPLEX = 'COMPLEX',
  ENTERPRISE = 'ENTERPRISE',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  EXECUTED = 'EXECUTED',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  ARCHIVED = 'ARCHIVED',
}

export enum GenerationMethod {
  TEMPLATE_BASED = 'TEMPLATE_BASED',
  AI_GENERATED = 'AI_GENERATED',
  HYBRID = 'HYBRID',
  CLAUSE_ASSEMBLY = 'CLAUSE_ASSEMBLY',
}

export enum OutputFormat {
  DOCX = 'DOCX',
  PDF = 'PDF',
  HTML = 'HTML',
  MARKDOWN = 'MARKDOWN',
  PLAIN_TEXT = 'PLAIN_TEXT',
  RTF = 'RTF',
}

// ================== TEMPLATE SYSTEM ==================

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  description: string;
  jurisdiction: LegalJurisdiction;
  legalArea: LegalArea;
  complexity: DocumentComplexity;
  language: SupportedLanguage;
  version: string;

  // Template Structure
  sections: TemplateSection[];
  variables: TemplateVariable[];
  conditionalLogic: ConditionalRule[];

  // Metadata
  author: string;
  lastModified: Date;
  usage: TemplateUsage;
  validation: TemplateValidation;

  // Legal Information
  precedentSources: string[];
  complianceRequirements: ComplianceRequirement[];
  riskFactors: RiskFactor[];
}

export interface TemplateSection {
  id: string;
  name: string;
  order: number;
  required: boolean;
  type: SectionType;
  content: string;
  variables: string[];
  conditions?: ConditionalExpression;
  subsections?: TemplateSection[];

  // Formatting
  styling: SectionStyling;
  pageBreak?: boolean;
  numbering?: NumberingStyle;
}

export enum SectionType {
  HEADER = 'HEADER',
  TITLE = 'TITLE',
  PARTIES = 'PARTIES',
  RECITALS = 'RECITALS',
  DEFINITIONS = 'DEFINITIONS',
  TERMS = 'TERMS',
  CONDITIONS = 'CONDITIONS',
  OBLIGATIONS = 'OBLIGATIONS',
  RIGHTS = 'RIGHTS',
  PAYMENTS = 'PAYMENTS',
  TERMINATION = 'TERMINATION',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  SIGNATURES = 'SIGNATURES',
  EXHIBITS = 'EXHIBITS',
  SCHEDULE = 'SCHEDULE',
  CUSTOM = 'CUSTOM',
}

export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: any;
  validation: VariableValidation;
  dependencies?: string[];
  conditional?: boolean;
  format?: string;
  helpText?: string;
}

export enum VariableType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  CURRENCY = 'CURRENCY',
  PERCENTAGE = 'PERCENTAGE',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  ADDRESS = 'ADDRESS',
  PARTY = 'PARTY',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  TABLE = 'TABLE',
  CLAUSE = 'CLAUSE',
  DOCUMENT_REFERENCE = 'DOCUMENT_REFERENCE',
}

export interface VariableValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  required?: boolean;
  custom?: ValidationRule[];
}

export interface ValidationRule {
  rule: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

// ================== GENERATION ENGINE ==================

export interface DocumentGenerationRequest {
  templateId?: string;
  documentType: DocumentType;
  generationMethod: GenerationMethod;
  jurisdiction: LegalJurisdiction;
  legalArea: LegalArea;
  language: SupportedLanguage;
  complexity: DocumentComplexity;

  // Input Data
  variables: Record<string, any>;
  parties: PartyInformation[];
  customClauses?: ClauseSelection[];

  // Configuration
  outputFormat: OutputFormat[];
  styling?: DocumentStyling;
  features: GenerationFeatures;

  // Context
  existingDocuments?: DocumentReference[];
  complianceRequirements?: string[];
  specialInstructions?: string;
  confidentialityLevel: ConfidentialityLevel;
}

export interface PartyInformation {
  id: string;
  name: string;
  type: EntityType;
  role: PartyRole;
  address: Address;
  contactInformation: ContactInfo;
  legalDetails: LegalEntityDetails;
  signatory?: SignatoryInfo;
}

export enum EntityType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATION = 'CORPORATION',
  LLC = 'LLC',
  PARTNERSHIP = 'PARTNERSHIP',
  TRUST = 'TRUST',
  GOVERNMENT = 'GOVERNMENT',
  NON_PROFIT = 'NON_PROFIT',
  FOREIGN_ENTITY = 'FOREIGN_ENTITY',
}

export enum PartyRole {
  CLIENT = 'CLIENT',
  COUNTERPARTY = 'COUNTERPARTY',
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
  CONTRACTOR = 'CONTRACTOR',
  PARTNER = 'PARTNER',
  INVESTOR = 'INVESTOR',
  BORROWER = 'BORROWER',
  LENDER = 'LENDER',
  LESSOR = 'LESSOR',
  LESSEE = 'LESSEE',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  LICENSOR = 'LICENSOR',
  LICENSEE = 'LICENSEE',
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  formatted?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;
}

export interface LegalEntityDetails {
  registrationNumber?: string;
  taxId?: string;
  incorporationJurisdiction?: string;
  registeredAddress?: Address;
  authorizedRepresentative?: string;
}

export interface SignatoryInfo {
  name: string;
  title: string;
  authority: string;
  signature?: string;
  date?: Date;
}

export interface ClauseSelection {
  clauseId: string;
  clauseType: string;
  content: string;
  variables?: Record<string, any>;
  position?: number;
  modifications?: string[];
}

export interface GenerationFeatures {
  includeTableOfContents: boolean;
  includeExecutionPage: boolean;
  includeExhibits: boolean;
  includeDefinitions: boolean;
  enableTracking: boolean;
  enableComments: boolean;
  enableReview: boolean;
  generateAlternatives: boolean;
  riskAnalysis: boolean;
  complianceCheck: boolean;
  qualityAssurance: boolean;
}

// ================== STYLING & FORMATTING ==================

export interface DocumentStyling {
  fontFamily: string;
  fontSize: number;
  margins: Margins;
  pageSize: PageSize;
  orientation: PageOrientation;
  headerFooter: HeaderFooterConfig;
  numbering: NumberingConfig;
  styles: StyleDefinition[];
}

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export enum PageSize {
  A4 = 'A4',
  LETTER = 'LETTER',
  LEGAL = 'LEGAL',
  CUSTOM = 'CUSTOM',
}

export enum PageOrientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
}

export interface HeaderFooterConfig {
  includeHeader: boolean;
  includeFooter: boolean;
  headerContent?: string;
  footerContent?: string;
  pageNumbers: boolean;
  documentTitle: boolean;
  companyLogo?: string;
}

export interface NumberingConfig {
  sections: boolean;
  subsections: boolean;
  clauses: boolean;
  pages: boolean;
  style: NumberingStyle;
}

export enum NumberingStyle {
  NUMERIC = 'NUMERIC',
  ALPHABETIC = 'ALPHABETIC',
  ROMAN = 'ROMAN',
  LEGAL = 'LEGAL',
  OUTLINE = 'OUTLINE',
}

export interface StyleDefinition {
  name: string;
  type: StyleType;
  properties: StyleProperties;
}

export enum StyleType {
  HEADING1 = 'HEADING1',
  HEADING2 = 'HEADING2',
  HEADING3 = 'HEADING3',
  NORMAL = 'NORMAL',
  CLAUSE = 'CLAUSE',
  DEFINITION = 'DEFINITION',
  SIGNATURE = 'SIGNATURE',
  EXHIBIT = 'EXHIBIT',
}

export interface StyleProperties {
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  spacing?: number;
  indentation?: number;
}

export interface SectionStyling {
  style: StyleType;
  indentation: number;
  spacing: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

// ================== CONDITIONAL LOGIC ==================

export interface ConditionalRule {
  id: string;
  name: string;
  condition: ConditionalExpression;
  actions: ConditionalAction[];
  priority: number;
}

export interface ConditionalExpression {
  type: ExpressionType;
  variable?: string;
  operator?: ComparisonOperator;
  value?: any;
  expressions?: ConditionalExpression[];
  logicalOperator?: LogicalOperator;
}

export enum ExpressionType {
  VARIABLE = 'VARIABLE',
  LITERAL = 'LITERAL',
  FUNCTION = 'FUNCTION',
  COMPOSITE = 'COMPOSITE',
}

export enum ComparisonOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS_EQUAL = 'LESS_EQUAL',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

export interface ConditionalAction {
  type: ActionType;
  target: string;
  value?: any;
  content?: string;
}

export enum ActionType {
  INCLUDE_SECTION = 'INCLUDE_SECTION',
  EXCLUDE_SECTION = 'EXCLUDE_SECTION',
  SET_VARIABLE = 'SET_VARIABLE',
  MODIFY_CONTENT = 'MODIFY_CONTENT',
  ADD_CLAUSE = 'ADD_CLAUSE',
  REMOVE_CLAUSE = 'REMOVE_CLAUSE',
  CHANGE_STYLE = 'CHANGE_STYLE',
}

// ================== RESULTS & METADATA ==================

export interface DocumentGenerationResult {
  generationId: string;
  request: DocumentGenerationRequest;
  documents: GeneratedDocument[];
  summary: GenerationSummary;
  quality: QualityAssessment;
  compliance: ComplianceAssessment;
  alternatives?: DocumentAlternative[];
  recommendations: GenerationRecommendation[];
  warnings: GenerationWarning[];
  metadata: GenerationMetadata;
}

export interface GeneratedDocument {
  id: string;
  name: string;
  type: DocumentType;
  format: OutputFormat;
  content: string | Buffer;
  size: number;
  pageCount: number;
  wordCount: number;
  sections: GeneratedSection[];
  variables: ResolvedVariable[];
  checksum: string;
  watermark?: WatermarkInfo;
}

export interface GeneratedSection {
  id: string;
  name: string;
  type: SectionType;
  content: string;
  pageStart: number;
  pageEnd: number;
  variables: string[];
  included: boolean;
  source: SectionSource;
}

export enum SectionSource {
  TEMPLATE = 'TEMPLATE',
  AI_GENERATED = 'AI_GENERATED',
  USER_PROVIDED = 'USER_PROVIDED',
  CLAUSE_LIBRARY = 'CLAUSE_LIBRARY',
}

export interface ResolvedVariable {
  name: string;
  value: any;
  type: VariableType;
  source: VariableSource;
  resolved: boolean;
  validation: ValidationResult;
}

export enum VariableSource {
  USER_INPUT = 'USER_INPUT',
  DEFAULT_VALUE = 'DEFAULT_VALUE',
  CALCULATED = 'CALCULATED',
  DERIVED = 'DERIVED',
  EXTERNAL_API = 'EXTERNAL_API',
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface GenerationSummary {
  documentsGenerated: number;
  sectionsIncluded: number;
  variablesResolved: number;
  clausesUsed: number;
  templateVersion: string;
  generationTime: number;
  complexity: DocumentComplexity;
}

export interface QualityAssessment {
  overall: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  readability: number;
  compliance: number;
  legalSoundness: number;
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: QualityIssueType;
  severity: IssueSeverity;
  description: string;
  section?: string;
  suggestion?: string;
  line?: number;
}

export enum QualityIssueType {
  MISSING_INFORMATION = 'MISSING_INFORMATION',
  INCONSISTENT_TERMS = 'INCONSISTENT_TERMS',
  UNCLEAR_LANGUAGE = 'UNCLEAR_LANGUAGE',
  POTENTIAL_AMBIGUITY = 'POTENTIAL_AMBIGUITY',
  FORMATTING_ERROR = 'FORMATTING_ERROR',
  LEGAL_RISK = 'LEGAL_RISK',
  COMPLIANCE_ISSUE = 'COMPLIANCE_ISSUE',
}

export enum IssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ComplianceAssessment {
  overallCompliance: number;
  jurisdictionalCompliance: number;
  regulatoryCompliance: number;
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
  recommendations: ComplianceRecommendation[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  jurisdiction: LegalJurisdiction;
  regulation: string;
  mandatory: boolean;
  met: boolean;
  evidence?: string;
}

export interface ComplianceViolation {
  requirementId: string;
  description: string;
  severity: IssueSeverity;
  section?: string;
  remedy: string;
}

export interface ComplianceRecommendation {
  type: string;
  description: string;
  priority: Priority;
  section?: string;
  implementation: string;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface DocumentAlternative {
  id: string;
  name: string;
  description: string;
  approach: string;
  pros: string[];
  cons: string[];
  riskLevel: RiskLevel;
  document: GeneratedDocument;
}

export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export interface GenerationRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  impact: string;
  implementation: string;
  section?: string;
}

export enum RecommendationType {
  CONTENT_IMPROVEMENT = 'CONTENT_IMPROVEMENT',
  LEGAL_OPTIMIZATION = 'LEGAL_OPTIMIZATION',
  RISK_MITIGATION = 'RISK_MITIGATION',
  COMPLIANCE_ENHANCEMENT = 'COMPLIANCE_ENHANCEMENT',
  CLARITY_IMPROVEMENT = 'CLARITY_IMPROVEMENT',
  EFFICIENCY_OPTIMIZATION = 'EFFICIENCY_OPTIMIZATION',
}

export interface GenerationWarning {
  id: string;
  type: WarningType;
  message: string;
  severity: IssueSeverity;
  section?: string;
  variable?: string;
  recommendation?: string;
}

export enum WarningType {
  MISSING_VARIABLE = 'MISSING_VARIABLE',
  INVALID_VALUE = 'INVALID_VALUE',
  POTENTIAL_CONFLICT = 'POTENTIAL_CONFLICT',
  UNUSUAL_TERM = 'UNUSUAL_TERM',
  OUTDATED_PROVISION = 'OUTDATED_PROVISION',
  JURISDICTION_MISMATCH = 'JURISDICTION_MISMATCH',
}

export interface GenerationMetadata {
  requestId: string;
  generationId: string;
  timestamp: Date;
  duration: number;
  aiModelsUsed: string[];
  providersUsed: AIProvider[];
  templatesUsed: string[];
  version: string;
  environment: string;
  user?: string;
  session?: string;
}

// ================== TEMPLATE MANAGEMENT ==================

export interface TemplateUsage {
  timesUsed: number;
  lastUsed: Date;
  averageRating: number;
  successRate: number;
  popularVariables: string[];
}

export interface TemplateValidation {
  syntaxValid: boolean;
  logicValid: boolean;
  variablesValid: boolean;
  complianceValid: boolean;
  lastValidated: Date;
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  type: ValidationIssueType;
  severity: IssueSeverity;
  description: string;
  location: string;
  suggestion?: string;
}

export enum ValidationIssueType {
  SYNTAX_ERROR = 'SYNTAX_ERROR',
  LOGIC_ERROR = 'LOGIC_ERROR',
  VARIABLE_ERROR = 'VARIABLE_ERROR',
  COMPLIANCE_ERROR = 'COMPLIANCE_ERROR',
  FORMATTING_ERROR = 'FORMATTING_ERROR',
}

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  mitigation: string;
  section?: string;
}

export interface DocumentReference {
  id: string;
  name: string;
  type: DocumentType;
  relationship: DocumentRelationship;
  relevantSections?: string[];
}

export enum DocumentRelationship {
  RELATED = 'RELATED',
  SUPERSEDES = 'SUPERSEDES',
  SUPERSEDED_BY = 'SUPERSEDED_BY',
  AMENDS = 'AMENDS',
  AMENDED_BY = 'AMENDED_BY',
  REFERENCES = 'REFERENCES',
  REFERENCED_BY = 'REFERENCED_BY',
}

export interface WatermarkInfo {
  text: string;
  position: WatermarkPosition;
  opacity: number;
  rotation?: number;
}

export enum WatermarkPosition {
  CENTER = 'CENTER',
  TOP_LEFT = 'TOP_LEFT',
  TOP_RIGHT = 'TOP_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  DIAGONAL = 'DIAGONAL',
}

// ================== EXPORT TYPES ==================

export type DocumentGenerationEngine = {
  generateDocument: (request: DocumentGenerationRequest) => Promise<DocumentGenerationResult>;
  validateTemplate: (template: DocumentTemplate) => Promise<TemplateValidation>;
  getTemplates: (filters?: TemplateFilters) => Promise<DocumentTemplate[]>;
  analyzeComplexity: (request: DocumentGenerationRequest) => Promise<ComplexityAnalysis>;
  estimateGeneration: (request: DocumentGenerationRequest) => Promise<GenerationEstimate>;
};

export interface TemplateFilters {
  type?: DocumentType;
  jurisdiction?: LegalJurisdiction;
  legalArea?: LegalArea;
  complexity?: DocumentComplexity;
  language?: SupportedLanguage;
  tags?: string[];
}

export interface ComplexityAnalysis {
  level: DocumentComplexity;
  factors: ComplexityFactor[];
  estimatedTime: number;
  recommendedApproach: GenerationMethod;
  requiredResources: string[];
}

export interface ComplexityFactor {
  name: string;
  weight: number;
  contribution: number;
  description: string;
}

export interface GenerationEstimate {
  estimatedDuration: number;
  confidence: number;
  factors: EstimationFactor[];
  recommendations: string[];
  alternatives: EstimationAlternative[];
}

export interface EstimationFactor {
  name: string;
  impact: number;
  description: string;
}

export interface EstimationAlternative {
  approach: GenerationMethod;
  duration: number;
  quality: number;
  description: string;
}

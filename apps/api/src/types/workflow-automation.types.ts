// Legal Workflow Automation Types
// Phase 3: Feature 1 - Comprehensive Workflow Management & Process Automation
// Advanced Legal Operations Platform

import { LegalJurisdiction, SupportedLanguage } from './ai.types';
import { LegalArea } from './legal-research.types';

// ============================================================================
// CORE WORKFLOW TYPES
// ============================================================================

export enum WorkflowType {
  // Document Workflows
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  DOCUMENT_APPROVAL = 'DOCUMENT_APPROVAL',
  DOCUMENT_GENERATION = 'DOCUMENT_GENERATION',
  DOCUMENT_FILING = 'DOCUMENT_FILING',

  // Case Management Workflows
  CASE_INTAKE = 'CASE_INTAKE',
  CASE_ASSIGNMENT = 'CASE_ASSIGNMENT',
  CASE_DISCOVERY = 'CASE_DISCOVERY',
  CASE_SETTLEMENT = 'CASE_SETTLEMENT',
  CASE_TRIAL_PREP = 'CASE_TRIAL_PREP',
  CASE_CLOSURE = 'CASE_CLOSURE',

  // Client Management Workflows
  CLIENT_ONBOARDING = 'CLIENT_ONBOARDING',
  CLIENT_COMMUNICATION = 'CLIENT_COMMUNICATION',
  CLIENT_BILLING = 'CLIENT_BILLING',
  CLIENT_REPORTING = 'CLIENT_REPORTING',

  // Contract Workflows
  CONTRACT_NEGOTIATION = 'CONTRACT_NEGOTIATION',
  CONTRACT_EXECUTION = 'CONTRACT_EXECUTION',
  CONTRACT_RENEWAL = 'CONTRACT_RENEWAL',
  CONTRACT_TERMINATION = 'CONTRACT_TERMINATION',

  // Legal Research Workflows
  RESEARCH_REQUEST = 'RESEARCH_REQUEST',
  RESEARCH_ANALYSIS = 'RESEARCH_ANALYSIS',
  RESEARCH_VALIDATION = 'RESEARCH_VALIDATION',
  RESEARCH_DELIVERY = 'RESEARCH_DELIVERY',

  // Compliance Workflows
  COMPLIANCE_MONITORING = 'COMPLIANCE_MONITORING',
  COMPLIANCE_REPORTING = 'COMPLIANCE_REPORTING',
  COMPLIANCE_AUDIT = 'COMPLIANCE_AUDIT',
  COMPLIANCE_REMEDIATION = 'COMPLIANCE_REMEDIATION',

  // Administrative Workflows
  DEADLINE_MANAGEMENT = 'DEADLINE_MANAGEMENT',
  CALENDAR_SCHEDULING = 'CALENDAR_SCHEDULING',
  RESOURCE_ALLOCATION = 'RESOURCE_ALLOCATION',
  PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',

  // Custom Workflows
  CUSTOM_WORKFLOW = 'CUSTOM_WORKFLOW',
}

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
  ARCHIVED = 'ARCHIVED',
}

export enum WorkflowPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum WorkflowComplexity {
  SIMPLE = 'SIMPLE', // 1-5 steps, single approval
  MODERATE = 'MODERATE', // 6-15 steps, multiple approvals
  COMPLEX = 'COMPLEX', // 16-30 steps, complex conditions
  ENTERPRISE = 'ENTERPRISE', // 30+ steps, multi-tenant, advanced logic
}

// ============================================================================
// WORKFLOW STEP TYPES
// ============================================================================

export enum StepType {
  // Action Steps
  DOCUMENT_GENERATION = 'DOCUMENT_GENERATION',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  DOCUMENT_SIGNATURE = 'DOCUMENT_SIGNATURE',
  EMAIL_NOTIFICATION = 'EMAIL_NOTIFICATION',
  SMS_NOTIFICATION = 'SMS_NOTIFICATION',
  SLACK_NOTIFICATION = 'SLACK_NOTIFICATION',
  CALENDAR_EVENT = 'CALENDAR_EVENT',
  TASK_ASSIGNMENT = 'TASK_ASSIGNMENT',
  DATA_COLLECTION = 'DATA_COLLECTION',
  DATA_VALIDATION = 'DATA_VALIDATION',

  // Decision Steps
  APPROVAL_GATE = 'APPROVAL_GATE',
  CONDITIONAL_BRANCH = 'CONDITIONAL_BRANCH',
  PARALLEL_SPLIT = 'PARALLEL_SPLIT',
  PARALLEL_JOIN = 'PARALLEL_JOIN',

  // Integration Steps
  API_CALL = 'API_CALL',
  DATABASE_QUERY = 'DATABASE_QUERY',
  FILE_TRANSFER = 'FILE_TRANSFER',
  WEBHOOK_TRIGGER = 'WEBHOOK_TRIGGER',

  // Timer Steps
  DELAY = 'DELAY',
  DEADLINE_CHECK = 'DEADLINE_CHECK',
  SCHEDULE_TRIGGER = 'SCHEDULE_TRIGGER',

  // Control Steps
  START = 'START',
  END = 'END',
  ERROR_HANDLER = 'ERROR_HANDLER',
  RETRY = 'RETRY',
  LOOP = 'LOOP',

  // Custom Steps
  CUSTOM_ACTION = 'CUSTOM_ACTION',
  SCRIPT_EXECUTION = 'SCRIPT_EXECUTION',
}

export enum StepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  TIMEOUT = 'TIMEOUT',
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  type: StepType;
  order: number;

  // Configuration
  config: StepConfiguration;

  // Conditions
  conditions?: StepCondition[];

  // Assignments
  assignedTo?: string[];
  assignedRoles?: string[];

  // Timing
  estimatedDuration?: number; // in minutes
  deadline?: Date;

  // Dependencies
  dependencies?: string[]; // step IDs
  predecessors?: string[];
  successors?: string[];

  // Status and execution
  status: StepStatus;
  startTime?: Date;
  endTime?: Date;
  actualDuration?: number;

  // Results
  output?: Record<string, any>;
  errors?: WorkflowError[];

  // Metadata
  retryCount?: number;
  maxRetries?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepConfiguration {
  // Common properties
  required?: boolean;
  automated?: boolean;

  // Document-related
  templateId?: string;
  documentType?: string;
  outputFormat?: string[];

  // Notification-related
  recipients?: string[];
  subject?: string;
  message?: string;
  channels?: string[];

  // Approval-related
  approvers?: string[];
  approvalType?: 'SINGLE' | 'MULTIPLE' | 'UNANIMOUS';
  autoApproveAfter?: number; // minutes

  // API-related
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: Record<string, any>;

  // Script-related
  script?: string;
  language?: 'JAVASCRIPT' | 'PYTHON' | 'BASH';

  // Timer-related
  delayMinutes?: number;
  scheduleExpression?: string; // cron expression

  // Custom configuration
  customProperties?: Record<string, any>;
}

export interface StepCondition {
  id: string;
  type: 'IF' | 'UNLESS' | 'WHEN' | 'WHILE';
  expression: string; // JavaScript expression
  description?: string;

  // Actions
  onTrue?: StepAction[];
  onFalse?: StepAction[];
}

export interface StepAction {
  type: 'GOTO' | 'SKIP' | 'STOP' | 'RETRY' | 'NOTIFY' | 'SET_VARIABLE';
  target?: string; // step ID or variable name
  value?: any;
  message?: string;
}

// ============================================================================
// WORKFLOW DEFINITION TYPES
// ============================================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;

  // Classification
  type: WorkflowType;
  category: string;
  tags: string[];

  // Configuration
  jurisdiction?: LegalJurisdiction;
  legalArea?: LegalArea;
  language: SupportedLanguage;
  priority: WorkflowPriority;
  complexity: WorkflowComplexity;

  // Structure
  steps: WorkflowStep[];
  variables: WorkflowVariable[];

  // Triggers
  triggers: WorkflowTrigger[];

  // Settings
  settings: WorkflowSettings;

  // Access control
  permissions: WorkflowPermissions;

  // Metadata
  isTemplate: boolean;
  isPublic: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  usageCount: number;

  // Analytics
  averageDuration?: number;
  successRate?: number;
  errorRate?: number;
}

export interface WorkflowVariable {
  name: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'OBJECT' | 'ARRAY';
  description?: string;
  defaultValue?: any;
  required?: boolean;
  validation?: VariableValidation;
  scope: 'GLOBAL' | 'STEP' | 'TEMPORARY';
}

export interface VariableValidation {
  pattern?: string; // regex pattern
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowedValues?: any[];
  customValidator?: string; // function name or expression
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  name: string;
  description?: string;

  // Configuration
  config: TriggerConfiguration;

  // Conditions
  conditions?: TriggerCondition[];

  // Status
  isActive: boolean;

  // Metadata
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export enum TriggerType {
  // Event-based triggers
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_SIGNED = 'DOCUMENT_SIGNED',
  DOCUMENT_EXPIRED = 'DOCUMENT_EXPIRED',
  CASE_CREATED = 'CASE_CREATED',
  CASE_UPDATED = 'CASE_UPDATED',
  CLIENT_REGISTERED = 'CLIENT_REGISTERED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  CONTRACT_EXECUTED = 'CONTRACT_EXECUTED',

  // Time-based triggers
  SCHEDULE = 'SCHEDULE',
  RECURRING = 'RECURRING',

  // Manual triggers
  MANUAL_START = 'MANUAL_START',
  API_TRIGGER = 'API_TRIGGER',

  // Integration triggers
  EMAIL_RECEIVED = 'EMAIL_RECEIVED',
  WEBHOOK = 'WEBHOOK',
  FILE_WATCHER = 'FILE_WATCHER',

  // System triggers
  USER_LOGIN = 'USER_LOGIN',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED',
}

export interface TriggerConfiguration {
  // Event-based
  eventType?: string;
  entityType?: string;

  // Schedule-based
  scheduleExpression?: string; // cron expression
  timezone?: string;

  // File-based
  watchPath?: string;
  filePattern?: string;

  // Webhook-based
  webhookUrl?: string;
  secretKey?: string;

  // API-based
  apiKey?: string;

  // Custom configuration
  customProperties?: Record<string, any>;
}

export interface TriggerCondition {
  field: string;
  operator:
    | 'EQUALS'
    | 'NOT_EQUALS'
    | 'CONTAINS'
    | 'STARTS_WITH'
    | 'ENDS_WITH'
    | 'GREATER_THAN'
    | 'LESS_THAN'
    | 'IN'
    | 'NOT_IN';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowSettings {
  // Execution settings
  timeout?: number; // in minutes
  maxRetries?: number;
  retryDelay?: number; // in minutes

  // Parallel execution
  maxParallelSteps?: number;

  // Error handling
  onError: 'STOP' | 'CONTINUE' | 'RETRY' | 'NOTIFY';
  errorNotificationRecipients?: string[];

  // Logging and monitoring
  enableDetailedLogging?: boolean;
  enablePerformanceMetrics?: boolean;

  // Security
  requireApprovalForExecution?: boolean;
  allowedExecutors?: string[];

  // Notifications
  enableNotifications?: boolean;
  notificationChannels?: string[];

  // Data retention
  retentionPeriod?: number; // in days
  archiveAfterCompletion?: boolean;
}

export interface WorkflowPermissions {
  // View permissions
  viewBy: 'OWNER' | 'TEAM' | 'ORGANIZATION' | 'PUBLIC';
  viewers?: string[];

  // Edit permissions
  editBy: 'OWNER' | 'COLLABORATORS' | 'TEAM' | 'ORGANIZATION';
  editors?: string[];

  // Execute permissions
  executeBy: 'OWNER' | 'ASSIGNED' | 'TEAM' | 'ORGANIZATION';
  executors?: string[];

  // Admin permissions
  adminBy: 'OWNER' | 'ADMINS';
  admins?: string[];
}

// ============================================================================
// WORKFLOW EXECUTION TYPES
// ============================================================================

export interface WorkflowExecution {
  id: string;
  workflowDefinitionId: string;
  workflowName: string;
  version: string;

  // Execution context
  triggeredBy: string;
  triggerType: TriggerType;
  triggerData?: Record<string, any>;

  // Status and timing
  status: WorkflowStatus;
  priority: WorkflowPriority;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds

  // Current state
  currentStep?: string;
  nextSteps?: string[];
  completedSteps: string[];
  failedSteps: string[];
  skippedSteps: string[];

  // Variables and data
  variables: Record<string, any>;
  context: ExecutionContext;

  // Results
  output?: Record<string, any>;
  errors?: WorkflowError[];
  warnings?: WorkflowWarning[];

  // Metrics
  metrics: ExecutionMetrics;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionContext {
  // User context
  userId: string;
  userRoles: string[];

  // Organization context
  organizationId: string;
  teamId?: string;

  // Case context
  caseId?: string;
  clientId?: string;
  matterId?: string;

  // Document context
  documentIds?: string[];

  // Request context
  requestId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;

  // Custom context
  customData?: Record<string, any>;
}

export interface ExecutionMetrics {
  // Performance metrics
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;

  // Timing metrics
  totalDuration: number;
  averageStepDuration: number;
  longestStep: string;
  longestStepDuration: number;

  // Resource metrics
  memoryUsage: number;
  cpuUsage: number;
  apiCalls: number;

  // Business metrics
  documentsGenerated: number;
  notificationsSent: number;
  approvalsRequired: number;
  approvalsReceived: number;
}

export interface WorkflowError {
  id: string;
  stepId: string;
  stepName: string;

  // Error details
  code: string;
  message: string;
  details?: string;
  stackTrace?: string;

  // Classification
  type: 'VALIDATION' | 'EXECUTION' | 'TIMEOUT' | 'PERMISSION' | 'INTEGRATION' | 'SYSTEM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // Context
  context?: Record<string, any>;

  // Resolution
  resolutionStatus: 'PENDING' | 'RESOLVED' | 'IGNORED';
  resolutionAction?: string;

  // Metadata
  timestamp: Date;
  retryable: boolean;
  retryCount: number;
}

export interface WorkflowWarning {
  id: string;
  stepId?: string;

  // Warning details
  code: string;
  message: string;
  details?: string;

  // Classification
  type: 'PERFORMANCE' | 'DATA_QUALITY' | 'BUSINESS_RULE' | 'BEST_PRACTICE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';

  // Metadata
  timestamp: Date;
  acknowledged: boolean;
}

// ============================================================================
// WORKFLOW ANALYTICS TYPES
// ============================================================================

export interface WorkflowAnalytics {
  workflowId: string;
  workflowName: string;

  // Usage analytics
  totalExecutions: number;
  recentExecutions: number; // last 30 days
  averageExecutionsPerDay: number;

  // Performance analytics
  averageDuration: number;
  medianDuration: number;
  fastestExecution: number;
  slowestExecution: number;

  // Success analytics
  successRate: number;
  errorRate: number;
  timeoutRate: number;

  // Step analytics
  stepPerformance: StepAnalytics[];
  bottleneckSteps: string[];
  errorProneSteps: string[];

  // Business metrics
  costSavings: number;
  timesSaved: number; // in hours
  documentsGenerated: number;
  approvalsProcessed: number;

  // Trends
  usageTrend: TrendData[];
  performanceTrend: TrendData[];
  errorTrend: TrendData[];

  // Metadata
  lastCalculated: Date;
  period: AnalyticsPeriod;
}

export interface StepAnalytics {
  stepId: string;
  stepName: string;
  stepType: StepType;

  // Performance
  averageDuration: number;
  successRate: number;
  errorRate: number;
  timeoutRate: number;

  // Usage
  totalExecutions: number;
  skipRate: number;

  // Common errors
  commonErrors: ErrorSummary[];
}

export interface ErrorSummary {
  errorCode: string;
  errorMessage: string;
  occurrences: number;
  lastOccurrence: Date;
  resolution?: string;
}

export interface TrendData {
  date: Date;
  value: number;
  change?: number; // percentage change from previous period
}

export enum AnalyticsPeriod {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  LAST_YEAR = 'LAST_YEAR',
  CUSTOM = 'CUSTOM',
}

// ============================================================================
// WORKFLOW TEMPLATE TYPES
// ============================================================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  version: string;

  // Classification
  category: WorkflowCategory;
  type: WorkflowType;
  complexity: WorkflowComplexity;
  jurisdiction?: LegalJurisdiction;
  legalArea?: LegalArea;

  // Template definition
  definition: WorkflowDefinition;

  // Configuration
  configurationSchema: TemplateConfigurationSchema;
  defaultConfiguration: Record<string, any>;

  // Customization
  customizableSteps: string[];
  requiredVariables: string[];
  optionalVariables: string[];

  // Usage
  isPublic: boolean;
  usageCount: number;
  rating: number;
  reviews: TemplateReview[];

  // Metadata
  createdBy: string;
  organizationId?: string;
  tags: string[];
  keywords: string[];

  // Pricing (for marketplace templates)
  pricing?: TemplatePricing;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export enum WorkflowCategory {
  CASE_MANAGEMENT = 'CASE_MANAGEMENT',
  DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
  CLIENT_MANAGEMENT = 'CLIENT_MANAGEMENT',
  CONTRACT_MANAGEMENT = 'CONTRACT_MANAGEMENT',
  COMPLIANCE = 'COMPLIANCE',
  RESEARCH = 'RESEARCH',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  BILLING = 'BILLING',
  CUSTOM = 'CUSTOM',
}

export interface TemplateConfigurationSchema {
  properties: Record<string, SchemaProperty>;
  required: string[];
  groups?: ConfigurationGroup[];
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title: string;
  description?: string;
  default?: any;
  enum?: any[];
  format?: string;
  validation?: PropertyValidation;
}

export interface PropertyValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
}

export interface ConfigurationGroup {
  name: string;
  title: string;
  description?: string;
  properties: string[];
  collapsible?: boolean;
  expanded?: boolean;
}

export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface TemplatePricing {
  type: 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'USAGE_BASED';
  price?: number;
  currency?: string;
  billingPeriod?: 'MONTHLY' | 'YEARLY';
  usageMetric?: string; // for usage-based pricing
  trialPeriod?: number; // days
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationConfiguration {
  id: string;
  name: string;
  description?: string;

  // Triggers
  triggers: NotificationTrigger[];

  // Recipients
  recipients: NotificationRecipient[];

  // Channels
  channels: NotificationChannel[];

  // Content
  templates: NotificationTemplate[];

  // Settings
  settings: NotificationSettings;

  // Status
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTrigger {
  event: NotificationEvent;
  conditions?: NotificationCondition[];
  delay?: number; // minutes to delay notification
}

export enum NotificationEvent {
  WORKFLOW_STARTED = 'WORKFLOW_STARTED',
  WORKFLOW_COMPLETED = 'WORKFLOW_COMPLETED',
  WORKFLOW_FAILED = 'WORKFLOW_FAILED',
  WORKFLOW_TIMEOUT = 'WORKFLOW_TIMEOUT',
  STEP_REQUIRES_APPROVAL = 'STEP_REQUIRES_APPROVAL',
  STEP_FAILED = 'STEP_FAILED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  DEADLINE_MISSED = 'DEADLINE_MISSED',
  CUSTOM_EVENT = 'CUSTOM_EVENT',
}

export interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface NotificationRecipient {
  type: 'USER' | 'ROLE' | 'TEAM' | 'EMAIL' | 'EXTERNAL';
  identifier: string;
  name?: string;
  preferences?: RecipientPreferences;
}

export interface RecipientPreferences {
  channels: string[];
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  quietHours?: QuietHours;
  timezone?: string;
}

export interface QuietHours {
  start: string; // HH:MM format
  end: string; // HH:MM format
  timezone: string;
}

export interface NotificationChannel {
  type: NotificationChannelType;
  config: ChannelConfiguration;
  isActive: boolean;
}

export enum NotificationChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  SLACK = 'SLACK',
  TEAMS = 'TEAMS',
  WEBHOOK = 'WEBHOOK',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

export interface ChannelConfiguration {
  // Email
  smtpServer?: string;
  fromAddress?: string;

  // SMS
  smsProvider?: string;
  fromNumber?: string;

  // Slack
  slackWebhook?: string;
  slackChannel?: string;

  // Teams
  teamsWebhook?: string;

  // Webhook
  webhookUrl?: string;
  headers?: Record<string, string>;

  // Push
  pushProvider?: string;

  // Custom properties
  customProperties?: Record<string, any>;
}

export interface NotificationTemplate {
  channel: NotificationChannelType;
  event: NotificationEvent;
  subject?: string;
  body: string;
  format: 'PLAIN' | 'HTML' | 'MARKDOWN';
  variables: string[];
}

export interface NotificationSettings {
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  retryAttempts: number;
  retryDelay: number; // minutes
  deduplication: boolean;
  deduplicationWindow: number; // minutes
  batchingEnabled: boolean;
  batchingWindow: number; // minutes
  maxBatchSize: number;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface IntegrationConfiguration {
  id: string;
  name: string;
  description?: string;
  type: IntegrationType;

  // Connection
  connection: IntegrationConnection;

  // Mapping
  fieldMappings: FieldMapping[];

  // Triggers
  triggers: IntegrationTrigger[];

  // Settings
  settings: IntegrationSettings;

  // Status
  isActive: boolean;
  lastSync?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export enum IntegrationType {
  // Document Management Systems
  SHAREPOINT = 'SHAREPOINT',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  DROPBOX = 'DROPBOX',
  BOX = 'BOX',

  // Legal Software
  WESTLAW = 'WESTLAW',
  LEXIS_NEXIS = 'LEXIS_NEXIS',
  CLIO = 'CLIO',
  MYCASE = 'MYCASE',
  PRACTICE_PANTHER = 'PRACTICE_PANTHER',

  // CRM Systems
  SALESFORCE = 'SALESFORCE',
  HUBSPOT = 'HUBSPOT',
  PIPEDRIVE = 'PIPEDRIVE',

  // Communication
  OUTLOOK = 'OUTLOOK',
  GMAIL = 'GMAIL',
  SLACK = 'SLACK',
  MICROSOFT_TEAMS = 'MICROSOFT_TEAMS',

  // E-signature
  DOCUSIGN = 'DOCUSIGN',
  ADOBE_SIGN = 'ADOBE_SIGN',
  HELLOSIGN = 'HELLOSIGN',

  // Accounting
  QUICKBOOKS = 'QUICKBOOKS',
  XERO = 'XERO',
  SAGE = 'SAGE',

  // Calendar
  GOOGLE_CALENDAR = 'GOOGLE_CALENDAR',
  OUTLOOK_CALENDAR = 'OUTLOOK_CALENDAR',

  // Custom
  REST_API = 'REST_API',
  SOAP_API = 'SOAP_API',
  WEBHOOK = 'WEBHOOK',
  DATABASE = 'DATABASE',
  CUSTOM = 'CUSTOM',
}

export interface IntegrationConnection {
  authType: 'OAUTH2' | 'API_KEY' | 'BASIC_AUTH' | 'BEARER_TOKEN' | 'CUSTOM';
  credentials: Record<string, string>;
  endpoint?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: FieldTransformation;
  isRequired?: boolean;
  defaultValue?: any;
}

export interface FieldTransformation {
  type: 'DIRECT' | 'CONCAT' | 'SPLIT' | 'FORMAT' | 'LOOKUP' | 'CUSTOM';
  parameters?: Record<string, any>;
  script?: string;
}

export interface IntegrationTrigger {
  event: string;
  action: string;
  conditions?: IntegrationCondition[];
  delay?: number;
}

export interface IntegrationCondition {
  field: string;
  operator: string;
  value: any;
}

export interface IntegrationSettings {
  syncDirection: 'BIDIRECTIONAL' | 'INCOMING' | 'OUTGOING';
  syncFrequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  batchSize?: number;
  errorHandling: 'STOP' | 'CONTINUE' | 'RETRY';
  conflictResolution: 'SOURCE_WINS' | 'TARGET_WINS' | 'MANUAL' | 'TIMESTAMP';
  enableLogging?: boolean;
  enableNotifications?: boolean;
}

// ============================================================================
// REQUEST AND RESPONSE TYPES
// ============================================================================

export interface WorkflowExecutionRequest {
  workflowId: string;
  triggerType?: TriggerType;
  variables?: Record<string, any>;
  context?: Partial<ExecutionContext>;
  priority?: WorkflowPriority;
  metadata?: Record<string, any>;
}

export interface WorkflowExecutionResponse {
  executionId: string;
  status: WorkflowStatus;
  message?: string;
  estimatedDuration?: number;
  nextSteps?: string[];
  errors?: WorkflowError[];
}

export interface WorkflowAnalyticsRequest {
  workflowIds?: string[];
  period: AnalyticsPeriod;
  startDate?: Date;
  endDate?: Date;
  includeStepAnalytics?: boolean;
  includeTrends?: boolean;
  groupBy?: 'WORKFLOW' | 'CATEGORY' | 'USER' | 'ORGANIZATION';
}

export interface WorkflowAnalyticsResponse {
  analytics: WorkflowAnalytics[];
  summary: AnalyticsSummary;
  recommendations?: AnalyticsRecommendation[];
}

export interface AnalyticsSummary {
  totalWorkflows: number;
  totalExecutions: number;
  averageSuccessRate: number;
  averageDuration: number;
  topPerformingWorkflows: string[];
  bottleneckWorkflows: string[];
  costSavings: number;
  timeSaved: number;
}

export interface AnalyticsRecommendation {
  type: 'OPTIMIZATION' | 'ERROR_REDUCTION' | 'PERFORMANCE' | 'COST_SAVINGS';
  title: string;
  description: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  workflowIds: string[];
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// All interfaces and types are exported inline above

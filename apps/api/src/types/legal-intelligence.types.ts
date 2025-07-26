// Legal Intelligence Types - Analytics and Insights Dashboard
// Phase 2: Feature 3 Implementation

import { LegalJurisdiction, SupportedLanguage, AIProvider } from './ai.types';
import { LegalArea, DocumentType } from './legal-research.types';
import { ContractType, RiskLevel } from './contract-intelligence.types';

// ===== CORE INTELLIGENCE TYPES =====

export enum IntelligenceType {
  TREND_ANALYSIS = 'trend_analysis',
  PREDICTIVE_MODELING = 'predictive_modeling',
  COMPARATIVE_ANALYSIS = 'comparative_analysis',
  RISK_INTELLIGENCE = 'risk_intelligence',
  MARKET_INTELLIGENCE = 'market_intelligence',
  REGULATORY_INTELLIGENCE = 'regulatory_intelligence',
  CASE_OUTCOME_PREDICTION = 'case_outcome_prediction',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
}

export enum AnalyticsPeriod {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_6_MONTHS = 'last_6_months',
  LAST_YEAR = 'last_year',
  LAST_2_YEARS = 'last_2_years',
  CUSTOM_RANGE = 'custom_range',
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile',
  SEASONAL = 'seasonal',
}

export enum InsightCategory {
  LEGAL_TRENDS = 'legal_trends',
  REGULATORY_CHANGES = 'regulatory_changes',
  MARKET_DYNAMICS = 'market_dynamics',
  RISK_PATTERNS = 'risk_patterns',
  CASE_OUTCOMES = 'case_outcomes',
  CONTRACT_PATTERNS = 'contract_patterns',
  COMPLIANCE_ISSUES = 'compliance_issues',
  JURISDICTIONAL_DIFFERENCES = 'jurisdictional_differences',
}

export enum PredictionConfidence {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

// ===== ANALYTICS REQUEST TYPES =====

export interface LegalIntelligenceRequest {
  analysisTypes: IntelligenceType[];
  jurisdictions: LegalJurisdiction[];
  legalAreas: LegalArea[];
  period: AnalyticsPeriod;
  customDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  filters: AnalyticsFilters;
  insights: InsightConfiguration;
  language: SupportedLanguage;
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface AnalyticsFilters {
  documentTypes?: DocumentType[];
  contractTypes?: ContractType[];
  riskLevels?: RiskLevel[];
  caseTypes?: string[];
  industries?: string[];
  companySizes?: CompanySize[];
  transactionValues?: ValueRange[];
  practitionerTypes?: PractitionerType[];
  courtLevels?: CourtLevel[];
}

export interface InsightConfiguration {
  includeRecommendations: boolean;
  includePredictions: boolean;
  includeComparisons: boolean;
  includeTrends: boolean;
  includeAlerts: boolean;
  detailLevel: 'summary' | 'detailed' | 'comprehensive';
  visualizations: VisualizationType[];
}

export enum CompanySize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
  MULTINATIONAL = 'multinational',
}

export interface ValueRange {
  min: number;
  max: number;
  currency: string;
}

export enum PractitionerType {
  LAWYER = 'lawyer',
  JUDGE = 'judge',
  ARBITRATOR = 'arbitrator',
  MEDIATOR = 'mediator',
  LEGAL_COUNSEL = 'legal_counsel',
  PARALEGAL = 'paralegal',
  LEGAL_ADVISOR = 'legal_advisor',
}

export enum CourtLevel {
  MAGISTRATE = 'magistrate',
  DISTRICT = 'district',
  HIGH_COURT = 'high_court',
  APPELLATE = 'appellate',
  SUPREME = 'supreme',
  CONSTITUTIONAL = 'constitutional',
  COMMERCIAL = 'commercial',
  ARBITRATION = 'arbitration',
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  HEATMAP = 'heatmap',
  SCATTER_PLOT = 'scatter_plot',
  TREEMAP = 'treemap',
  SUNBURST = 'sunburst',
  GEOGRAPHICAL_MAP = 'geographical_map',
  NETWORK_DIAGRAM = 'network_diagram',
  TIMELINE = 'timeline',
}

// ===== ANALYTICS RESULT TYPES =====

export interface LegalIntelligenceResult {
  analysisId: string;
  requestSummary: RequestSummary;
  trendAnalysis: TrendAnalysisResult[];
  predictiveInsights: PredictiveInsight[];
  comparativeAnalysis: ComparativeAnalysisResult[];
  riskIntelligence: RiskIntelligenceResult;
  marketIntelligence: MarketIntelligenceResult;
  regulatoryIntelligence: RegulatoryIntelligenceResult;
  keyInsights: KeyInsight[];
  recommendations: IntelligenceRecommendation[];
  alerts: IntelligenceAlert[];
  visualizations: VisualizationData[];
  metadata: AnalyticsMetadata;
}

export interface RequestSummary {
  analysisTypes: IntelligenceType[];
  coveragePeriod: AnalyticsPeriod;
  jurisdictionsAnalyzed: LegalJurisdiction[];
  legalAreasAnalyzed: LegalArea[];
  dataPointsProcessed: number;
  executionTime: number;
  confidenceLevel: number;
}

// ===== TREND ANALYSIS =====

export interface TrendAnalysisResult {
  id: string;
  category: InsightCategory;
  jurisdiction: LegalJurisdiction;
  legalArea: LegalArea;
  trend: TrendData;
  patterns: PatternData[];
  seasonality: SeasonalityData;
  anomalies: AnomalyData[];
  forecast: ForecastData;
  significance: StatisticalSignificance;
}

export interface TrendData {
  direction: TrendDirection;
  magnitude: number;
  velocity: number;
  acceleration: number;
  confidence: PredictionConfidence;
  timeSeriesData: TimeSeriesPoint[];
  trendLine: TrendLineData;
}

export interface TimeSeriesPoint {
  date: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface TrendLineData {
  slope: number;
  intercept: number;
  rSquared: number;
  equation: string;
}

export interface PatternData {
  type: 'cyclical' | 'seasonal' | 'irregular' | 'trend';
  description: string;
  frequency: number;
  amplitude: number;
  phase: number;
  significance: number;
}

export interface SeasonalityData {
  hasSeasonality: boolean;
  seasonalPeriod?: number;
  seasonalStrength?: number;
  peakMonths?: number[];
  lowMonths?: number[];
}

export interface AnomalyData {
  date: Date;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  possibleCauses: string[];
}

export interface ForecastData {
  predictions: ForecastPoint[];
  confidenceIntervals: ConfidenceInterval[];
  methodology: string;
  accuracy: number;
  horizon: number;
}

export interface ForecastPoint {
  date: Date;
  predictedValue: number;
  confidence: PredictionConfidence;
}

export interface ConfidenceInterval {
  date: Date;
  lower: number;
  upper: number;
  level: number; // e.g., 95 for 95% confidence interval
}

export interface StatisticalSignificance {
  pValue: number;
  confidenceLevel: number;
  isSignificant: boolean;
  testStatistic: number;
  testType: string;
}

// ===== PREDICTIVE INSIGHTS =====

export interface PredictiveInsight {
  id: string;
  type: PredictionType;
  jurisdiction: LegalJurisdiction;
  prediction: PredictionResult;
  factors: PredictiveFactors;
  scenarios: ScenarioAnalysis[];
  recommendations: PredictionRecommendation[];
  confidence: PredictionConfidence;
  timeframe: string;
}

export enum PredictionType {
  CASE_OUTCOME = 'case_outcome',
  REGULATORY_CHANGE = 'regulatory_change',
  MARKET_SHIFT = 'market_shift',
  RISK_EMERGENCE = 'risk_emergence',
  COMPLIANCE_REQUIREMENT = 'compliance_requirement',
  LEGAL_TREND = 'legal_trend',
  CONTRACT_DISPUTE = 'contract_dispute',
  POLICY_IMPACT = 'policy_impact',
}

export interface PredictionResult {
  outcome: string;
  probability: number;
  impactScore: number;
  certaintyLevel: PredictionConfidence;
  supportingEvidence: string[];
  contradictingEvidence: string[];
}

export interface PredictiveFactors {
  primaryFactors: Factor[];
  secondaryFactors: Factor[];
  correlations: FactorCorrelation[];
  featureImportance: FeatureImportance[];
}

export interface Factor {
  name: string;
  value: number;
  weight: number;
  direction: 'positive' | 'negative' | 'neutral';
  significance: number;
  description: string;
}

export interface FactorCorrelation {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
}

export interface ScenarioAnalysis {
  name: string;
  description: string;
  probability: number;
  outcomes: ScenarioOutcome[];
  riskFactors: string[];
  opportunities: string[];
  timeline: string;
}

export interface ScenarioOutcome {
  outcome: string;
  likelihood: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  consequences: string[];
}

export interface PredictionRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeline: string;
  expectedImpact: string;
  resources: string[];
  stakeholders: string[];
}

// ===== COMPARATIVE ANALYSIS =====

export interface ComparativeAnalysisResult {
  id: string;
  comparisonType: ComparisonType;
  subjects: ComparisonSubject[];
  metrics: ComparisonMetric[];
  insights: ComparisonInsight[];
  rankings: Ranking[];
  benchmarks: Benchmark[];
}

export enum ComparisonType {
  JURISDICTIONAL = 'jurisdictional',
  TEMPORAL = 'temporal',
  CATEGORICAL = 'categorical',
  PEER_ANALYSIS = 'peer_analysis',
  BEST_PRACTICE = 'best_practice',
}

export interface ComparisonSubject {
  id: string;
  name: string;
  type: string;
  jurisdiction?: LegalJurisdiction;
  metadata: Record<string, any>;
}

export interface ComparisonMetric {
  name: string;
  values: Record<string, number>; // subject ID -> value
  unit: string;
  direction: 'higher_better' | 'lower_better' | 'neutral';
  weight: number;
}

export interface ComparisonInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  subject: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface Ranking {
  metric: string;
  rankings: RankingEntry[];
}

export interface RankingEntry {
  subject: string;
  rank: number;
  score: number;
  percentile: number;
}

export interface Benchmark {
  metric: string;
  benchmarkValue: number;
  benchmarkType: 'industry' | 'peer' | 'best_practice' | 'regulatory';
  subjects: BenchmarkComparison[];
}

export interface BenchmarkComparison {
  subject: string;
  value: number;
  deviation: number;
  performance: 'above' | 'at' | 'below' | 'significantly_below';
}

// ===== SPECIALIZED INTELLIGENCE RESULTS =====

export interface RiskIntelligenceResult {
  riskLandscape: RiskLandscapeData;
  emergingRisks: EmergingRisk[];
  riskTrends: RiskTrendData[];
  riskCorrelations: RiskCorrelation[];
  mitigationStrategies: RiskMitigationStrategy[];
  riskScores: JurisdictionalRiskScore[];
}

export interface RiskLandscapeData {
  totalRisks: number;
  riskDistribution: Record<RiskLevel, number>;
  topRiskCategories: CategoryRisk[];
  riskEvolution: RiskEvolutionData[];
}

export interface EmergingRisk {
  id: string;
  name: string;
  description: string;
  jurisdiction: LegalJurisdiction;
  category: string;
  probability: number;
  impact: RiskLevel;
  timeframe: string;
  indicators: string[];
  sources: string[];
}

export interface RiskTrendData {
  category: string;
  trend: TrendDirection;
  changePercentage: number;
  timeframe: string;
  jurisdiction: LegalJurisdiction;
}

export interface RiskCorrelation {
  risk1: string;
  risk2: string;
  correlation: number;
  confidence: number;
  jurisdiction: LegalJurisdiction;
}

export interface RiskMitigationStrategy {
  riskCategory: string;
  strategy: string;
  effectiveness: number;
  cost: 'low' | 'medium' | 'high';
  timeframe: string;
  applicableJurisdictions: LegalJurisdiction[];
}

export interface JurisdictionalRiskScore {
  jurisdiction: LegalJurisdiction;
  overallScore: number;
  categoryScores: Record<string, number>;
  ranking: number;
  trend: TrendDirection;
}

export interface CategoryRisk {
  category: string;
  riskCount: number;
  averageImpact: number;
  trend: TrendDirection;
}

export interface RiskEvolutionData {
  date: Date;
  riskCount: number;
  severity: number;
  newRisks: number;
  resolvedRisks: number;
}

export interface MarketIntelligenceResult {
  marketOverview: MarketOverview;
  competitiveAnalysis: CompetitiveAnalysis;
  opportunityAnalysis: OpportunityAnalysis[];
  marketTrends: MarketTrend[];
  pricingIntelligence: PricingIntelligence;
  demandForecasting: DemandForecast[];
}

export interface MarketOverview {
  marketSize: number;
  marketGrowth: number;
  keyPlayers: MarketPlayer[];
  marketSegments: MarketSegment[];
  geographicalDistribution: GeographicalData[];
}

export interface MarketPlayer {
  name: string;
  marketShare: number;
  revenue: number;
  jurisdiction: LegalJurisdiction;
  specializations: string[];
}

export interface MarketSegment {
  name: string;
  size: number;
  growth: number;
  characteristics: string[];
}

export interface GeographicalData {
  jurisdiction: LegalJurisdiction;
  marketSize: number;
  growth: number;
  penetration: number;
}

export interface CompetitiveAnalysis {
  competitivePosition: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitivePressure: number;
}

export interface OpportunityAnalysis {
  opportunity: string;
  marketSize: number;
  timeframe: string;
  requirements: string[];
  barriers: string[];
  riskLevel: RiskLevel;
  jurisdiction: LegalJurisdiction;
}

export interface MarketTrend {
  trend: string;
  description: string;
  impact: 'disruptive' | 'significant' | 'moderate' | 'minimal';
  timeframe: string;
  affectedSegments: string[];
  jurisdiction: LegalJurisdiction;
}

export interface PricingIntelligence {
  averagePricing: Record<string, number>;
  pricingTrends: PricingTrend[];
  competitivePricing: CompetitivePricing[];
  pricingFactors: PricingFactor[];
}

export interface PricingTrend {
  service: string;
  trend: TrendDirection;
  changePercentage: number;
  jurisdiction: LegalJurisdiction;
}

export interface CompetitivePricing {
  service: string;
  averagePrice: number;
  priceRange: ValueRange;
  jurisdiction: LegalJurisdiction;
}

export interface PricingFactor {
  factor: string;
  impact: number;
  direction: 'increases' | 'decreases' | 'varies';
}

export interface DemandForecast {
  service: string;
  currentDemand: number;
  forecastedDemand: number;
  growth: number;
  confidence: PredictionConfidence;
  jurisdiction: LegalJurisdiction;
  timeframe: string;
}

export interface RegulatoryIntelligenceResult {
  regulatoryLandscape: RegulatoryLandscape;
  upcomingChanges: RegulatoryChange[];
  complianceGaps: ComplianceGap[];
  regulatoryTrends: RegulatoryTrend[];
  impactAssessment: RegulatoryImpactAssessment[];
}

export interface RegulatoryLandscape {
  totalRegulations: number;
  recentChanges: number;
  pendingChanges: number;
  jurisdictionalComplexity: Record<LegalJurisdiction, number>;
  regulatoryBurden: RegulatoryBurden[];
}

export interface RegulatoryChange {
  id: string;
  title: string;
  description: string;
  jurisdiction: LegalJurisdiction;
  effectiveDate: Date;
  impact: 'minor' | 'moderate' | 'significant' | 'major';
  affectedAreas: LegalArea[];
  requirements: string[];
  complianceDeadline: Date;
}

export interface ComplianceGap {
  regulation: string;
  jurisdiction: LegalJurisdiction;
  gapDescription: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  remediation: string[];
  deadline: Date;
}

export interface RegulatoryTrend {
  trend: string;
  description: string;
  jurisdictions: LegalJurisdiction[];
  timeline: string;
  implications: string[];
}

export interface RegulatoryImpactAssessment {
  regulation: string;
  jurisdiction: LegalJurisdiction;
  businessImpact: BusinessImpact;
  complianceCost: ComplianceCost;
  timeline: string;
  recommendations: string[];
}

export interface BusinessImpact {
  operationalImpact: 'minimal' | 'moderate' | 'significant' | 'transformative';
  financialImpact: number;
  resourceRequirements: string[];
  riskLevel: RiskLevel;
}

export interface ComplianceCost {
  implementationCost: number;
  ongoingCost: number;
  penaltyCost: number;
  totalCost: number;
  paybackPeriod: string;
}

export interface RegulatoryBurden {
  jurisdiction: LegalJurisdiction;
  burdenScore: number;
  complexity: number;
  changeFrequency: number;
  complianceCost: number;
}

// ===== KEY INSIGHTS & RECOMMENDATIONS =====

export interface KeyInsight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction: LegalJurisdiction;
  evidence: InsightEvidence[];
  implications: string[];
  confidence: PredictionConfidence;
  actionable: boolean;
}

export interface InsightEvidence {
  source: string;
  data: any;
  reliability: number;
  date: Date;
}

export interface IntelligenceRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  jurisdiction: LegalJurisdiction;
  category: InsightCategory;
  actions: RecommendedAction[];
  timeline: string;
  resources: Resource[];
  expectedOutcome: string;
  successMetrics: string[];
}

export enum RecommendationType {
  STRATEGIC = 'strategic',
  OPERATIONAL = 'operational',
  COMPLIANCE = 'compliance',
  RISK_MITIGATION = 'risk_mitigation',
  OPPORTUNITY = 'opportunity',
  COST_OPTIMIZATION = 'cost_optimization',
  PROCESS_IMPROVEMENT = 'process_improvement',
}

export interface RecommendedAction {
  action: string;
  priority: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  dependencies: string[];
  owner: string;
}

export interface Resource {
  type: 'human' | 'financial' | 'technological' | 'legal';
  description: string;
  quantity: number;
  cost: number;
}

export interface IntelligenceAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: InsightCategory;
  title: string;
  description: string;
  jurisdiction: LegalJurisdiction;
  triggerConditions: AlertCondition[];
  recommendations: string[];
  escalationLevel: number;
  expiryDate: Date;
}

export interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '==' | '!=' | '>=' | '<=';
  threshold: number;
  currentValue: number;
}

// ===== VISUALIZATION DATA =====

export interface VisualizationData {
  id: string;
  type: VisualizationType;
  title: string;
  description: string;
  data: ChartData;
  configuration: ChartConfiguration;
  interactivity: InteractivityOptions;
}

export interface ChartData {
  datasets: Dataset[];
  labels: string[];
  metadata: ChartMetadata;
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string;
  borderWidth?: number;
  tension?: number;
}

export interface ChartConfiguration {
  responsive: boolean;
  maintainAspectRatio: boolean;
  scales?: ScaleConfiguration;
  plugins?: PluginConfiguration;
  animation?: AnimationConfiguration;
}

export interface ScaleConfiguration {
  x?: AxisConfiguration;
  y?: AxisConfiguration;
}

export interface AxisConfiguration {
  type: 'linear' | 'logarithmic' | 'category' | 'time';
  position: 'left' | 'right' | 'top' | 'bottom';
  title: AxisTitle;
  min?: number;
  max?: number;
}

export interface AxisTitle {
  display: boolean;
  text: string;
}

export interface PluginConfiguration {
  legend?: LegendConfiguration;
  tooltip?: TooltipConfiguration;
}

export interface LegendConfiguration {
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface TooltipConfiguration {
  enabled: boolean;
  mode: 'point' | 'nearest' | 'index' | 'dataset';
}

export interface AnimationConfiguration {
  duration: number;
  easing: string;
}

export interface InteractivityOptions {
  clickable: boolean;
  hoverable: boolean;
  zoomable: boolean;
  drillDown: boolean;
  exportable: boolean;
}

export interface ChartMetadata {
  lastUpdated: Date;
  dataSource: string;
  refreshInterval: number;
  jurisdiction: LegalJurisdiction;
}

// ===== ANALYTICS METADATA =====

export interface AnalyticsMetadata {
  requestId: string;
  executionTime: number;
  dataSourcesUsed: string[];
  modelsUsed: string[];
  providersUsed: AIProvider[];
  accuracy: AccuracyMetrics;
  coverage: CoverageMetrics;
  limitations: string[];
  recommendations: string[];
  version: string;
  processedAt: Date;
}

export interface AccuracyMetrics {
  overall: number;
  trendAnalysis: number;
  predictions: number;
  insights: number;
  recommendations: number;
}

export interface CoverageMetrics {
  jurisdictionalCoverage: number;
  temporalCoverage: number;
  dataCompleteness: number;
  sampleSize: number;
}

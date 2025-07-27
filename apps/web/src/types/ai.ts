/**
 * AI Contract Analysis Types
 * TypeScript interfaces for AI-powered contract analysis
 */

export interface ContractRiskAssessment {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  confidence: number;
  location?: {
    section: string;
    clause: string;
  };
}

export interface ContractRiskAnalysis {
  contractId?: string;
  analysisId: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  totalRisks: number;
  risksByCategory: {
    [category: string]: number;
  };
  riskAssessments: ContractRiskAssessment[];
  recommendations: string[];
  complianceIssues: string[];
  executiveOverview: string;
  analysisTimestamp: string;
  analysisMetadata: {
    contractType: string;
    jurisdiction: string;
    aiModel: string;
    processingTime: number;
  };
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'standard' | 'unusual' | 'problematic' | 'missing';
  importance: 'low' | 'medium' | 'high' | 'critical';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  position: {
    startOffset: number;
    endOffset: number;
    section?: string;
  };
  analysis: {
    description: string;
    implications: string[];
    recommendations: string[];
  };
}

export interface ContractClauseExtraction {
  contractId?: string;
  extractionId: string;
  totalClauses: number;
  clausesByCategory: {
    [category: string]: number;
  };
  clauses: ContractClause[];
  missingStandardClauses: string[];
  unusualClauses: ContractClause[];
  problematicClauses: ContractClause[];
  extractionMetadata: {
    contractType: string;
    processingTime: number;
    aiModel: string;
    confidence: number;
  };
  analysisTimestamp: string;
}

export interface ContractDifference {
  id: string;
  type: 'addition' | 'deletion' | 'modification' | 'structural';
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  contract1Content?: string;
  contract2Content?: string;
  impact: string;
  recommendation: string;
  position: {
    section: string;
    clause?: string;
  };
}

export interface ContractComparison {
  comparisonId: string;
  contract1Id?: string;
  contract2Id?: string;
  overallSimilarity: number;
  totalDifferences: number;
  differencesByCategory: {
    [category: string]: number;
  };
  differences: ContractDifference[];
  structuralChanges: string[];
  riskChanges: {
    increased: string[];
    decreased: string[];
  };
  recommendations: string[];
  executiveSummary: string;
  comparisonMetadata: {
    processingTime: number;
    aiModel: string;
    focusAreas?: string[];
  };
  analysisTimestamp: string;
}

export interface ContractKeyPoint {
  category: string;
  title: string;
  content: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: string;
}

export interface ContractSummary {
  contractId?: string;
  summaryId: string;
  contractType: string;
  contractTitle: string;
  parties: string[];
  effectiveDate?: string;
  expirationDate?: string;
  jurisdiction: string;
  executiveSummary: string;
  keyTerms: ContractKeyPoint[];
  financialTerms: {
    currency?: string;
    totalValue?: number;
    paymentTerms: string[];
    penaltyClauses: string[];
  };
  obligations: {
    party: string;
    obligations: string[];
  }[];
  riskHighlights: string[];
  recommendedActions: string[];
  criticalDates: {
    type: string;
    date: string;
    description: string;
  }[];
  summaryMetadata: {
    processingTime: number;
    aiModel: string;
    confidence: number;
  };
  analysisTimestamp: string;
}

export interface AIContractCapabilities {
  supportedAnalysisTypes: string[];
  supportedContractTypes: string[];
  supportedLanguages: string[];
  supportedJurisdictions: string[];
  features: {
    [featureName: string]: {
      enabled: boolean;
      description: string;
    };
  };
  limitations: string[];
}

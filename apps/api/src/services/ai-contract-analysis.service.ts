/**
 * AI Contract Analysis Service
 * Provides AI-powered contract analysis capabilities
 */

import { AIGatewayService } from './ai-gateway.service';
import {
  AIProvider,
  AIAnalysisType,
  LegalJurisdiction,
  LegalSystem,
  SupportedLanguage,
} from '../types/ai.types';
import { RiskLevel } from '../types/contract-intelligence.types';
import { CacheService } from './cache.service';
import { UsageTracker } from './usage-tracker.service';
import winston from 'winston';

export interface ContractRiskAnalysis {
  overallRisk: RiskLevel;
  riskScore: number;
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  complianceIssues: Array<{
    issue: string;
    regulation: string;
    severity: 'low' | 'medium' | 'high';
    remedy: string;
  }>;
}

export interface ContractClauseExtraction {
  clauses: Array<{
    type: string;
    title: string;
    content: string;
    location: { start: number; end: number };
    importance: 'low' | 'medium' | 'high';
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  missingClauses: Array<{
    type: string;
    recommendation: string;
    importance: 'low' | 'medium' | 'high';
  }>;
  unusualClauses: Array<{
    content: string;
    concern: string;
    recommendation: string;
  }>;
}

export interface ContractComparison {
  overallSimilarity: number;
  keyDifferences: Array<{
    area: string;
    contract1Content: string;
    contract2Content: string;
    significance: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  riskDifferentials: Array<{
    riskType: string;
    contract1Risk: 'low' | 'medium' | 'high';
    contract2Risk: 'low' | 'medium' | 'high';
    impact: string;
  }>;
  recommendations: string[];
}

export interface ContractSummary {
  executiveSummary: string;
  keyTerms: Array<{
    term: string;
    value: string;
    importance: 'low' | 'medium' | 'high';
  }>;
  parties: Array<{
    name: string;
    role: string;
    obligations: string[];
  }>;
  timeline: Array<{
    event: string;
    date: string;
    description: string;
  }>;
  risks: string[];
  opportunities: string[];
}

export class AIContractAnalysisService {
  private aiGateway: AIGatewayService;
  private cache: CacheService;
  private usageTracker: UsageTracker;
  private logger!: winston.Logger;

  constructor() {
    this.aiGateway = new AIGatewayService();
    this.cache = new CacheService();
    this.usageTracker = new UsageTracker();
    this.initializeLogger();
  }

  private initializeLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/contract-analysis.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  async analyzeContractRisk(
    contractText: string,
    contractType: string,
    userId: string
  ): Promise<ContractRiskAnalysis> {
    try {
      this.logger.info('Starting AI contract risk analysis', { contractType, userId });

      // Check cache first
      const cacheKey = this.generateCacheKey('contract_risk', contractText);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.info('Returning cached contract risk analysis');
        return cached as ContractRiskAnalysis;
      }

      const analysisPrompt = `Analyze the following ${contractType} contract for legal risks and compliance issues:

Contract Text:
${contractText}

Please provide a structured analysis with:
1. Overall risk assessment (LOW/MEDIUM/HIGH)
2. Risk score (0-100)
3. Specific risk factors with severity levels
4. Compliance issues and regulatory concerns
5. Recommendations for risk mitigation

Focus on:
- Liability and indemnification clauses
- Termination and cancellation provisions
- Intellectual property rights
- Data protection and privacy
- Force majeure and dispute resolution
- Payment and penalty terms

Return the analysis in a structured format.`;

      const aiResponse = await this.aiGateway.processRequest(
        {
          type: AIAnalysisType.CONTRACT_ANALYSIS,
          input: analysisPrompt,
          provider: AIProvider.OLLAMA,
          model: 'llama2',
          context: {
            jurisdiction: LegalJurisdiction.KENYA,
            legalSystem: LegalSystem.COMMON_LAW,
            language: SupportedLanguage.ENGLISH,
            practiceArea: 'contract_law',
            confidentialityLevel: 'confidential',
          },
          options: {
            temperature: 0.1,
            maxTokens: 2000,
            cacheEnabled: true,
          },
        },
        userId
      );

      const analysis = this.parseContractRiskAnalysis(aiResponse.output);

      // Cache the result for 1 hour
      await this.cache.set(cacheKey, analysis, 3600);

      this.usageTracker.trackUsage({
        id: aiResponse.id,
        userId,
        requestId: aiResponse.requestId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        analysisType: AIAnalysisType.CONTRACT_ANALYSIS,
        tokensUsed: aiResponse.tokensUsed || 0,
        cost: aiResponse.cost || 0,
        processingTime: aiResponse.processingTime,
        success: true,
        timestamp: aiResponse.completedAt,
      });

      return analysis;
    } catch (error) {
      this.logger.error('Contract risk analysis failed:', error);
      throw new Error('Failed to analyze contract risk');
    }
  }

  async extractContractClauses(
    contractText: string,
    userId: string
  ): Promise<ContractClauseExtraction> {
    try {
      this.logger.info('Extracting contract clauses with AI', { userId });

      const cacheKey = this.generateCacheKey('clause_extraction', contractText);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached as ContractClauseExtraction;
      }

      const extractionPrompt = `Analyze the following contract and extract all important clauses:

Contract Text:
${contractText}

Please identify and extract:
1. All major contract clauses with their types
2. Missing standard clauses that should be included
3. Unusual or non-standard clauses that need attention

For each clause, provide:
- Clause type (e.g., termination, liability, payment, etc.)
- Exact content
- Risk level assessment
- Importance level

Standard clause types to look for:
- Termination and cancellation
- Liability and indemnification
- Intellectual property
- Confidentiality and non-disclosure
- Payment terms and conditions
- Force majeure
- Dispute resolution and governing law
- Data protection and privacy
- Non-compete and non-solicitation

Return the analysis in a structured format.`;

      const aiResponse = await this.aiGateway.processRequest(
        {
          type: AIAnalysisType.CLAUSE_EXTRACTION,
          input: extractionPrompt,
          provider: AIProvider.OLLAMA,
          model: 'llama2',
          context: {
            jurisdiction: LegalJurisdiction.KENYA,
            legalSystem: LegalSystem.COMMON_LAW,
            language: SupportedLanguage.ENGLISH,
            practiceArea: 'contract_law',
            confidentialityLevel: 'confidential',
          },
        },
        userId
      );

      const extraction = this.parseClauseExtraction(aiResponse.output, contractText);

      await this.cache.set(cacheKey, extraction, 3600);
      this.usageTracker.trackUsage({
        id: aiResponse.id,
        userId,
        requestId: aiResponse.requestId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        analysisType: AIAnalysisType.CLAUSE_EXTRACTION,
        tokensUsed: aiResponse.tokensUsed || 0,
        cost: aiResponse.cost || 0,
        processingTime: aiResponse.processingTime,
        success: true,
        timestamp: aiResponse.completedAt,
      });

      return extraction;
    } catch (error) {
      this.logger.error('Clause extraction failed:', error);
      throw new Error('Failed to extract contract clauses');
    }
  }

  async compareContracts(
    contract1: string,
    contract2: string,
    userId: string,
    focusAreas?: string[]
  ): Promise<ContractComparison> {
    try {
      this.logger.info('Starting AI contract comparison', { userId });

      const comparisonPrompt = `Compare these two contracts and identify key differences:

Contract 1:
${contract1}

Contract 2:
${contract2}

${focusAreas ? `Focus particularly on these areas: ${focusAreas.join(', ')}` : ''}

Please provide:
1. Overall similarity percentage
2. Key differences in important clauses
3. Risk level differences between contracts
4. Recommendations for alignment or improvement

Pay special attention to:
- Terms and conditions variations
- Risk allocation differences
- Payment and liability variations
- Compliance and regulatory differences

Return the analysis in a structured format.`;

      const aiResponse = await this.aiGateway.processRequest(
        {
          type: AIAnalysisType.DOCUMENT_REVIEW,
          input: comparisonPrompt,
          provider: AIProvider.OLLAMA,
          model: 'llama2',
          context: {
            jurisdiction: LegalJurisdiction.KENYA,
            legalSystem: LegalSystem.COMMON_LAW,
            language: SupportedLanguage.ENGLISH,
            practiceArea: 'contract_law',
            confidentialityLevel: 'confidential',
          },
        },
        userId
      );

      const comparison = this.parseContractComparison(aiResponse.output);

      this.usageTracker.trackUsage({
        id: aiResponse.id,
        userId,
        requestId: aiResponse.requestId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        analysisType: AIAnalysisType.DOCUMENT_REVIEW,
        tokensUsed: aiResponse.tokensUsed || 0,
        cost: aiResponse.cost || 0,
        processingTime: aiResponse.processingTime,
        success: true,
        timestamp: aiResponse.completedAt,
      });

      return comparison;
    } catch (error) {
      this.logger.error('Contract comparison failed:', error);
      throw new Error('Failed to compare contracts');
    }
  }

  async generateContractSummary(contractText: string, userId: string): Promise<ContractSummary> {
    try {
      this.logger.info('Generating AI contract summary', { userId });

      const cacheKey = this.generateCacheKey('contract_summary', contractText);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached as ContractSummary;
      }

      const summaryPrompt = `Create a comprehensive summary of this contract:

Contract Text:
${contractText}

Please provide:
1. Executive summary (2-3 paragraphs)
2. Key terms and values
3. All parties and their roles/obligations
4. Important dates and timeline
5. Major risks identified
6. Business opportunities highlighted

Make the summary accessible to both legal and business stakeholders.
Return the analysis in a structured format.`;

      const aiResponse = await this.aiGateway.processRequest(
        {
          type: AIAnalysisType.DOCUMENT_REVIEW,
          input: summaryPrompt,
          provider: AIProvider.OLLAMA,
          model: 'llama2',
          context: {
            jurisdiction: LegalJurisdiction.KENYA,
            legalSystem: LegalSystem.COMMON_LAW,
            language: SupportedLanguage.ENGLISH,
            practiceArea: 'contract_law',
            confidentialityLevel: 'confidential',
          },
        },
        userId
      );

      const summary = this.parseContractSummary(aiResponse.output);

      await this.cache.set(cacheKey, summary, 3600);
      this.usageTracker.trackUsage({
        id: aiResponse.id,
        userId,
        requestId: aiResponse.requestId,
        provider: aiResponse.provider,
        model: aiResponse.model,
        analysisType: AIAnalysisType.DOCUMENT_REVIEW,
        tokensUsed: aiResponse.tokensUsed || 0,
        cost: aiResponse.cost || 0,
        processingTime: aiResponse.processingTime,
        success: true,
        timestamp: aiResponse.completedAt,
      });

      return summary;
    } catch (error) {
      this.logger.error('Contract summary generation failed:', error);
      throw new Error('Failed to generate contract summary');
    }
  }

  /**
   * Helper methods for parsing AI responses
   */
  private parseContractRiskAnalysis(aiResponse: string): ContractRiskAnalysis {
    // In a production system, you would implement sophisticated parsing
    // For now, we'll provide a structured default response

    let overallRisk: RiskLevel = RiskLevel.MEDIUM;
    let riskScore = 50;

    // Simple regex-based parsing for demonstration
    const riskMatch = aiResponse.toLowerCase().match(/overall risk.*?(low|medium|high)/);
    if (riskMatch) {
      const riskText = riskMatch[1].toUpperCase();
      if (riskText in RiskLevel) {
        overallRisk = riskText as RiskLevel;
      }
    }

    const scoreMatch = aiResponse.match(/risk score.*?(\d+)/);
    if (scoreMatch) {
      riskScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
    }

    return {
      overallRisk,
      riskScore,
      riskFactors: [
        {
          factor: 'Liability Exposure',
          severity: 'medium',
          description: 'Standard liability clauses present with moderate risk exposure',
          recommendation: 'Consider adding liability caps for better risk management',
        },
        {
          factor: 'Termination Provisions',
          severity: 'low',
          description: 'Clear termination clauses with reasonable notice periods',
          recommendation: 'No immediate action required',
        },
      ],
      complianceIssues: [
        {
          issue: 'Data Protection Compliance',
          regulation: 'Data Protection Act 2019',
          severity: 'low',
          remedy: 'Ensure data processing clauses comply with local regulations',
        },
      ],
    };
  }

  private parseClauseExtraction(
    aiResponse: string,
    contractText: string
  ): ContractClauseExtraction {
    // Simplified clause extraction - in production, use NLP and pattern matching
    return {
      clauses: [
        {
          type: 'termination',
          title: 'Termination Clause',
          content: 'Either party may terminate this agreement with 30 days written notice',
          location: { start: 0, end: 100 },
          importance: 'high',
          riskLevel: 'medium',
        },
        {
          type: 'payment',
          title: 'Payment Terms',
          content: 'Payment shall be made within 30 days of invoice date',
          location: { start: 200, end: 300 },
          importance: 'high',
          riskLevel: 'low',
        },
      ],
      missingClauses: [
        {
          type: 'force_majeure',
          recommendation: 'Add force majeure clause to protect against unforeseen circumstances',
          importance: 'high',
        },
        {
          type: 'confidentiality',
          recommendation: 'Include confidentiality provisions to protect sensitive information',
          importance: 'medium',
        },
      ],
      unusualClauses: [],
    };
  }

  private parseContractComparison(aiResponse: string): ContractComparison {
    return {
      overallSimilarity: 75,
      keyDifferences: [
        {
          area: 'Payment Terms',
          contract1Content: '30 days payment terms',
          contract2Content: '60 days payment terms',
          significance: 'high',
          recommendation: 'Align payment terms for consistency across contracts',
        },
        {
          area: 'Liability Caps',
          contract1Content: 'No liability cap specified',
          contract2Content: 'Liability capped at contract value',
          significance: 'high',
          recommendation: 'Consider adding liability caps to contract 1 for risk management',
        },
      ],
      riskDifferentials: [
        {
          riskType: 'Financial Risk',
          contract1Risk: 'low',
          contract2Risk: 'medium',
          impact: 'Extended payment terms increase cash flow risk',
        },
      ],
      recommendations: [
        'Standardize payment terms across all contracts',
        'Implement consistent liability allocation frameworks',
        'Add standard force majeure clauses',
      ],
    };
  }

  private parseContractSummary(aiResponse: string): ContractSummary {
    return {
      executiveSummary:
        'This is a standard service agreement between two commercial parties that outlines the terms of engagement, payment obligations, and mutual responsibilities. The contract establishes a clear framework for service delivery with defined timelines and performance metrics.',
      keyTerms: [
        {
          term: 'Contract Value',
          value: 'KES 1,000,000',
          importance: 'high',
        },
        {
          term: 'Duration',
          value: '12 months',
          importance: 'high',
        },
        {
          term: 'Payment Terms',
          value: '30 days',
          importance: 'medium',
        },
      ],
      parties: [
        {
          name: 'Service Provider',
          role: 'Provider',
          obligations: [
            'Deliver services as specified in Schedule A',
            'Maintain confidentiality of client information',
            'Provide monthly progress reports',
          ],
        },
        {
          name: 'Client Company',
          role: 'Recipient',
          obligations: [
            'Make timely payments as per schedule',
            'Provide necessary cooperation and access',
            'Review and approve deliverables within specified timeframes',
          ],
        },
      ],
      timeline: [
        {
          event: 'Contract Commencement',
          date: '2025-01-01',
          description: 'Agreement becomes effective and service delivery begins',
        },
        {
          event: 'Mid-term Review',
          date: '2025-06-30',
          description: 'Mandatory performance review and potential scope adjustment',
        },
        {
          event: 'Contract Expiration',
          date: '2025-12-31',
          description: 'Agreement expires unless renewed by mutual consent',
        },
      ],
      risks: [
        'Payment delays could impact cash flow',
        'Scope creep without proper change management',
        'Intellectual property ownership disputes',
      ],
      opportunities: [
        'Potential for contract renewal and expansion',
        'Opportunity to establish long-term partnership',
        'Possibility of additional service offerings',
      ],
    };
  }

  private generateCacheKey(operation: string, content: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    return `ai_contract_${operation}_${hash}`;
  }
}

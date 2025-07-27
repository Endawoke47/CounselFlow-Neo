/**
 * 🧪 LEGAL INTELLIGENCE SERVICE COMPREHENSIVE UNIT TESTS
 *
 * Testing the Legal Intelligence service including:
 * - Main intelligence analysis method
 * - Trend analysis and predictions
 * - Error handling and validation
 * - Caching mechanisms
 * - Performance monitoring
 */

import { LegalIntelligenceService } from '../../services/legal-intelligence.service';
import {
  IntelligenceType,
  AnalyticsPeriod,
  TrendDirection,
  PredictionConfidence,
  InsightCategory,
  LegalIntelligenceRequest,
} from '../../types/legal-intelligence.types';
import { LegalJurisdiction, SupportedLanguage } from '../../types/ai.types';
import { LegalArea } from '../../types/legal-research.types';
import { RiskLevel } from '../../types/contract-intelligence.types';

// Mock dependencies
jest.mock('../../services/ai-gateway.service');
jest.mock('../../services/cache.service');
jest.mock('../../services/usage-tracker.service');

// Mock winston logger properly
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

describe('LegalIntelligenceService', () => {
  let legalIntelligence: LegalIntelligenceService;
  let mockAIGateway: any;
  let mockCache: any;
  let mockUsageTracker: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock AI Gateway
    mockAIGateway = {
      processRequest: jest.fn(),
      getUsageMetrics: jest.fn().mockReturnValue({
        totalRequests: 500,
        successfulRequests: 485,
        averageResponseTime: 120,
      }),
    };

    // Mock Cache Service
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
      has: jest.fn(),
    };

    // Mock Usage Tracker
    mockUsageTracker = {
      trackRequest: jest.fn(),
      trackResponse: jest.fn(),
      getAnalytics: jest.fn().mockReturnValue({
        requestsPerHour: 45,
        peakUsageTime: '14:00',
        mostRequestedInsights: ['trend_analysis', 'risk_assessment'],
      }),
    };

    // Initialize service
    legalIntelligence = new LegalIntelligenceService();

    // Inject mocks
    (legalIntelligence as any).aiGateway = mockAIGateway;
    (legalIntelligence as any).cache = mockCache;
    (legalIntelligence as any).usageTracker = mockUsageTracker;
  });

  describe('Service Initialization', () => {
    it('should initialize analytics models successfully', () => {
      const analyticsModels = (legalIntelligence as any).analyticsModels;

      expect(analyticsModels.has('trend_analysis')).toBe(true);
      expect(analyticsModels.has('predictive_modeling')).toBe(true);
      expect(analyticsModels.has('sentiment_analysis')).toBe(true);
      expect(analyticsModels.has('comparative_analysis')).toBe(true);
    });

    it('should initialize data connectors for multiple jurisdictions', () => {
      const dataConnectors = (legalIntelligence as any).dataConnectors;

      expect(dataConnectors.size).toBeGreaterThan(0);
    });
  });

  describe('Main Intelligence Analysis', () => {
    it('should process legal intelligence request successfully', async () => {
      const intelligenceRequest: LegalIntelligenceRequest = {
        analysisTypes: [IntelligenceType.TREND_ANALYSIS],
        jurisdictions: [LegalJurisdiction.NIGERIA],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: true,
          includePredictions: true,
          includeComparisons: false,
          includeTrends: true,
          includeAlerts: false,
          detailLevel: 'comprehensive',
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal',
      };

      const expectedResult = {
        analysisId: 'test-analysis-123',
        requestSummary: {
          analysisTypes: [IntelligenceType.TREND_ANALYSIS],
          coveragePeriod: AnalyticsPeriod.LAST_6_MONTHS,
          jurisdictionsAnalyzed: [LegalJurisdiction.NIGERIA],
          legalAreasAnalyzed: [LegalArea.EMPLOYMENT],
          dataPointsProcessed: 2847,
          executionTime: 2500,
          confidenceLevel: 0.89,
        },
        trendAnalysis: [
          {
            id: 'trend-001',
            category: InsightCategory.LEGAL_TRENDS,
            jurisdiction: LegalJurisdiction.NIGERIA,
            legalArea: LegalArea.EMPLOYMENT,
            trend: {
              direction: TrendDirection.INCREASING,
              magnitude: 0.35,
              velocity: 0.12,
              acceleration: 0.05,
              confidence: PredictionConfidence.HIGH,
              timeSeriesData: [],
              trendLine: { slope: 0.35, intercept: 0.2, rSquared: 0.85 },
            },
            patterns: [],
            seasonality: { isPresent: false, seasonType: null, strength: 0 },
            anomalies: [],
            forecast: {
              predictions: [],
              confidence: PredictionConfidence.MEDIUM,
              horizon: '6_months',
            },
            significance: {
              pValue: 0.01,
              confidenceInterval: { lower: 0.25, upper: 0.45 },
              isSignificant: true,
            },
          },
        ],
        predictiveInsights: [],
        comparativeAnalysis: [],
        riskIntelligence: {
          overallRiskScore: 45,
          riskLevel: RiskLevel.MEDIUM,
          riskFactors: [],
          riskTrends: [],
          mitigationStrategies: [],
          predictions: [],
        },
        marketIntelligence: {
          marketOverview: {
            size: 1200000000,
            growth: 0.15,
            volatility: 0.08,
            competition: 'moderate',
          },
          sectors: [],
          trends: [],
          opportunities: [],
          threats: [],
        },
        regulatoryIntelligence: {
          recentChanges: [],
          upcomingChanges: [],
          impactAssessments: [],
          complianceGaps: [],
          recommendations: [],
        },
        keyInsights: [],
        recommendations: [],
        alerts: [],
        visualizations: [],
        metadata: {
          generatedAt: new Date(),
          processingTime: 2500,
          dataQuality: { score: 0.89, issues: [] },
          sources: ['court_records', 'legal_database'],
          version: '1.0',
          requestId: 'req-123',
        },
      };

      mockCache.get.mockReturnValue(null); // No cached result
      mockAIGateway.processRequest.mockResolvedValue({
        result: JSON.stringify(expectedResult),
        confidence: 0.89,
        processingTime: 2500,
      });

      const result = await legalIntelligence.analyzeLegalIntelligence(intelligenceRequest);

      expect(result).toBeDefined();
      expect(result.requestSummary.analysisTypes).toContain(IntelligenceType.TREND_ANALYSIS);
      expect(mockUsageTracker.trackRequest).toHaveBeenCalledWith(intelligenceRequest);
      expect(mockAIGateway.processRequest).toHaveBeenCalled();
    });

    it('should validate request parameters', async () => {
      const invalidRequest = {
        analysisTypes: [], // Empty array should be invalid
        jurisdictions: [LegalJurisdiction.NIGERIA],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: false,
          includePredictions: false,
          includeComparisons: false,
          includeTrends: false,
          includeAlerts: false,
          detailLevel: 'summary' as const,
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal' as const,
      } as LegalIntelligenceRequest;

      await expect(legalIntelligence.analyzeLegalIntelligence(invalidRequest)).rejects.toThrow();
    });

    it('should utilize caching for repeated requests', async () => {
      const cachedResult = {
        analysisId: 'cached-analysis-456',
        requestSummary: {
          analysisTypes: [IntelligenceType.TREND_ANALYSIS],
          coveragePeriod: AnalyticsPeriod.LAST_6_MONTHS,
          jurisdictionsAnalyzed: [LegalJurisdiction.NIGERIA],
          legalAreasAnalyzed: [LegalArea.EMPLOYMENT],
          dataPointsProcessed: 1500,
          executionTime: 100,
          confidenceLevel: 0.85,
        },
        trendAnalysis: [],
        predictiveInsights: [],
        comparativeAnalysis: [],
        riskIntelligence: {
          overallRiskScore: 40,
          riskLevel: RiskLevel.LOW,
          riskFactors: [],
          riskTrends: [],
          mitigationStrategies: [],
          predictions: [],
        },
        marketIntelligence: {
          marketOverview: { size: 0, growth: 0, volatility: 0, competition: 'low' },
          sectors: [],
          trends: [],
          opportunities: [],
          threats: [],
        },
        regulatoryIntelligence: {
          recentChanges: [],
          upcomingChanges: [],
          impactAssessments: [],
          complianceGaps: [],
          recommendations: [],
        },
        keyInsights: [],
        recommendations: [],
        alerts: [],
        visualizations: [],
        metadata: {
          generatedAt: new Date(),
          processingTime: 100,
          dataQuality: { score: 0.85, issues: [] },
          sources: [],
          version: '1.0',
          requestId: 'cached-req',
        },
      };

      mockCache.get.mockReturnValue(cachedResult);

      const intelligenceRequest: LegalIntelligenceRequest = {
        analysisTypes: [IntelligenceType.TREND_ANALYSIS],
        jurisdictions: [LegalJurisdiction.NIGERIA],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: false,
          includePredictions: false,
          includeComparisons: false,
          includeTrends: true,
          includeAlerts: false,
          detailLevel: 'summary',
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal',
      };

      const result = await legalIntelligence.analyzeLegalIntelligence(intelligenceRequest);

      expect(result.analysisId).toBe('cached-analysis-456');
      expect(mockCache.get).toHaveBeenCalled();
      expect(mockAIGateway.processRequest).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle AI gateway failures gracefully', async () => {
      const intelligenceRequest: LegalIntelligenceRequest = {
        analysisTypes: [IntelligenceType.TREND_ANALYSIS],
        jurisdictions: [LegalJurisdiction.NIGERIA],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: false,
          includePredictions: false,
          includeComparisons: false,
          includeTrends: true,
          includeAlerts: false,
          detailLevel: 'summary',
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal',
      };

      mockCache.get.mockReturnValue(null);
      mockAIGateway.processRequest.mockRejectedValue(new Error('AI Gateway timeout'));

      await expect(legalIntelligence.analyzeLegalIntelligence(intelligenceRequest)).rejects.toThrow(
        'AI Gateway timeout'
      );

      expect(mockUsageTracker.trackRequest).toHaveBeenCalledWith(intelligenceRequest);
    });

    it('should handle invalid jurisdiction requests', async () => {
      const invalidRequest: LegalIntelligenceRequest = {
        analysisTypes: [IntelligenceType.TREND_ANALYSIS],
        jurisdictions: ['INVALID_JURISDICTION' as any],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: false,
          includePredictions: false,
          includeComparisons: false,
          includeTrends: true,
          includeAlerts: false,
          detailLevel: 'summary',
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal',
      };

      await expect(legalIntelligence.analyzeLegalIntelligence(invalidRequest)).rejects.toThrow();
    });

    it('should handle cache failures gracefully', async () => {
      const intelligenceRequest: LegalIntelligenceRequest = {
        analysisTypes: [IntelligenceType.TREND_ANALYSIS],
        jurisdictions: [LegalJurisdiction.NIGERIA],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: false,
          includePredictions: false,
          includeComparisons: false,
          includeTrends: true,
          includeAlerts: false,
          detailLevel: 'summary',
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal',
      };

      // Simulate cache failure
      mockCache.get.mockRejectedValue(new Error('Cache service unavailable'));

      const expectedResult = {
        analysisId: 'no-cache-404',
        requestSummary: {
          analysisTypes: [IntelligenceType.TREND_ANALYSIS],
          coveragePeriod: AnalyticsPeriod.LAST_6_MONTHS,
          jurisdictionsAnalyzed: [LegalJurisdiction.NIGERIA],
          legalAreasAnalyzed: [LegalArea.EMPLOYMENT],
          dataPointsProcessed: 1000,
          executionTime: 2000,
          confidenceLevel: 0.75,
        },
        trendAnalysis: [],
        predictiveInsights: [],
        comparativeAnalysis: [],
        riskIntelligence: {
          overallRiskScore: 30,
          riskLevel: RiskLevel.LOW,
          riskFactors: [],
          riskTrends: [],
          mitigationStrategies: [],
          predictions: [],
        },
        marketIntelligence: {
          marketOverview: { size: 0, growth: 0, volatility: 0, competition: 'low' },
          sectors: [],
          trends: [],
          opportunities: [],
          threats: [],
        },
        regulatoryIntelligence: {
          recentChanges: [],
          upcomingChanges: [],
          impactAssessments: [],
          complianceGaps: [],
          recommendations: [],
        },
        keyInsights: [],
        recommendations: [],
        alerts: [],
        visualizations: [],
        metadata: {
          generatedAt: new Date(),
          processingTime: 2000,
          dataQuality: { score: 0.75, issues: ['Cache unavailable'] },
          sources: [],
          version: '1.0',
          requestId: 'no-cache-req',
        },
      };

      mockAIGateway.processRequest.mockResolvedValue({
        result: JSON.stringify(expectedResult),
        confidence: 0.75,
      });

      const result = await legalIntelligence.analyzeLegalIntelligence(intelligenceRequest);

      expect(result).toBeDefined();
      expect(result.analysisId).toBe('no-cache-404');
      // Should still process despite cache failure
      expect(mockAIGateway.processRequest).toHaveBeenCalled();
    });
  });

  describe('Performance and Optimization', () => {
    it('should track and report performance metrics', async () => {
      const performanceRequest: LegalIntelligenceRequest = {
        analysisTypes: [IntelligenceType.TREND_ANALYSIS],
        jurisdictions: [LegalJurisdiction.NIGERIA],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: false,
          includePredictions: false,
          includeComparisons: false,
          includeTrends: true,
          includeAlerts: false,
          detailLevel: 'summary',
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal',
      };

      mockCache.get.mockReturnValue(null);
      mockAIGateway.processRequest.mockResolvedValue({
        result: JSON.stringify({ analysisId: 'perf-606' }),
        confidence: 0.88,
        processingTime: 1200,
      });

      await legalIntelligence.analyzeLegalIntelligence(performanceRequest);

      expect(mockUsageTracker.trackRequest).toHaveBeenCalledWith(performanceRequest);
      expect(mockUsageTracker.trackResponse).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('should set cache for successful analysis results', async () => {
      const cacheTestRequest: LegalIntelligenceRequest = {
        analysisTypes: [IntelligenceType.TREND_ANALYSIS],
        jurisdictions: [LegalJurisdiction.NIGERIA],
        legalAreas: [LegalArea.EMPLOYMENT],
        period: AnalyticsPeriod.LAST_6_MONTHS,
        filters: {},
        insights: {
          includeRecommendations: false,
          includePredictions: false,
          includeComparisons: false,
          includeTrends: true,
          includeAlerts: false,
          detailLevel: 'summary',
          visualizations: [],
        },
        language: SupportedLanguage.ENGLISH,
        confidentialityLevel: 'internal',
      };

      const resultToCache = {
        analysisId: 'cache-707',
        requestSummary: {
          analysisTypes: [IntelligenceType.TREND_ANALYSIS],
          coveragePeriod: AnalyticsPeriod.LAST_6_MONTHS,
          jurisdictionsAnalyzed: [LegalJurisdiction.NIGERIA],
          legalAreasAnalyzed: [LegalArea.EMPLOYMENT],
          dataPointsProcessed: 2000,
          executionTime: 1500,
          confidenceLevel: 0.91,
        },
        trendAnalysis: [],
        predictiveInsights: [],
        comparativeAnalysis: [],
        riskIntelligence: {
          overallRiskScore: 35,
          riskLevel: RiskLevel.LOW,
          riskFactors: [],
          riskTrends: [],
          mitigationStrategies: [],
          predictions: [],
        },
        marketIntelligence: {
          marketOverview: { size: 0, growth: 0, volatility: 0, competition: 'low' },
          sectors: [],
          trends: [],
          opportunities: [],
          threats: [],
        },
        regulatoryIntelligence: {
          recentChanges: [],
          upcomingChanges: [],
          impactAssessments: [],
          complianceGaps: [],
          recommendations: [],
        },
        keyInsights: [],
        recommendations: [],
        alerts: [],
        visualizations: [],
        metadata: {
          generatedAt: new Date(),
          processingTime: 1500,
          dataQuality: { score: 0.91, issues: [] },
          sources: [],
          version: '1.0',
          requestId: 'cache-req',
        },
      };

      mockCache.get.mockReturnValue(null);
      mockAIGateway.processRequest.mockResolvedValue({
        result: JSON.stringify(resultToCache),
        confidence: 0.91,
      });

      await legalIntelligence.analyzeLegalIntelligence(cacheTestRequest);

      expect(mockCache.set).toHaveBeenCalled();
    });
  });
});

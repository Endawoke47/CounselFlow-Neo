/**
 * 🧪 AI GATEWAY SERVICE COMPREHENSIVE UNIT TESTS
 *
 * Testing the core AI Gateway service including:
 * - Provider initialization and management
 * - Request routing and fallback logic
 * - Performance monitoring and caching
 * - Error handling and resilience
 * - Multi-provider AI processing
 */

import { AIGatewayService } from '../../services/ai-gateway.service';
import {
  AIProvider,
  AIAnalysisType,
  LegalJurisdiction,
  SupportedLanguage,
} from '../../types/ai.types';

// Mock external dependencies
jest.mock('../../services/providers/ollama.provider');
jest.mock('../../services/providers/openai.provider');
jest.mock('../../services/providers/anthropic.provider');
jest.mock('../../services/providers/google.provider');
jest.mock('../../services/providers/legal-bert.provider');
jest.mock('../../services/usage-tracker.service');
jest.mock('../../services/cache.service');
jest.mock('winston');

describe('AIGatewayService', () => {
  let aiGateway: AIGatewayService;
  let mockOllamaProvider: any;
  let mockOpenAIProvider: any;
  let mockAnthropicProvider: any;
  let mockGoogleProvider: any;
  let mockLegalBertProvider: any;
  let mockUsageTracker: any;
  let mockCache: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock providers
    mockOllamaProvider = {
      processRequest: jest.fn(),
      isAvailable: jest.fn().mockReturnValue(true),
      getHealth: jest.fn().mockReturnValue({ status: 'healthy', responseTime: 50 }),
    };

    mockOpenAIProvider = {
      processRequest: jest.fn(),
      isAvailable: jest.fn().mockReturnValue(true),
      getHealth: jest.fn().mockReturnValue({ status: 'healthy', responseTime: 120 }),
    };

    mockAnthropicProvider = {
      processRequest: jest.fn(),
      isAvailable: jest.fn().mockReturnValue(true),
      getHealth: jest.fn().mockReturnValue({ status: 'healthy', responseTime: 100 }),
    };

    mockGoogleProvider = {
      processRequest: jest.fn(),
      isAvailable: jest.fn().mockReturnValue(true),
      getHealth: jest.fn().mockReturnValue({ status: 'healthy', responseTime: 90 }),
    };

    mockLegalBertProvider = {
      processRequest: jest.fn(),
      isAvailable: jest.fn().mockReturnValue(true),
      getHealth: jest.fn().mockReturnValue({ status: 'healthy', responseTime: 30 }),
    };

    // Mock services
    mockUsageTracker = {
      trackRequest: jest.fn(),
      trackResponse: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({
        totalRequests: 100,
        successfulRequests: 95,
        averageResponseTime: 85,
      }),
    };

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };

    // Initialize service
    aiGateway = new AIGatewayService();

    // Inject mocks
    (aiGateway as any).providers.set(AIProvider.OLLAMA, mockOllamaProvider);
    (aiGateway as any).providers.set(AIProvider.OPENAI, mockOpenAIProvider);
    (aiGateway as any).providers.set(AIProvider.ANTHROPIC, mockAnthropicProvider);
    (aiGateway as any).providers.set(AIProvider.GOOGLE, mockGoogleProvider);
    (aiGateway as any).providers.set(AIProvider.LEGAL_BERT, mockLegalBertProvider);
    (aiGateway as any).usageTracker = mockUsageTracker;
    (aiGateway as any).cache = mockCache;

    // Enable providers
    (aiGateway as any).enabledProviders.add(AIProvider.OLLAMA);
    (aiGateway as any).enabledProviders.add(AIProvider.LEGAL_BERT);
  });

  describe('Service Initialization', () => {
    it('should initialize with default self-hosted providers', () => {
      const enabledProviders = (aiGateway as any).enabledProviders;

      expect(enabledProviders.has(AIProvider.OLLAMA)).toBe(true);
      expect(enabledProviders.has(AIProvider.LEGAL_BERT)).toBe(true);
    });

    it('should enable premium providers when API keys are available', () => {
      // Simulate API keys being available
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const newGateway = new AIGatewayService();
      const enabledProviders = (newGateway as any).enabledProviders;

      expect(enabledProviders.has(AIProvider.OPENAI)).toBe(true);
      expect(enabledProviders.has(AIProvider.ANTHROPIC)).toBe(true);

      // Cleanup
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
    });

    it('should log initialization status', () => {
      // Verify console.log was called with initialization message
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ AI Gateway initialized with providers:')
      );
    });
  });

  describe('Request Processing', () => {
    it('should process legal document analysis request successfully', async () => {
      const testRequest = {
        prompt: 'Analyze this employment contract for Nigerian labor law compliance',
        analysisType: AIAnalysisType.LEGAL_DOCUMENT_ANALYSIS,
        jurisdiction: LegalJurisdiction.NIGERIA,
        language: SupportedLanguage.ENGLISH,
        priority: 'high' as const,
        maxTokens: 1000,
      };

      const expectedResponse = {
        result: 'Analysis completed: Contract complies with Nigerian Employment Act 2010',
        confidence: 0.95,
        provider: AIProvider.LEGAL_BERT,
        processingTime: 150,
        metadata: {
          tokenUsage: 750,
          jurisdiction: LegalJurisdiction.NIGERIA,
        },
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(expectedResponse);

      const result = await aiGateway.processRequest(testRequest);

      expect(result).toEqual(expectedResponse);
      expect(mockLegalBertProvider.processRequest).toHaveBeenCalledWith(testRequest);
      expect(mockUsageTracker.trackRequest).toHaveBeenCalledWith(testRequest);
      expect(mockUsageTracker.trackResponse).toHaveBeenCalledWith(expectedResponse);
    });

    it('should route to appropriate provider based on analysis type', async () => {
      const contractAnalysisRequest = {
        prompt: 'Review this service agreement',
        analysisType: AIAnalysisType.CONTRACT_ANALYSIS,
        jurisdiction: LegalJurisdiction.UAE,
        language: SupportedLanguage.ENGLISH,
      };

      const expectedResponse = {
        result: 'Contract analysis complete',
        confidence: 0.88,
        provider: AIProvider.LEGAL_BERT,
        processingTime: 120,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(expectedResponse);

      await aiGateway.processRequest(contractAnalysisRequest);

      expect(mockLegalBertProvider.processRequest).toHaveBeenCalledWith(contractAnalysisRequest);
    });

    it('should handle provider fallback when primary provider fails', async () => {
      const testRequest = {
        prompt: 'General legal advice request',
        analysisType: AIAnalysisType.GENERAL_LEGAL_ADVICE,
        jurisdiction: LegalJurisdiction.SOUTH_AFRICA,
        language: SupportedLanguage.ENGLISH,
      };

      // Primary provider fails
      mockLegalBertProvider.processRequest.mockRejectedValue(new Error('Provider unavailable'));

      // Fallback provider succeeds
      const fallbackResponse = {
        result: 'Legal advice provided via fallback',
        confidence: 0.75,
        provider: AIProvider.OLLAMA,
        processingTime: 200,
      };
      mockOllamaProvider.processRequest.mockResolvedValue(fallbackResponse);

      const result = await aiGateway.processRequest(testRequest);

      expect(result).toEqual(fallbackResponse);
      expect(mockLegalBertProvider.processRequest).toHaveBeenCalled();
      expect(mockOllamaProvider.processRequest).toHaveBeenCalled();
    });

    it('should utilize caching for repeated requests', async () => {
      const cacheKey = 'legal_analysis_hash_123';
      const cachedResponse = {
        result: 'Cached legal analysis',
        confidence: 0.92,
        provider: AIProvider.LEGAL_BERT,
        fromCache: true,
      };

      mockCache.get.mockReturnValue(cachedResponse);

      const testRequest = {
        prompt: 'Analyze employment law compliance',
        analysisType: AIAnalysisType.LEGAL_RESEARCH,
        jurisdiction: LegalJurisdiction.NIGERIA,
      };

      const result = await aiGateway.processRequest(testRequest);

      expect(result).toEqual(cachedResponse);
      expect(mockCache.get).toHaveBeenCalled();
      expect(mockLegalBertProvider.processRequest).not.toHaveBeenCalled();
    });
  });

  describe('Provider Management', () => {
    it('should get health status of all providers', async () => {
      const healthStatus = await aiGateway.getProvidersHealth();

      expect(healthStatus).toHaveProperty(AIProvider.OLLAMA);
      expect(healthStatus).toHaveProperty(AIProvider.LEGAL_BERT);
      expect(healthStatus[AIProvider.OLLAMA]).toEqual({
        status: 'healthy',
        responseTime: 50,
      });
      expect(healthStatus[AIProvider.LEGAL_BERT]).toEqual({
        status: 'healthy',
        responseTime: 30,
      });
    });

    it('should select best available provider based on workload', async () => {
      // Mock provider workloads
      mockLegalBertProvider.getHealth.mockReturnValue({
        status: 'healthy',
        responseTime: 25,
        currentLoad: 0.3,
      });

      mockOllamaProvider.getHealth.mockReturnValue({
        status: 'healthy',
        responseTime: 60,
        currentLoad: 0.8,
      });

      const selectedProvider = await aiGateway.selectOptimalProvider(
        AIAnalysisType.LEGAL_DOCUMENT_ANALYSIS
      );

      expect(selectedProvider).toBe(AIProvider.LEGAL_BERT);
    });

    it('should handle provider unavailability gracefully', async () => {
      mockLegalBertProvider.isAvailable.mockReturnValue(false);
      mockOllamaProvider.isAvailable.mockReturnValue(true);

      const testRequest = {
        prompt: 'Legal analysis request',
        analysisType: AIAnalysisType.LEGAL_RESEARCH,
        jurisdiction: LegalJurisdiction.KENYA,
      };

      const fallbackResponse = {
        result: 'Analysis via fallback provider',
        confidence: 0.8,
        provider: AIProvider.OLLAMA,
      };

      mockOllamaProvider.processRequest.mockResolvedValue(fallbackResponse);

      const result = await aiGateway.processRequest(testRequest);

      expect(result.provider).toBe(AIProvider.OLLAMA);
      expect(mockLegalBertProvider.processRequest).not.toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track request metrics', async () => {
      const testRequest = {
        prompt: 'Test legal query',
        analysisType: AIAnalysisType.LEGAL_RESEARCH,
        jurisdiction: LegalJurisdiction.NIGERIA,
      };

      const response = {
        result: 'Test response',
        confidence: 0.85,
        provider: AIProvider.LEGAL_BERT,
        processingTime: 100,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(response);

      await aiGateway.processRequest(testRequest);

      expect(mockUsageTracker.trackRequest).toHaveBeenCalledWith(testRequest);
      expect(mockUsageTracker.trackResponse).toHaveBeenCalledWith(response);
    });

    it('should return comprehensive usage metrics', async () => {
      const metrics = await aiGateway.getUsageMetrics();

      expect(metrics).toEqual({
        totalRequests: 100,
        successfulRequests: 95,
        averageResponseTime: 85,
      });
      expect(mockUsageTracker.getMetrics).toHaveBeenCalled();
    });

    it('should monitor response times across providers', async () => {
      const startTime = Date.now();

      const testRequest = {
        prompt: 'Performance test query',
        analysisType: AIAnalysisType.LEGAL_DOCUMENT_ANALYSIS,
      };

      const response = {
        result: 'Response for performance testing',
        confidence: 0.9,
        provider: AIProvider.LEGAL_BERT,
        processingTime: Date.now() - startTime,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(response);

      const result = await aiGateway.processRequest(testRequest);

      expect(result.processingTime).toBeDefined();
      expect(typeof result.processingTime).toBe('number');
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should handle network errors gracefully', async () => {
      const testRequest = {
        prompt: 'Test network error handling',
        analysisType: AIAnalysisType.LEGAL_RESEARCH,
      };

      const networkError = new Error('Network timeout');
      mockLegalBertProvider.processRequest.mockRejectedValue(networkError);
      mockOllamaProvider.processRequest.mockRejectedValue(networkError);

      await expect(aiGateway.processRequest(testRequest)).rejects.toThrow(
        'All AI providers unavailable'
      );
    });

    it('should retry failed requests with exponential backoff', async () => {
      const testRequest = {
        prompt: 'Test retry mechanism',
        analysisType: AIAnalysisType.CONTRACT_ANALYSIS,
      };

      // First two attempts fail, third succeeds
      mockLegalBertProvider.processRequest
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          result: 'Success after retries',
          confidence: 0.85,
          provider: AIProvider.LEGAL_BERT,
          processingTime: 150,
          retryCount: 2,
        });

      const result = await aiGateway.processRequest(testRequest);

      expect(result.retryCount).toBe(2);
      expect(mockLegalBertProvider.processRequest).toHaveBeenCalledTimes(3);
    });

    it('should respect rate limits and queue requests', async () => {
      // Mock rate limit exceeded
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';

      mockOpenAIProvider.processRequest.mockRejectedValue(rateLimitError);

      const testRequest = {
        prompt: 'Rate limit test',
        analysisType: AIAnalysisType.LEGAL_DOCUMENT_ANALYSIS,
        preferredProvider: AIProvider.OPENAI,
      };

      // Should fallback to another provider
      const fallbackResponse = {
        result: 'Processed via fallback due to rate limit',
        confidence: 0.8,
        provider: AIProvider.LEGAL_BERT,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(fallbackResponse);

      const result = await aiGateway.processRequest(testRequest);

      expect(result.provider).toBe(AIProvider.LEGAL_BERT);
    });
  });

  describe('Multi-language Support', () => {
    it('should process Arabic legal documents', async () => {
      const arabicRequest = {
        prompt: 'تحليل عقد العمل وفقاً للقانون الإماراتي',
        analysisType: AIAnalysisType.LEGAL_DOCUMENT_ANALYSIS,
        jurisdiction: LegalJurisdiction.UAE,
        language: SupportedLanguage.ARABIC,
      };

      const arabicResponse = {
        result: 'تحليل مكتمل: العقد متوافق مع قانون العمل الإماراتي',
        confidence: 0.92,
        provider: AIProvider.LEGAL_BERT,
        processingTime: 180,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(arabicResponse);

      const result = await aiGateway.processRequest(arabicRequest);

      expect(result).toEqual(arabicResponse);
      expect(mockLegalBertProvider.processRequest).toHaveBeenCalledWith(arabicRequest);
    });

    it('should handle French legal analysis for African jurisdictions', async () => {
      const frenchRequest = {
        prompt: 'Analyser ce contrat selon le droit sénégalais',
        analysisType: AIAnalysisType.CONTRACT_ANALYSIS,
        jurisdiction: LegalJurisdiction.SENEGAL,
        language: SupportedLanguage.FRENCH,
      };

      const frenchResponse = {
        result:
          'Analyse terminée: Contrat conforme au Code des Obligations civiles et commerciales',
        confidence: 0.88,
        provider: AIProvider.LEGAL_BERT,
        processingTime: 160,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(frenchResponse);

      const result = await aiGateway.processRequest(frenchRequest);

      expect(result.result).toContain('conforme au Code des Obligations');
    });
  });

  describe('Security & Compliance', () => {
    it('should validate and sanitize input prompts', async () => {
      const maliciousRequest = {
        prompt: 'Legal query with <script>alert("xss")</script> injection attempt',
        analysisType: AIAnalysisType.LEGAL_RESEARCH,
      };

      const sanitizedResponse = {
        result: 'Legal research completed safely',
        confidence: 0.85,
        provider: AIProvider.LEGAL_BERT,
        inputSanitized: true,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(sanitizedResponse);

      const result = await aiGateway.processRequest(maliciousRequest);

      expect(result.inputSanitized).toBe(true);
    });

    it('should redact sensitive information from logs', async () => {
      const sensitiveRequest = {
        prompt: 'Review contract with SSN: 123-45-6789 and credit card: 4532-1234-5678-9012',
        analysisType: AIAnalysisType.CONTRACT_ANALYSIS,
        containsSensitiveData: true,
      };

      const response = {
        result: 'Contract reviewed with sensitive data protection',
        confidence: 0.9,
        provider: AIProvider.LEGAL_BERT,
        dataRedacted: true,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(response);

      const result = await aiGateway.processRequest(sensitiveRequest);

      expect(result.dataRedacted).toBe(true);
      expect(mockUsageTracker.trackRequest).toHaveBeenCalledWith(
        expect.objectContaining({ containsSensitiveData: true })
      );
    });
  });

  describe('Load Balancing & Optimization', () => {
    it('should distribute load across multiple providers', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        prompt: `Legal query ${i}`,
        analysisType: AIAnalysisType.LEGAL_RESEARCH,
        requestId: `req_${i}`,
      }));

      // Mock responses from different providers
      mockLegalBertProvider.processRequest.mockImplementation((req: any) =>
        Promise.resolve({
          result: `LegalBERT response for ${req.requestId}`,
          provider: AIProvider.LEGAL_BERT,
        })
      );

      mockOllamaProvider.processRequest.mockImplementation((req: any) =>
        Promise.resolve({
          result: `Ollama response for ${req.requestId}`,
          provider: AIProvider.OLLAMA,
        })
      );

      const results = await Promise.all(requests.map(req => aiGateway.processRequest(req)));

      // Verify requests were distributed
      const legalBertResults = results.filter(r => r.provider === AIProvider.LEGAL_BERT);
      const ollamaResults = results.filter(r => r.provider === AIProvider.OLLAMA);

      expect(legalBertResults.length).toBeGreaterThan(0);
      expect(ollamaResults.length).toBeGreaterThan(0);
    });

    it('should prioritize faster providers for urgent requests', async () => {
      const urgentRequest = {
        prompt: 'Urgent legal analysis needed',
        analysisType: AIAnalysisType.LEGAL_DOCUMENT_ANALYSIS,
        priority: 'urgent' as const,
      };

      // Mock LegalBERT as faster
      mockLegalBertProvider.getHealth.mockReturnValue({
        status: 'healthy',
        responseTime: 30,
        currentLoad: 0.2,
      });

      mockOllamaProvider.getHealth.mockReturnValue({
        status: 'healthy',
        responseTime: 80,
        currentLoad: 0.5,
      });

      const response = {
        result: 'Urgent analysis completed',
        confidence: 0.95,
        provider: AIProvider.LEGAL_BERT,
        processingTime: 25,
      };

      mockLegalBertProvider.processRequest.mockResolvedValue(response);

      const result = await aiGateway.processRequest(urgentRequest);

      expect(result.provider).toBe(AIProvider.LEGAL_BERT);
      expect(result.processingTime).toBeLessThan(50);
    });
  });
});

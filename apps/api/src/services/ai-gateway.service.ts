// AI Gateway Service - Core Implementation
// Self-hosted primary with hybrid premium API fallback

import {
  AIProvider,
  AIResponse,
  ProviderConfig,
  aiRequestSchema,
  ValidatedAIRequest,
  LegalJurisdiction,
  SupportedLanguage,
  AIAnalysisType,
} from '../types/ai.types';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GoogleProvider } from './providers/google.provider';
import { LegalBertProvider } from './providers/legal-bert.provider';
import { UsageTracker } from './usage-tracker.service';
import { CacheService } from './cache.service';
import winston from 'winston';

export class AIGatewayService {
  private providers: Map<AIProvider, any> = new Map();
  private configs: Map<AIProvider, ProviderConfig> = new Map();
  private enabledProviders: Set<AIProvider> = new Set();
  private usageTracker: UsageTracker;
  private cache: CacheService;
  private logger!: winston.Logger;

  constructor() {
    this.initializeLogger();
    this.usageTracker = new UsageTracker();
    this.cache = new CacheService();
    this.initializeProviders();
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
        new winston.transports.File({ filename: 'logs/ai-gateway.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  private initializeProviders() {
    try {
      // Default configurations for each provider
      const defaultConfig = { enabled: true, priority: 1 };

      // Primary: Self-hosted providers (free, private)
      this.providers.set(
        AIProvider.OLLAMA,
        new OllamaProvider({
          ...defaultConfig,
          baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        })
      );
      this.providers.set(
        AIProvider.LEGAL_BERT,
        new LegalBertProvider({
          ...defaultConfig,
          modelPath: process.env.LEGAL_BERT_MODEL_PATH || './models/legal-bert',
        })
      );

      // Hybrid: Premium APIs (when API keys provided)
      this.providers.set(
        AIProvider.OPENAI,
        new OpenAIProvider({
          ...defaultConfig,
          apiKey: process.env.OPENAI_API_KEY,
        })
      );
      this.providers.set(
        AIProvider.ANTHROPIC,
        new AnthropicProvider({
          ...defaultConfig,
          apiKey: process.env.ANTHROPIC_API_KEY,
        })
      );
      this.providers.set(
        AIProvider.GOOGLE,
        new GoogleProvider({
          ...defaultConfig,
          apiKey: process.env.GOOGLE_API_KEY,
        })
      );

      // Enable self-hosted providers by default
      this.enabledProviders.add(AIProvider.OLLAMA);
      this.enabledProviders.add(AIProvider.LEGAL_BERT);

      // Enable premium providers if API keys are available
      if (process.env.OPENAI_API_KEY) {
        this.enabledProviders.add(AIProvider.OPENAI);
      }
      if (process.env.ANTHROPIC_API_KEY) {
        this.enabledProviders.add(AIProvider.ANTHROPIC);
      }
      if (process.env.GOOGLE_API_KEY) {
        this.enabledProviders.add(AIProvider.GOOGLE);
      }

      console.log('✅ AI Gateway initialized with providers:', Array.from(this.enabledProviders));
    } catch (error) {
      console.error('❌ Failed to initialize AI providers:', error);
      throw error;
    }
  }

  // Main request processing method
  async processRequest(request: ValidatedAIRequest, userId: string): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Validate request
      const validatedRequest = aiRequestSchema.parse(request);

      // Check cache first
      const cacheKey = this.generateCacheKey(validatedRequest);
      const cachedResult = await this.cache.get(cacheKey);

      if (cachedResult) {
        console.log('📋 Cache hit for request');
        return {
          ...cachedResult,
          cached: true,
          processingTime: Date.now() - startTime,
        };
      }

      // Select optimal provider
      const selectedProvider = this.selectProvider(validatedRequest);

      // Execute request
      const result = await this.executeRequest(selectedProvider, validatedRequest, userId);

      // Cache successful results
      if (result.output) {
        await this.cache.set(cacheKey, result, 3600); // 1 hour cache
      }

      // Track usage
      await this.usageTracker.trackUsage({
        id: 'temp-id',
        requestId: result.requestId,
        userId,
        provider: selectedProvider,
        model: result.model,
        analysisType: validatedRequest.type,
        tokensUsed: result.tokensUsed || 0,
        cost: result.cost || 0,
        success: !!result.output,
        processingTime: Date.now() - startTime,
        timestamp: new Date(),
      });

      return {
        ...result,
        cached: false,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('AI request processing failed', { error, userId, request });
      throw error;
    }
  }

  private selectProvider(request: ValidatedAIRequest): AIProvider {
    const { type } = request;

    // Legal-specific analysis - use Legal BERT first
    if (this.isLegalAnalysis(type) && this.enabledProviders.has(AIProvider.LEGAL_BERT)) {
      return AIProvider.LEGAL_BERT;
    }

    // Critical analysis - use premium providers
    if (this.isCriticalAnalysis(type)) {
      if (this.enabledProviders.has(AIProvider.OPENAI)) {
        return AIProvider.OPENAI;
      }
      if (this.enabledProviders.has(AIProvider.ANTHROPIC)) {
        return AIProvider.ANTHROPIC;
      }
    }

    // Complex research - use Google Gemini
    if (type === AIAnalysisType.LEGAL_RESEARCH && this.enabledProviders.has(AIProvider.GOOGLE)) {
      return AIProvider.GOOGLE;
    }

    // Default to Ollama for general tasks
    if (this.enabledProviders.has(AIProvider.OLLAMA)) {
      return AIProvider.OLLAMA;
    }

    // Fallback to any available provider
    const availableProviders = Array.from(this.enabledProviders);
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    return availableProviders[0];
  }

  private isLegalAnalysis(type: AIAnalysisType): boolean {
    return [
      AIAnalysisType.CONTRACT_ANALYSIS,
      AIAnalysisType.COMPLIANCE_CHECK,
      AIAnalysisType.CLAUSE_EXTRACTION,
      AIAnalysisType.LEGAL_RESEARCH,
      AIAnalysisType.PRECEDENT_MATCHING,
    ].includes(type);
  }

  private isCriticalAnalysis(type: AIAnalysisType): boolean {
    return [
      AIAnalysisType.RISK_ASSESSMENT,
      AIAnalysisType.CASE_PREDICTION,
      AIAnalysisType.COMPLIANCE_CHECK,
    ].includes(type);
  }

  private async executeRequest(
    provider: AIProvider,
    request: ValidatedAIRequest,
    userId: string
  ): Promise<AIResponse> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not available`);
    }

    try {
      console.log(`🤖 Processing with ${provider}`);
      const result = await providerInstance.processRequest(request);

      return {
        ...result,
        provider,
        model: providerInstance.getModel?.() || 'unknown',
        success: true,
      };
    } catch (error) {
      console.error(`❌ Provider ${provider} failed:`, error);

      // Try fallback provider
      const fallbackProvider = this.getFallbackProvider(provider);
      if (fallbackProvider) {
        console.log(`🔄 Trying fallback provider: ${fallbackProvider}`);
        return this.executeRequest(fallbackProvider, request, userId);
      }

      throw error;
    }
  }

  private getFallbackProvider(failedProvider: AIProvider): AIProvider | null {
    const fallbackMap: Record<AIProvider, AIProvider[]> = {
      [AIProvider.LEGAL_BERT]: [AIProvider.OLLAMA, AIProvider.OPENAI],
      [AIProvider.OLLAMA]: [AIProvider.OPENAI, AIProvider.ANTHROPIC],
      [AIProvider.OPENAI]: [AIProvider.ANTHROPIC, AIProvider.GOOGLE],
      [AIProvider.ANTHROPIC]: [AIProvider.OPENAI, AIProvider.GOOGLE],
      [AIProvider.GOOGLE]: [AIProvider.OPENAI, AIProvider.OLLAMA],
      [AIProvider.HUGGINGFACE]: [AIProvider.LEGAL_BERT, AIProvider.OLLAMA],
    };

    const fallbacks = fallbackMap[failedProvider] || [];
    return fallbacks.find(p => this.enabledProviders.has(p)) || null;
  }

  // Provider management methods
  async getProviderStatus(provider?: AIProvider): Promise<any> {
    if (provider) {
      // Single provider status
      const startTime = Date.now();
      try {
        const providerInstance = this.providers.get(provider);
        if (!providerInstance) {
          return { available: false };
        }

        const available = await providerInstance.isHealthy();
        const latency = Date.now() - startTime;

        return { available, latency };
      } catch (error) {
        return { available: false, latency: Date.now() - startTime };
      }
    } else {
      // All providers status
      const status: Record<string, any> = {};

      for (const [providerType, providerInstance] of this.providers.entries()) {
        try {
          status[providerType] = {
            enabled: this.enabledProviders.has(providerType),
            healthy: await providerInstance.isHealthy(),
            name: providerInstance.constructor.name,
          };
        } catch (error) {
          status[providerType] = {
            enabled: this.enabledProviders.has(providerType),
            healthy: false,
            name: providerInstance.constructor.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }

      return status;
    }
  }

  async enableProvider(provider: AIProvider, apiKey?: string): Promise<void> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }

    if (apiKey) {
      // Store API key configuration
      const config: ProviderConfig = this.configs.get(provider) || {
        provider,
        enabled: true,
        priority: 1,
        models: [],
        rateLimit: {
          requestsPerMinute: 60,
          tokensPerMinute: 10000,
        },
        costs: {
          inputTokenCost: 0.001,
          outputTokenCost: 0.002,
        },
      };
      config.apiKey = apiKey;
      this.configs.set(provider, config);
    }

    this.enabledProviders.add(provider);
    console.log(`✅ Provider ${provider} enabled`);
  }

  async disableProvider(provider: AIProvider): Promise<void> {
    this.enabledProviders.delete(provider);
    console.log(`❌ Provider ${provider} disabled`);
  }

  async checkProviderHealth(providerType: AIProvider): Promise<boolean> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`Provider ${providerType} not found`);
    }

    try {
      return await provider.isHealthy();
    } catch (error) {
      return false;
    }
  }

  async healthCheck(): Promise<Record<string, any>> {
    const health: Record<string, any> = {};

    for (const [providerType, provider] of this.providers.entries()) {
      try {
        health[providerType] = await provider.isHealthy();
      } catch (error) {
        health[providerType] = false;
      }
    }

    return health;
  }

  // Legal jurisdiction support check
  isJurisdictionSupported(jurisdiction: LegalJurisdiction): boolean {
    // All African and Middle Eastern countries are supported
    return Object.values(LegalJurisdiction).includes(jurisdiction);
  }

  // Language support check
  isLanguageSupported(language: SupportedLanguage): boolean {
    return Object.values(SupportedLanguage).includes(language);
  }

  // Generate cache key for requests
  private generateCacheKey(request: ValidatedAIRequest): string {
    const key = JSON.stringify({
      type: request.type,
      input: request.input,
      context: request.context,
    });
    return Buffer.from(key).toString('base64');
  }
}

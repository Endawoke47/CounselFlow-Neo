import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  apiKey?: string;
  credentials?: Record<string, any>;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
  retryConfig?: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  webhook?: {
    url: string;
    secret: string;
    events: string[];
  };
  mapping?: {
    fields: Record<string, string>;
    transforms: Record<string, any>;
  };
  enabled: boolean;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  metadata?: Record<string, any>;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: Record<string, any>;
  responses: Record<string, any>;
  authentication: 'none' | 'bearer' | 'api-key' | 'oauth';
  rateLimit: {
    requests: number;
    window: number;
  };
  enabled: boolean;
  version: string;
  deprecated?: boolean;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  id: string;
  event: string;
  payload: any;
  source: string;
  timestamp: Date;
  signature?: string;
  processed: boolean;
  retryCount: number;
  lastRetry?: Date;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  errors: string[];
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);
  private integrations = new Map<string, IntegrationConfig>();
  private apiClients = new Map<string, AxiosInstance>();
  private rateLimiters = new Map<string, { requests: number; resetTime: number }>();

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    this.initializeDefaultIntegrations();
  }

  // Integration Management
  async registerIntegration(config: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    try {
      const integration: IntegrationConfig = {
        id: config.id || crypto.randomUUID(),
        name: config.name || 'Unknown Integration',
        type: config.type || 'custom',
        endpoint: config.endpoint || '',
        apiKey: config.apiKey,
        credentials: config.credentials || {},
        headers: config.headers || {},
        rateLimit: config.rateLimit || { requests: 100, window: 60000 },
        retryConfig: config.retryConfig || {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
        },
        webhook: config.webhook,
        mapping: config.mapping || { fields: {}, transforms: {} },
        enabled: config.enabled !== false,
        status: config.status || 'active',
        metadata: config.metadata || {},
      };

      this.integrations.set(integration.id, integration);
      this.createApiClient(integration);

      this.logger.log(`Integration registered: ${integration.name} (${integration.id})`);
      this.eventEmitter.emit('integration.registered', integration);

      return integration;
    } catch (error) {
      this.logger.error(`Failed to register integration: ${error.message}`);
      throw error;
    }
  }

  async updateIntegration(
    id: string,
    updates: Partial<IntegrationConfig>
  ): Promise<IntegrationConfig> {
    try {
      const integration = this.integrations.get(id);
      if (!integration) {
        throw new Error(`Integration not found: ${id}`);
      }

      const updated = { ...integration, ...updates };
      this.integrations.set(id, updated);
      this.createApiClient(updated);

      this.logger.log(`Integration updated: ${updated.name} (${id})`);
      this.eventEmitter.emit('integration.updated', updated);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update integration: ${error.message}`);
      throw error;
    }
  }

  async deleteIntegration(id: string): Promise<void> {
    try {
      const integration = this.integrations.get(id);
      if (!integration) {
        throw new Error(`Integration not found: ${id}`);
      }

      this.integrations.delete(id);
      this.apiClients.delete(id);
      this.rateLimiters.delete(id);

      this.logger.log(`Integration deleted: ${integration.name} (${id})`);
      this.eventEmitter.emit('integration.deleted', { id, integration });
    } catch (error) {
      this.logger.error(`Failed to delete integration: ${error.message}`);
      throw error;
    }
  }

  getIntegration(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id);
  }

  getAllIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  getIntegrationsByType(type: string): IntegrationConfig[] {
    return Array.from(this.integrations.values()).filter(i => i.type === type);
  }

  // API Client Management
  private createApiClient(integration: IntegrationConfig): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: integration.endpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CounselFlow-Integration/1.0',
        ...integration.headers,
      },
    };

    if (integration.apiKey) {
      config.headers['Authorization'] = `Bearer ${integration.apiKey}`;
    }

    const client = axios.create(config);

    // Request interceptor for rate limiting
    client.interceptors.request.use(async config => {
      await this.checkRateLimit(integration.id, integration.rateLimit);
      return config;
    });

    // Response interceptor for error handling
    client.interceptors.response.use(
      response => response,
      async error => {
        const retryConfig = integration.retryConfig;
        if (retryConfig && error.config && !error.config._retry) {
          error.config._retry = true;
          error.config._retryCount = (error.config._retryCount || 0) + 1;

          if (error.config._retryCount <= retryConfig.maxRetries) {
            const delay =
              retryConfig.initialDelay *
              Math.pow(retryConfig.backoffMultiplier, error.config._retryCount - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            return client(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    this.apiClients.set(integration.id, client);
    return client;
  }

  getApiClient(integrationId: string): AxiosInstance | undefined {
    return this.apiClients.get(integrationId);
  }

  // Rate Limiting
  private async checkRateLimit(
    integrationId: string,
    rateLimit?: { requests: number; window: number }
  ): Promise<void> {
    if (!rateLimit) return;

    const now = Date.now();
    const limiter = this.rateLimiters.get(integrationId);

    if (!limiter || now > limiter.resetTime) {
      this.rateLimiters.set(integrationId, {
        requests: 1,
        resetTime: now + rateLimit.window,
      });
      return;
    }

    if (limiter.requests >= rateLimit.requests) {
      const waitTime = limiter.resetTime - now;
      throw new Error(`Rate limit exceeded. Try again in ${waitTime}ms`);
    }

    limiter.requests++;
  }

  // Data Synchronization
  async syncData(
    integrationId: string,
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST';
      payload?: any;
      mapping?: Record<string, string>;
      batchSize?: number;
    }
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      const client = this.getApiClient(integrationId);
      if (!client) {
        throw new Error(`API client not found for integration: ${integrationId}`);
      }

      const method = options?.method || 'GET';
      const response = await client({
        method,
        url: endpoint,
        data: options?.payload,
      });

      const data = Array.isArray(response.data) ? response.data : [response.data];
      result.recordsProcessed = data.length;

      for (const record of data) {
        try {
          const mappedData = this.mapData(record, integration.mapping?.fields || {});
          const transformedData = this.transformData(
            mappedData,
            integration.mapping?.transforms || {}
          );

          // Emit event for each record to be processed by other services
          this.eventEmitter.emit('integration.data.received', {
            integrationId,
            data: transformedData,
            original: record,
          });

          result.recordsCreated++;
        } catch (error) {
          result.errors.push(`Failed to process record: ${error.message}`);
        }
      }

      integration.lastSync = new Date();
      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      this.logger.log(
        `Data sync completed for ${integration.name}: ${result.recordsProcessed} records processed`
      );
      this.eventEmitter.emit('integration.sync.completed', { integrationId, result });

      return result;
    } catch (error) {
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      this.logger.error(`Data sync failed for integration ${integrationId}: ${error.message}`);
      this.eventEmitter.emit('integration.sync.failed', { integrationId, error: error.message });
      return result;
    }
  }

  // Data Mapping and Transformation
  private mapData(data: any, fieldMapping: Record<string, string>): any {
    const mapped: any = {};

    for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
      const value = this.getNestedValue(data, sourceField);
      if (value !== undefined) {
        this.setNestedValue(mapped, targetField, value);
      }
    }

    return { ...data, ...mapped };
  }

  private transformData(data: any, transforms: Record<string, any>): any {
    const transformed = { ...data };

    for (const [field, transform] of Object.entries(transforms)) {
      try {
        const value = this.getNestedValue(transformed, field);
        if (value !== undefined) {
          const transformedValue = this.applyTransform(value, transform);
          this.setNestedValue(transformed, field, transformedValue);
        }
      } catch (error) {
        this.logger.warn(`Failed to transform field ${field}: ${error.message}`);
      }
    }

    return transformed;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    if (lastKey) target[lastKey] = value;
  }

  private applyTransform(value: any, transform: any): any {
    if (typeof transform === 'function') {
      return transform(value);
    }

    if (typeof transform === 'object') {
      const { type, options } = transform;

      switch (type) {
        case 'date':
          return new Date(value);
        case 'string':
          return String(value);
        case 'number':
          return Number(value);
        case 'boolean':
          return Boolean(value);
        case 'uppercase':
          return String(value).toUpperCase();
        case 'lowercase':
          return String(value).toLowerCase();
        case 'trim':
          return String(value).trim();
        case 'replace':
          return String(value).replace(
            new RegExp(options.pattern, options.flags),
            options.replacement
          );
        default:
          return value;
      }
    }

    return value;
  }

  // Webhook Management
  async processWebhook(
    integrationId: string,
    event: string,
    payload: any,
    signature?: string
  ): Promise<void> {
    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      if (integration.webhook?.secret && signature) {
        const expectedSignature = crypto
          .createHmac('sha256', integration.webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');

        if (signature !== expectedSignature) {
          throw new Error('Invalid webhook signature');
        }
      }

      const webhookEvent: WebhookEvent = {
        id: crypto.randomUUID(),
        event,
        payload,
        source: integrationId,
        timestamp: new Date(),
        signature,
        processed: false,
        retryCount: 0,
      };

      this.eventEmitter.emit('webhook.received', webhookEvent);
      this.logger.log(`Webhook processed for ${integration.name}: ${event}`);
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error.message}`);
      throw error;
    }
  }

  // Health Monitoring
  async checkIntegrationHealth(integrationId: string): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    lastCheck: Date;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const integration = this.integrations.get(integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${integrationId}`);
      }

      const client = this.getApiClient(integrationId);
      if (!client) {
        throw new Error(`API client not found for integration: ${integrationId}`);
      }

      await client.get('/health', { timeout: 5000 });

      const latency = Date.now() - startTime;
      return {
        status: latency < 1000 ? 'healthy' : 'degraded',
        latency,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime,
        lastCheck: new Date(),
        error: error.message,
      };
    }
  }

  async getIntegrationMetrics(integrationId: string): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    lastSync?: Date;
    rateLimitHits: number;
  }> {
    // This would typically fetch from a metrics store
    // For now, return mock data
    return {
      totalRequests: 1500,
      successfulRequests: 1425,
      failedRequests: 75,
      averageLatency: 250,
      lastSync: new Date(),
      rateLimitHits: 12,
    };
  }

  // Default Integrations
  private initializeDefaultIntegrations(): void {
    // Initialize common legal software integrations
    this.registerIntegration({
      id: 'clio',
      name: 'Clio Practice Management',
      type: 'legal-software',
      endpoint: 'https://app.clio.com/api/v4',
      rateLimit: { requests: 10, window: 1000 },
      mapping: {
        fields: {
          'client.name': 'clientName',
          'matter.description': 'caseDescription',
          time_entries: 'timeEntries',
        },
        transforms: {
          created_at: { type: 'date' },
          'client.name': { type: 'trim' },
        },
      },
    });

    this.registerIntegration({
      id: 'lexisnexis',
      name: 'LexisNexis',
      type: 'legal-research',
      endpoint: 'https://api.lexisnexis.com/v1',
      rateLimit: { requests: 5, window: 1000 },
    });

    this.registerIntegration({
      id: 'docusign',
      name: 'DocuSign',
      type: 'document-management',
      endpoint: 'https://demo.docusign.net/restapi/v2.1',
      rateLimit: { requests: 100, window: 60000 },
    });

    this.registerIntegration({
      id: 'quickbooks',
      name: 'QuickBooks Online',
      type: 'accounting',
      endpoint: 'https://sandbox-quickbooks.api.intuit.com/v3',
      rateLimit: { requests: 500, window: 60000 },
    });
  }
}

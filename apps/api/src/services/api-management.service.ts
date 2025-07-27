import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number;
  };
  allowedIPs?: string[];
  expiresAt?: Date;
  lastUsed?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface ApiUsage {
  keyId: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  ipAddress: string;
  userAgent?: string;
  requestSize?: number;
  responseSize?: number;
  error?: string;
}

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerSecond: number;
  topEndpoints: { endpoint: string; count: number }[];
  errorRates: { statusCode: number; count: number }[];
  apiKeyUsage: { keyId: string; requests: number }[];
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any, res: any) => void;
}

@Injectable()
export class ApiManagementService {
  private readonly logger = new Logger(ApiManagementService.name);
  private apiKeys = new Map<string, ApiKey>();
  private rateLimiters = new Map<string, Map<string, { count: number; resetTime: number }>>();
  private usageMetrics: ApiUsage[] = [];

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    this.initializeDefaultApiKeys();
  }

  // API Documentation Generation
  generateSwaggerSpec(app: Express): any {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'CounselFlow API',
          version: '1.0.0',
          description: 'Comprehensive Legal Practice Management API',
          contact: {
            name: 'API Support',
            email: 'api-support@counselflow.com',
            url: 'https://counselflow.com/support',
          },
          license: {
            name: 'Proprietary',
            url: 'https://counselflow.com/license',
          },
        },
        servers: [
          {
            url: this.configService.get('API_BASE_URL', 'http://localhost:3000'),
            description: 'Development server',
          },
          {
            url: 'https://api.counselflow.com',
            description: 'Production server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            apiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-Key',
            },
          },
          schemas: {
            Error: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error message',
                },
                statusCode: {
                  type: 'number',
                  description: 'HTTP status code',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Error timestamp',
                },
                path: {
                  type: 'string',
                  description: 'Request path',
                },
              },
            },
            Client: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Unique client identifier',
                },
                firstName: {
                  type: 'string',
                  description: 'Client first name',
                },
                lastName: {
                  type: 'string',
                  description: 'Client last name',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Client email address',
                },
                phone: {
                  type: 'string',
                  description: 'Client phone number',
                },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zipCode: { type: 'string' },
                    country: { type: 'string' },
                  },
                },
                status: {
                  type: 'string',
                  enum: ['active', 'inactive', 'potential'],
                  description: 'Client status',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Client creation date',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Last update date',
                },
              },
              required: ['firstName', 'lastName', 'email'],
            },
            Case: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Unique case identifier',
                },
                title: {
                  type: 'string',
                  description: 'Case title',
                },
                description: {
                  type: 'string',
                  description: 'Case description',
                },
                caseNumber: {
                  type: 'string',
                  description: 'Court case number',
                },
                clientId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Associated client ID',
                },
                status: {
                  type: 'string',
                  enum: ['open', 'pending', 'closed', 'on-hold'],
                  description: 'Case status',
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'urgent'],
                  description: 'Case priority',
                },
                practiceArea: {
                  type: 'string',
                  description: 'Legal practice area',
                },
                assignedAttorney: {
                  type: 'string',
                  description: 'Assigned attorney ID',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Case creation date',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Last update date',
                },
              },
              required: ['title', 'clientId'],
            },
            Document: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Unique document identifier',
                },
                name: {
                  type: 'string',
                  description: 'Document name',
                },
                type: {
                  type: 'string',
                  description: 'Document type',
                },
                size: {
                  type: 'number',
                  description: 'File size in bytes',
                },
                mimeType: {
                  type: 'string',
                  description: 'MIME type',
                },
                url: {
                  type: 'string',
                  description: 'Document URL',
                },
                caseId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'Associated case ID',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Document tags',
                },
                isConfidential: {
                  type: 'boolean',
                  description: 'Confidentiality flag',
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Document creation date',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Last update date',
                },
              },
              required: ['name', 'type', 'caseId'],
            },
          },
        },
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        tags: [
          {
            name: 'Authentication',
            description: 'User authentication and authorization',
          },
          {
            name: 'Clients',
            description: 'Client management operations',
          },
          {
            name: 'Cases',
            description: 'Case management operations',
          },
          {
            name: 'Documents',
            description: 'Document management operations',
          },
          {
            name: 'Billing',
            description: 'Billing and invoicing operations',
          },
          {
            name: 'Calendar',
            description: 'Calendar and scheduling operations',
          },
          {
            name: 'Reports',
            description: 'Reporting and analytics',
          },
          {
            name: 'Integrations',
            description: 'Third-party integrations',
          },
        ],
      },
      apis: ['./src/**/*.controller.ts', './src/**/*.dto.ts'],
    };

    const swaggerSpec = swaggerJsdoc(options);

    // Setup Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'CounselFlow API Documentation',
        swaggerOptions: {
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
          tryItOutEnabled: true,
          requestInterceptor: (req: any) => {
            req.headers['X-API-Version'] = '1.0.0';
            return req;
          },
        },
      })
    );

    // Provide JSON spec endpoint
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    this.logger.log('Swagger documentation setup complete');
    return swaggerSpec;
  }

  // API Key Management
  async generateApiKey(config: {
    name: string;
    permissions: string[];
    rateLimit?: { requests: number; window: number };
    allowedIPs?: string[];
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }): Promise<ApiKey> {
    const id = crypto.randomUUID();
    const key = `cf_${crypto.randomBytes(20).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');

    const apiKey: ApiKey = {
      id,
      name: config.name,
      key,
      secret,
      permissions: config.permissions,
      rateLimit: config.rateLimit || { requests: 1000, window: 3600000 }, // 1000 requests per hour
      allowedIPs: config.allowedIPs,
      expiresAt: config.expiresAt,
      isActive: true,
      metadata: config.metadata,
    };

    this.apiKeys.set(key, apiKey);
    this.logger.log(`API key generated: ${config.name} (${id})`);
    this.eventEmitter.emit('api-key.created', apiKey);

    return apiKey;
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.get(key);

    if (!apiKey || !apiKey.isActive) {
      return null;
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      apiKey.isActive = false;
      return null;
    }

    apiKey.lastUsed = new Date();
    return apiKey;
  }

  async revokeApiKey(key: string): Promise<void> {
    const apiKey = this.apiKeys.get(key);
    if (apiKey) {
      apiKey.isActive = false;
      this.logger.log(`API key revoked: ${apiKey.name} (${apiKey.id})`);
      this.eventEmitter.emit('api-key.revoked', apiKey);
    }
  }

  async updateApiKey(key: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.get(key);
    if (!apiKey) {
      return null;
    }

    Object.assign(apiKey, updates);
    this.logger.log(`API key updated: ${apiKey.name} (${apiKey.id})`);
    this.eventEmitter.emit('api-key.updated', apiKey);

    return apiKey;
  }

  getAllApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  // Rate Limiting
  async checkRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const windowKey = Math.floor(now / config.windowMs).toString();

    if (!this.rateLimiters.has(identifier)) {
      this.rateLimiters.set(identifier, new Map());
    }

    const userLimiter = this.rateLimiters.get(identifier)!;
    const currentWindow = userLimiter.get(windowKey);

    if (!currentWindow) {
      userLimiter.set(windowKey, {
        count: 1,
        resetTime: now + config.windowMs,
      });

      // Clean up old windows
      for (const [key, window] of userLimiter.entries()) {
        if (window.resetTime < now) {
          userLimiter.delete(key);
        }
      }

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }

    if (currentWindow.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentWindow.resetTime,
      };
    }

    currentWindow.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - currentWindow.count,
      resetTime: currentWindow.resetTime,
    };
  }

  // Usage Tracking
  recordApiUsage(usage: Omit<ApiUsage, 'timestamp'>): void {
    const apiUsage: ApiUsage = {
      ...usage,
      timestamp: new Date(),
    };

    this.usageMetrics.push(apiUsage);

    // Keep only last 10000 records in memory
    if (this.usageMetrics.length > 10000) {
      this.usageMetrics = this.usageMetrics.slice(-10000);
    }

    this.eventEmitter.emit('api.usage.recorded', apiUsage);
  }

  // Analytics and Metrics
  getApiMetrics(timeRange?: { start: Date; end: Date }): ApiMetrics {
    let filteredUsage = this.usageMetrics;

    if (timeRange) {
      filteredUsage = this.usageMetrics.filter(
        usage => usage.timestamp >= timeRange.start && usage.timestamp <= timeRange.end
      );
    }

    const totalRequests = filteredUsage.length;
    const successfulRequests = filteredUsage.filter(
      u => u.statusCode >= 200 && u.statusCode < 400
    ).length;
    const failedRequests = totalRequests - successfulRequests;

    const totalResponseTime = filteredUsage.reduce((sum, u) => sum + u.responseTime, 0);
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    const timeSpan = timeRange
      ? (timeRange.end.getTime() - timeRange.start.getTime()) / 1000
      : 3600; // Default to 1 hour
    const requestsPerSecond = totalRequests / timeSpan;

    // Top endpoints
    const endpointCounts = new Map<string, number>();
    filteredUsage.forEach(usage => {
      const key = `${usage.method} ${usage.endpoint}`;
      endpointCounts.set(key, (endpointCounts.get(key) || 0) + 1);
    });
    const topEndpoints = Array.from(endpointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));

    // Error rates
    const statusCounts = new Map<number, number>();
    filteredUsage.forEach(usage => {
      statusCounts.set(usage.statusCode, (statusCounts.get(usage.statusCode) || 0) + 1);
    });
    const errorRates = Array.from(statusCounts.entries()).map(([statusCode, count]) => ({
      statusCode,
      count,
    }));

    // API key usage
    const keyUsage = new Map<string, number>();
    filteredUsage.forEach(usage => {
      keyUsage.set(usage.keyId, (keyUsage.get(usage.keyId) || 0) + 1);
    });
    const apiKeyUsage = Array.from(keyUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([keyId, requests]) => ({ keyId, requests }));

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      requestsPerSecond,
      topEndpoints,
      errorRates,
      apiKeyUsage,
    };
  }

  // Security Features
  async generateJWT(payload: any, options?: { expiresIn?: string }): Promise<string> {
    const secret = this.configService.get('JWT_SECRET', 'default-secret');
    return jwt.sign(payload, secret, {
      expiresIn: options?.expiresIn || '24h',
      issuer: 'counselflow-api',
      audience: 'counselflow-clients',
    });
  }

  async verifyJWT(token: string): Promise<any> {
    const secret = this.configService.get('JWT_SECRET', 'default-secret');
    return jwt.verify(token, secret);
  }

  // API Versioning
  getApiVersion(request: any): string {
    return (
      request.headers['x-api-version'] ||
      request.headers['accept-version'] ||
      request.query.version ||
      '1.0.0'
    );
  }

  validateApiVersion(version: string): boolean {
    const supportedVersions = ['1.0.0', '1.1.0', '2.0.0'];
    return supportedVersions.includes(version);
  }

  // Health Check
  async getApiHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    activeConnections: number;
    lastUpdated: Date;
  }> {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: 'healthy',
      version: '1.0.0',
      uptime,
      memory: memoryUsage,
      activeConnections: this.usageMetrics.length,
      lastUpdated: new Date(),
    };
  }

  // Default API Keys
  private initializeDefaultApiKeys(): void {
    this.generateApiKey({
      name: 'System Administrator',
      permissions: ['*'],
      rateLimit: { requests: 10000, window: 3600000 }, // 10k requests per hour
      metadata: { type: 'system', createdBy: 'initialization' },
    });

    this.generateApiKey({
      name: 'Mobile App',
      permissions: ['clients:read', 'cases:read', 'documents:read', 'calendar:read'],
      rateLimit: { requests: 5000, window: 3600000 }, // 5k requests per hour
      metadata: { type: 'mobile', createdBy: 'initialization' },
    });

    this.generateApiKey({
      name: 'Web Dashboard',
      permissions: ['clients:*', 'cases:*', 'documents:*', 'billing:*', 'calendar:*'],
      rateLimit: { requests: 8000, window: 3600000 }, // 8k requests per hour
      metadata: { type: 'web', createdBy: 'initialization' },
    });
  }
}

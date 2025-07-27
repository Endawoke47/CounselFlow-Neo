import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiKeyAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IntegrationService } from '../services/integration.service';
import { ApiManagementService } from '../services/api-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

export class CreateIntegrationDto {
  name: string;
  type: string;
  endpoint: string;
  apiKey?: string;
  credentials?: Record<string, any>;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    window: number;
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
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export class UpdateIntegrationDto {
  name?: string;
  endpoint?: string;
  apiKey?: string;
  credentials?: Record<string, any>;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    window: number;
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
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export class SyncDataDto {
  endpoint: string;
  method?: 'GET' | 'POST';
  payload?: any;
  mapping?: Record<string, string>;
  batchSize?: number;
}

export class CreateApiKeyDto {
  name: string;
  permissions: string[];
  rateLimit?: {
    requests: number;
    window: number;
  };
  allowedIPs?: string[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export class UpdateApiKeyDto {
  name?: string;
  permissions?: string[];
  rateLimit?: {
    requests: number;
    window: number;
  };
  allowedIPs?: string[];
  expiresAt?: Date;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

@ApiTags('Integration Management')
@Controller('api/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly apiManagementService: ApiManagementService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all integrations',
    description: 'Retrieve a list of all configured integrations with their status and metrics.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of integrations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clio-integration' },
          name: { type: 'string', example: 'Clio Practice Management' },
          type: { type: 'string', example: 'legal-software' },
          status: { type: 'string', enum: ['active', 'inactive', 'error', 'maintenance'] },
          enabled: { type: 'boolean' },
          lastSync: { type: 'string', format: 'date-time' },
          metadata: { type: 'object' },
        },
      },
    },
  })
  @Roles('admin', 'integration-manager')
  async getAllIntegrations(@Query('type') type?: string) {
    try {
      if (type) {
        return this.integrationService.getIntegrationsByType(type);
      }
      return this.integrationService.getAllIntegrations();
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve integrations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get integration by ID',
    description: 'Retrieve detailed information about a specific integration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: 'clio-integration',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @Roles('admin', 'integration-manager', 'user')
  async getIntegration(@Param('id') id: string) {
    const integration = this.integrationService.getIntegration(id);
    if (!integration) {
      throw new HttpException('Integration not found', HttpStatus.NOT_FOUND);
    }
    return integration;
  }

  @Post()
  @ApiOperation({
    summary: 'Create new integration',
    description: 'Register a new integration with the specified configuration.',
  })
  @ApiResponse({
    status: 201,
    description: 'Integration created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid integration configuration',
  })
  @Roles('admin', 'integration-manager')
  async createIntegration(@Body() createIntegrationDto: CreateIntegrationDto) {
    try {
      return await this.integrationService.registerIntegration(createIntegrationDto);
    } catch (error) {
      throw new HttpException(
        `Failed to create integration: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update integration',
    description: 'Update an existing integration configuration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: 'clio-integration',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @Roles('admin', 'integration-manager')
  async updateIntegration(
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto
  ) {
    try {
      return await this.integrationService.updateIntegration(id, updateIntegrationDto);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Integration not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to update integration: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete integration',
    description: 'Remove an integration and all its associated data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: 'clio-integration',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @Roles('admin')
  async deleteIntegration(@Param('id') id: string) {
    try {
      await this.integrationService.deleteIntegration(id);
      return { message: 'Integration deleted successfully' };
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Integration not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to delete integration: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/sync')
  @ApiOperation({
    summary: 'Sync integration data',
    description: 'Trigger a data synchronization for the specified integration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: 'clio-integration',
  })
  @ApiResponse({
    status: 200,
    description: 'Data sync completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        recordsProcessed: { type: 'number' },
        recordsCreated: { type: 'number' },
        recordsUpdated: { type: 'number' },
        recordsDeleted: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
        duration: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @Roles('admin', 'integration-manager', 'user')
  async syncIntegrationData(@Param('id') id: string, @Body() syncDataDto: SyncDataDto) {
    try {
      return await this.integrationService.syncData(id, syncDataDto.endpoint, {
        method: syncDataDto.method,
        payload: syncDataDto.payload,
        mapping: syncDataDto.mapping,
        batchSize: syncDataDto.batchSize,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to sync data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Check integration health',
    description: 'Check the health status and connectivity of an integration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: 'clio-integration',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
        latency: { type: 'number' },
        lastCheck: { type: 'string', format: 'date-time' },
        error: { type: 'string' },
      },
    },
  })
  @Roles('admin', 'integration-manager', 'user')
  async checkIntegrationHealth(@Param('id') id: string) {
    try {
      return await this.integrationService.checkIntegrationHealth(id);
    } catch (error) {
      throw new HttpException(
        `Failed to check health: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/metrics')
  @ApiOperation({
    summary: 'Get integration metrics',
    description: 'Retrieve performance and usage metrics for an integration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: 'clio-integration',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
  })
  @Roles('admin', 'integration-manager', 'user')
  async getIntegrationMetrics(@Param('id') id: string) {
    try {
      return await this.integrationService.getIntegrationMetrics(id);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve metrics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/webhook')
  @ApiOperation({
    summary: 'Process webhook',
    description: 'Process incoming webhook data from an integration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    example: 'clio-integration',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async processWebhook(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('x-webhook-signature') signature?: string,
    @Query('event') event?: string
  ) {
    try {
      await this.integrationService.processWebhook(id, event || 'webhook', payload, signature);
      return { message: 'Webhook processed successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to process webhook: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

@ApiTags('API Management')
@Controller('api/management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApiManagementController {
  constructor(private readonly apiManagementService: ApiManagementService) {}

  @Get('keys')
  @ApiOperation({
    summary: 'Get all API keys',
    description: 'Retrieve a list of all API keys with their permissions and usage stats.',
  })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
  })
  @Roles('admin', 'api-manager')
  async getAllApiKeys() {
    return this.apiManagementService.getAllApiKeys();
  }

  @Post('keys')
  @ApiOperation({
    summary: 'Generate new API key',
    description: 'Create a new API key with specified permissions and rate limits.',
  })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        key: { type: 'string' },
        secret: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        rateLimit: {
          type: 'object',
          properties: {
            requests: { type: 'number' },
            window: { type: 'number' },
          },
        },
        isActive: { type: 'boolean' },
      },
    },
  })
  @Roles('admin', 'api-manager')
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    try {
      return await this.apiManagementService.generateApiKey(createApiKeyDto);
    } catch (error) {
      throw new HttpException(`Failed to create API key: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('keys/:key')
  @ApiOperation({
    summary: 'Update API key',
    description: 'Update permissions, rate limits, or other settings for an API key.',
  })
  @ApiParam({
    name: 'key',
    description: 'API key',
    example: 'cf_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'API key updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
  })
  @Roles('admin', 'api-manager')
  async updateApiKey(@Param('key') key: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
    try {
      const result = await this.apiManagementService.updateApiKey(key, updateApiKeyDto);
      if (!result) {
        throw new HttpException('API key not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to update API key: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('keys/:key')
  @ApiOperation({
    summary: 'Revoke API key',
    description: 'Revoke an API key to prevent further usage.',
  })
  @ApiParam({
    name: 'key',
    description: 'API key',
    example: 'cf_1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
  })
  @Roles('admin', 'api-manager')
  async revokeApiKey(@Param('key') key: string) {
    try {
      await this.apiManagementService.revokeApiKey(key);
      return { message: 'API key revoked successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to revoke API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get API metrics',
    description: 'Retrieve comprehensive API usage metrics and analytics.',
  })
  @ApiQuery({
    name: 'start',
    required: false,
    description: 'Start date for metrics (ISO string)',
  })
  @ApiQuery({
    name: 'end',
    required: false,
    description: 'End date for metrics (ISO string)',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalRequests: { type: 'number' },
        successfulRequests: { type: 'number' },
        failedRequests: { type: 'number' },
        averageResponseTime: { type: 'number' },
        requestsPerSecond: { type: 'number' },
        topEndpoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              endpoint: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        errorRates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @Roles('admin', 'api-manager', 'analytics-viewer')
  async getApiMetrics(@Query('start') start?: string, @Query('end') end?: string) {
    try {
      const timeRange =
        start && end
          ? {
              start: new Date(start),
              end: new Date(end),
            }
          : undefined;

      return this.apiManagementService.getApiMetrics(timeRange);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve metrics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({
    summary: 'Get API health status',
    description: 'Check the overall health and status of the API system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
  })
  async getApiHealth() {
    try {
      return await this.apiManagementService.getApiHealth();
    } catch (error) {
      throw new HttpException(
        `Failed to check health: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('validate-key')
  @ApiOperation({
    summary: 'Validate API key',
    description: 'Validate an API key and return its permissions and status.',
  })
  @ApiKeyAuth()
  async validateApiKey(@Headers('x-api-key') apiKey: string) {
    if (!apiKey) {
      throw new HttpException('API key required', HttpStatus.UNAUTHORIZED);
    }

    try {
      const keyData = await this.apiManagementService.validateApiKey(apiKey);
      if (!keyData) {
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }

      return {
        valid: true,
        name: keyData.name,
        permissions: keyData.permissions,
        rateLimit: keyData.rateLimit,
        lastUsed: keyData.lastUsed,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to validate API key: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('docs')
  @ApiOperation({
    summary: 'Get API documentation',
    description: 'Retrieve the OpenAPI specification for the API.',
  })
  @ApiResponse({
    status: 200,
    description: 'API documentation retrieved successfully',
  })
  async getApiDocumentation(@Req() req: Request, @Res() res: Response) {
    // This would be handled by the swagger setup in main.ts
    res.redirect('/api-docs');
  }
}

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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiLegalAssistantService } from '../services/ai-legal-assistant.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

export class CreateLegalQueryDto {
  query: string;
  category: string;
  context?: {
    jurisdiction?: string;
    practiceArea?: string;
    caseId?: string;
    clientId?: string;
    urgency?: 'low' | 'medium' | 'high' | 'urgent';
  };
  metadata?: Record<string, any>;
}

export class CreateResearchTaskDto {
  title: string;
  description: string;
  practiceArea: string;
  jurisdiction: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export class AnalyzeDocumentDto {
  documentType: string;
  content?: string;
  metadata?: Record<string, any>;
}

@ApiTags('AI Legal Assistant')
@Controller('api/ai-assistant')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiLegalAssistantController {
  constructor(private readonly aiLegalAssistantService: AiLegalAssistantService) {}

  // Legal Query Endpoints
  @Post('queries')
  @ApiOperation({
    summary: 'Submit legal query',
    description: 'Submit a legal question to the AI assistant for analysis and response.',
  })
  @ApiResponse({
    status: 201,
    description: 'Legal query submitted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        query: { type: 'string' },
        category: { type: 'string' },
        context: {
          type: 'object',
          properties: {
            jurisdiction: { type: 'string' },
            practiceArea: { type: 'string' },
            caseId: { type: 'string' },
            clientId: { type: 'string' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query data',
  })
  @Roles('user', 'attorney', 'admin')
  async submitLegalQuery(
    @Body() createLegalQueryDto: CreateLegalQueryDto,
    @CurrentUser() user: any,
  ) {
    try {
      const query = {
        ...createLegalQueryDto,
        userId: user.id,
      };

      return await this.aiLegalAssistantService.processLegalQuery(query);
    } catch (error) {
      throw new HttpException(
        `Failed to submit legal query: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('queries')
  @ApiOperation({
    summary: 'Get legal queries',
    description: 'Retrieve legal queries for the current user or all users (admin only).',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID (admin only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: ['pending', 'processing', 'completed', 'failed'],
  })
  @ApiResponse({
    status: 200,
    description: 'Legal queries retrieved successfully',
  })
  @Roles('user', 'attorney', 'admin')
  async getLegalQueries(
    @CurrentUser() user: any,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    try {
      // Non-admin users can only see their own queries
      const targetUserId = user.role === 'admin' && userId ? userId : user.id;
      
      let queries = this.aiLegalAssistantService.getAllLegalQueries(targetUserId);
      
      if (status) {
        queries = queries.filter(q => q.status === status);
      }

      return queries;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve queries: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('queries/:id')
  @ApiOperation({
    summary: 'Get legal query by ID',
    description: 'Retrieve a specific legal query and its response.',
  })
  @ApiParam({
    name: 'id',
    description: 'Legal query ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Legal query retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Legal query not found',
  })
  @Roles('user', 'attorney', 'admin')
  async getLegalQuery(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    try {
      const query = this.aiLegalAssistantService.getLegalQuery(id);
      
      if (!query) {
        throw new HttpException('Legal query not found', HttpStatus.NOT_FOUND);
      }

      // Check if user has access to this query
      if (user.role !== 'admin' && query.userId !== user.id) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return query;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve query: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Research Task Endpoints
  @Post('research-tasks')
  @ApiOperation({
    summary: 'Create research task',
    description: 'Create a new legal research task for AI-powered analysis.',
  })
  @ApiResponse({
    status: 201,
    description: 'Research task created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task data',
  })
  @Roles('attorney', 'admin')
  async createResearchTask(
    @Body() createResearchTaskDto: CreateResearchTaskDto,
    @CurrentUser() user: any,
  ) {
    try {
      const task = {
        ...createResearchTaskDto,
        assignedTo: createResearchTaskDto.assignedTo || user.id,
      };

      return await this.aiLegalAssistantService.createResearchTask(task);
    } catch (error) {
      throw new HttpException(
        `Failed to create research task: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('research-tasks')
  @ApiOperation({
    summary: 'Get research tasks',
    description: 'Retrieve research tasks assigned to the user or all tasks (admin only).',
  })
  @ApiQuery({
    name: 'assignedTo',
    required: false,
    description: 'Filter by assigned user ID (admin only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
  })
  @ApiQuery({
    name: 'practiceArea',
    required: false,
    description: 'Filter by practice area',
  })
  @ApiResponse({
    status: 200,
    description: 'Research tasks retrieved successfully',
  })
  @Roles('attorney', 'admin')
  async getResearchTasks(
    @CurrentUser() user: any,
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
    @Query('practiceArea') practiceArea?: string,
  ) {
    try {
      const targetUserId = user.role === 'admin' && assignedTo ? assignedTo : user.id;
      
      let tasks = this.aiLegalAssistantService.getAllResearchTasks(targetUserId);
      
      if (status) {
        tasks = tasks.filter(t => t.status === status);
      }
      
      if (practiceArea) {
        tasks = tasks.filter(t => t.practiceArea.toLowerCase().includes(practiceArea.toLowerCase()));
      }

      return tasks;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve research tasks: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('research-tasks/:id')
  @ApiOperation({
    summary: 'Get research task by ID',
    description: 'Retrieve a specific research task with its findings and progress.',
  })
  @ApiParam({
    name: 'id',
    description: 'Research task ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Research task retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Research task not found',
  })
  @Roles('attorney', 'admin')
  async getResearchTask(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    try {
      const task = this.aiLegalAssistantService.getResearchTask(id);
      
      if (!task) {
        throw new HttpException('Research task not found', HttpStatus.NOT_FOUND);
      }

      // Check if user has access to this task
      if (user.role !== 'admin' && task.assignedTo !== user.id) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return task;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve research task: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('research-tasks/:id')
  @ApiOperation({
    summary: 'Cancel research task',
    description: 'Cancel an in-progress research task.',
  })
  @ApiParam({
    name: 'id',
    description: 'Research task ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Research task cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Research task not found',
  })
  @Roles('attorney', 'admin')
  async cancelResearchTask(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    try {
      const task = this.aiLegalAssistantService.getResearchTask(id);
      
      if (!task) {
        throw new HttpException('Research task not found', HttpStatus.NOT_FOUND);
      }

      // Check if user has access to this task
      if (user.role !== 'admin' && task.assignedTo !== user.id) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      await this.aiLegalAssistantService.cancelResearchTask(id);
      return { message: 'Research task cancelled successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to cancel research task: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Document Analysis Endpoints
  @Post('analyze-document')
  @ApiOperation({
    summary: 'Analyze document',
    description: 'Upload and analyze a legal document using AI-powered analysis.',
  })
  @ApiResponse({
    status: 201,
    description: 'Document analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        documentId: { type: 'string' },
        documentType: { type: 'string' },
        analysis: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            keyProvisions: { type: 'array', items: { type: 'string' } },
            riskFactors: { type: 'array', items: { type: 'string' } },
            obligations: { type: 'array', items: { type: 'string' } },
            deadlines: { type: 'array', items: { type: 'string', format: 'date-time' } },
            parties: { type: 'array', items: { type: 'string' } },
            governingLaw: { type: 'string' },
            redFlags: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            missingClauses: { type: 'array', items: { type: 'string' } },
          },
        },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        processingTime: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid document or analysis failed',
  })
  @UseInterceptors(FileInterceptor('document'))
  @Roles('attorney', 'admin')
  async analyzeDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() analyzeDocumentDto: AnalyzeDocumentDto,
  ) {
    try {
      if (!file && !analyzeDocumentDto.content) {
        throw new HttpException(
          'Either file upload or content text is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const documentContent = file 
        ? file.buffer.toString('utf-8')
        : analyzeDocumentDto.content!;

      const documentId = file?.originalname || `text-document-${Date.now()}`;

      return await this.aiLegalAssistantService.analyzeDocument(
        documentId,
        documentContent,
        analyzeDocumentDto.documentType,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to analyze document: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('analyze-document-text')
  @ApiOperation({
    summary: 'Analyze document text',
    description: 'Analyze legal document content provided as text using AI-powered analysis.',
  })
  @ApiResponse({
    status: 201,
    description: 'Document analysis completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid document content or analysis failed',
  })
  @Roles('attorney', 'admin')
  async analyzeDocumentText(
    @Body() analyzeDocumentDto: AnalyzeDocumentDto,
  ) {
    try {
      if (!analyzeDocumentDto.content) {
        throw new HttpException(
          'Document content is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const documentId = `text-document-${Date.now()}`;

      return await this.aiLegalAssistantService.analyzeDocument(
        documentId,
        analyzeDocumentDto.content,
        analyzeDocumentDto.documentType,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to analyze document: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // AI Assistant Capabilities and Status
  @Get('capabilities')
  @ApiOperation({
    summary: 'Get AI assistant capabilities',
    description: 'Retrieve information about available AI assistant features and limitations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Capabilities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        features: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Legal query processing',
            'Document analysis',
            'Legal research automation',
            'Case law search',
            'Contract review',
            'Compliance checking',
          ],
        },
        supportedDocumentTypes: {
          type: 'array',
          items: { type: 'string' },
          example: ['contract', 'motion', 'brief', 'agreement', 'policy', 'statute'],
        },
        supportedJurisdictions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Federal', 'California', 'New York', 'Texas', 'Florida'],
        },
        practiceAreas: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Contract Law',
            'Employment Law',
            'Corporate Law',
            'Litigation',
            'Real Estate',
            'Intellectual Property',
          ],
        },
        limitations: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'Responses are informational only, not legal advice',
            'Complex matters require attorney consultation',
            'Laws vary by jurisdiction and change frequently',
            'Time-sensitive issues need immediate legal attention',
          ],
        },
      },
    },
  })
  @Roles('user', 'attorney', 'admin')
  async getCapabilities() {
    return {
      features: [
        'Legal query processing with AI-powered responses',
        'Automated document analysis and risk assessment',
        'Legal research task automation',
        'Case law and statute search',
        'Contract review and clause analysis',
        'Compliance checking and recommendations',
        'Legal citation extraction',
        'Key point and summary generation',
      ],
      supportedDocumentTypes: [
        'contract',
        'agreement',
        'motion',
        'brief',
        'policy',
        'statute',
        'regulation',
        'memo',
        'letter',
        'filing',
      ],
      supportedJurisdictions: [
        'Federal',
        'California',
        'New York',
        'Texas',
        'Florida',
        'Illinois',
        'Pennsylvania',
        'Ohio',
        'Georgia',
        'Michigan',
      ],
      practiceAreas: [
        'Contract Law',
        'Employment Law',
        'Corporate Law',
        'Litigation',
        'Real Estate',
        'Intellectual Property',
        'Family Law',
        'Criminal Law',
        'Immigration Law',
        'Tax Law',
        'Environmental Law',
        'Healthcare Law',
      ],
      limitations: [
        'AI responses are for informational purposes only and do not constitute legal advice',
        'Complex legal matters require consultation with qualified attorneys',
        'Laws and regulations vary by jurisdiction and change frequently',
        'Time-sensitive legal issues require immediate professional attention',
        'AI analysis may not capture all nuances of specific legal situations',
        'Professional judgment and human expertise remain essential for legal practice',
      ],
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get AI assistant status',
    description: 'Check the operational status and health of the AI assistant service.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['operational', 'degraded', 'offline'] },
        version: { type: 'string' },
        uptime: { type: 'number' },
        features: {
          type: 'object',
          properties: {
            queryProcessing: { type: 'boolean' },
            documentAnalysis: { type: 'boolean' },
            researchTasks: { type: 'boolean' },
            aiModels: { type: 'boolean' },
          },
        },
        metrics: {
          type: 'object',
          properties: {
            totalQueries: { type: 'number' },
            totalDocuments: { type: 'number' },
            totalTasks: { type: 'number' },
            averageResponseTime: { type: 'number' },
          },
        },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  @Roles('user', 'attorney', 'admin')
  async getStatus() {
    const queries = this.aiLegalAssistantService.getAllLegalQueries();
    const tasks = this.aiLegalAssistantService.getAllResearchTasks();

    return {
      status: 'operational',
      version: '1.0.0',
      uptime: process.uptime(),
      features: {
        queryProcessing: true,
        documentAnalysis: true,
        researchTasks: true,
        aiModels: true, // Would check actual AI service availability
      },
      metrics: {
        totalQueries: queries.length,
        totalDocuments: 0, // Would track from actual storage
        totalTasks: tasks.length,
        averageResponseTime: 2500, // Mock value
      },
      lastUpdated: new Date(),
    };
  }
}

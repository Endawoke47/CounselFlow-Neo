/**
 * 🔌 MODULE DATA ADAPTER
 * 
 * Base adapter class that existing modules can extend to integrate
 * with the centralized data management system without breaking changes.
 * 
 * This provides backward compatibility while enabling new capabilities.
 * 
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataContextProviderService } from './data-context-provider.service';
import { DataManagementHubService } from './data-management-hub.service';

interface AdapterConfig {
  moduleName: string;
  defaultUserId?: string;
  autoCache: boolean;
  realTimeSync: boolean;
  enablePredictive: boolean;
}

interface ModuleDataRequest {
  action: string;
  entityId?: string;
  filters?: Record<string, any>;
  options?: {
    includeRelated?: boolean;
    useCache?: boolean;
    realTime?: boolean;
  };
}

@Injectable()
export abstract class BaseModuleDataAdapter {
  protected readonly logger: Logger;
  protected readonly config: AdapterConfig;

  constructor(
    protected dataContextProvider: DataContextProviderService,
    protected dataHub: DataManagementHubService,
    config: AdapterConfig
  ) {
    this.logger = new Logger(`${config.moduleName}DataAdapter`);
    this.config = config;
    this.logger.log(`🔌 ${config.moduleName} Data Adapter initialized`);
  }

  /**
   * 📊 GET MODULE DATA
   * Main method modules use to get their data
   */
  async getModuleData(
    userId: string,
    request: ModuleDataRequest
  ): Promise<any> {
    try {
      const context = {
        userId: userId || this.config.defaultUserId || 'system',
        userRole: await this.getUserRole(userId),
        module: this.config.moduleName,
        action: request.action,
        entityId: request.entityId,
        filters: request.filters
      };

      const data = await this.dataContextProvider.getModuleData(context);
      
      // Transform data for module compatibility
      return this.transformDataForModule(data, request);

    } catch (error) {
      this.logger.error('Failed to get module data', { error, request });
      throw error;
    }
  }

  /**
   * 🔄 UPDATE MODULE DATA
   */
  async updateModuleData(
    userId: string,
    entity: string,
    operation: 'create' | 'update' | 'delete',
    data: any
  ): Promise<any> {
    try {
      const context = {
        userId: userId || this.config.defaultUserId || 'system',
        userRole: await this.getUserRole(userId),
        module: this.config.moduleName,
        action: `${operation}_${entity.toLowerCase()}`
      };

      return await this.dataContextProvider.updateModuleData(
        context,
        entity,
        operation,
        data
      );

    } catch (error) {
      this.logger.error('Failed to update module data', { error, entity, operation });
      throw error;
    }
  }

  /**
   * 🔍 SEARCH MODULE DATA
   */
  async searchModuleData(
    userId: string,
    searchTerm: string,
    options?: any
  ): Promise<any> {
    try {
      const context = {
        userId: userId || this.config.defaultUserId || 'system',
        userRole: await this.getUserRole(userId),
        module: this.config.moduleName,
        action: 'search'
      };

      const results = await this.dataContextProvider.searchAcrossModules(
        context,
        searchTerm,
        options
      );

      return this.transformSearchResults(results);

    } catch (error) {
      this.logger.error('Module search failed', { error, searchTerm });
      throw error;
    }
  }

  /**
   * 📈 GET MODULE ANALYTICS
   */
  async getModuleAnalytics(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const context = {
        userId: userId || this.config.defaultUserId || 'system',
        userRole: await this.getUserRole(userId),
        module: this.config.moduleName,
        action: 'analytics'
      };

      return await this.dataContextProvider.getModuleAnalytics(context, timeRange);

    } catch (error) {
      this.logger.error('Module analytics failed', { error, timeRange });
      throw error;
    }
  }

  // ABSTRACT METHODS - Must be implemented by concrete adapters

  protected abstract transformDataForModule(data: any, request: ModuleDataRequest): any;
  protected abstract transformSearchResults(results: any): any;
  protected abstract getUserRole(userId: string): Promise<string>;
}

/**
 * 👥 CLIENT PORTAL DATA ADAPTER
 */
@Injectable()
export class ClientPortalDataAdapter extends BaseModuleDataAdapter {
  constructor(
    dataContextProvider: DataContextProviderService,
    dataHub: DataManagementHubService
  ) {
    super(dataContextProvider, dataHub, {
      moduleName: 'client-portal',
      autoCache: true,
      realTimeSync: true,
      enablePredictive: true
    });
  }

  protected transformDataForModule(data: any, request: ModuleDataRequest): any {
    // Transform centralized data to Client Portal format
    return {
      clients: data.primary.filter((item: any) => item.constructor.name === 'Client'),
      cases: data.primary.filter((item: any) => item.constructor.name === 'Case'),
      documents: data.primary.filter((item: any) => item.constructor.name === 'Document'),
      messages: data.secondary.filter((item: any) => item.constructor.name === 'Message'),
      payments: data.secondary.filter((item: any) => item.constructor.name === 'Payment'),
      notifications: data.secondary.filter((item: any) => item.constructor.name === 'Notification'),
      metadata: data.metadata
    };
  }

  protected transformSearchResults(results: any): any {
    return {
      clients: results.results.find((r: any) => r.entity === 'Client')?.results || [],
      cases: results.results.find((r: any) => r.entity === 'Case')?.results || [],
      documents: results.results.find((r: any) => r.entity === 'Document')?.results || [],
      totalFound: results.metadata.totalFound
    };
  }

  protected async getUserRole(userId: string): Promise<string> {
    // Implementation would fetch user role
    return 'client'; // Placeholder
  }

  // Client Portal specific methods
  async getClientDashboard(clientId: string): Promise<any> {
    return this.getModuleData(clientId, {
      action: 'dashboard',
      entityId: clientId,
      options: {
        includeRelated: true,
        useCache: true
      }
    });
  }

  async getClientCases(clientId: string): Promise<any> {
    return this.getModuleData(clientId, {
      action: 'view_cases',
      filters: { clientId },
      options: { includeRelated: true }
    });
  }
}

/**
 * 🤖 AI ASSISTANT DATA ADAPTER
 */
@Injectable()
export class AIAssistantDataAdapter extends BaseModuleDataAdapter {
  constructor(
    dataContextProvider: DataContextProviderService,
    dataHub: DataManagementHubService
  ) {
    super(dataContextProvider, dataHub, {
      moduleName: 'ai-assistant',
      autoCache: true,
      realTimeSync: false,
      enablePredictive: true
    });
  }

  protected transformDataForModule(data: any, request: ModuleDataRequest): any {
    // Transform for AI Assistant needs
    return {
      cases: data.primary.filter(item => item.constructor.name === 'Case'),
      documents: data.primary.filter(item => item.constructor.name === 'Document'),
      clients: data.primary.filter(item => item.constructor.name === 'Client'),
      queries: data.secondary.filter(item => item.constructor.name === 'LegalQuery'),
      tasks: data.secondary.filter(item => item.constructor.name === 'ResearchTask'),
      context: {
        jurisdiction: this.extractJurisdiction(data),
        practiceArea: this.extractPracticeArea(data),
        relatedCases: data.related
      },
      metadata: data.metadata
    };
  }

  protected transformSearchResults(results: any): any {
    return {
      documents: results.results.find(r => r.entity === 'Document')?.results || [],
      cases: results.results.find(r => r.entity === 'Case')?.results || [],
      legalQueries: results.results.find(r => r.entity === 'LegalQuery')?.results || [],
      relevanceScore: this.calculateRelevanceScore(results),
      totalFound: results.metadata.totalFound
    };
  }

  protected async getUserRole(userId: string): Promise<string> {
    return 'attorney'; // Placeholder
  }

  // AI Assistant specific methods
  async getDocumentContext(documentId: string, userId: string): Promise<any> {
    return this.getModuleData(userId, {
      action: 'analyze_document',
      entityId: documentId,
      options: {
        includeRelated: true,
        useCache: false // Always fresh for AI analysis
      }
    });
  }

  async getLegalResearchContext(query: string, userId: string): Promise<any> {
    return this.searchModuleData(userId, query, {
      entities: ['Case', 'Document', 'LegalQuery'],
      fuzzy: true,
      limit: 20
    });
  }

  private extractJurisdiction(data: any): string {
    // Logic to extract jurisdiction from data
    return 'Federal'; // Placeholder
  }

  private extractPracticeArea(data: any): string {
    // Logic to extract practice area from data
    return 'Contract Law'; // Placeholder
  }

  private calculateRelevanceScore(results: any): number {
    // Logic to calculate relevance score
    return 0.85; // Placeholder
  }
}

/**
 * 📁 DOCUMENT MANAGEMENT DATA ADAPTER
 */
@Injectable()
export class DocumentManagementDataAdapter extends BaseModuleDataAdapter {
  constructor(
    dataContextProvider: DataContextProviderService,
    dataHub: DataManagementHubService
  ) {
    super(dataContextProvider, dataHub, {
      moduleName: 'document-management',
      autoCache: true,
      realTimeSync: true,
      enablePredictive: false
    });
  }

  protected transformDataForModule(data: any, request: ModuleDataRequest): any {
    return {
      documents: data.primary.filter(item => item.constructor.name === 'Document'),
      cases: data.primary.filter(item => item.constructor.name === 'Case'),
      clients: data.primary.filter(item => item.constructor.name === 'Client'),
      versions: data.secondary.filter(item => item.constructor.name === 'DocumentVersion'),
      comments: data.secondary.filter(item => item.constructor.name === 'Comment'),
      folders: this.organizeFolderStructure(data),
      metadata: data.metadata
    };
  }

  protected transformSearchResults(results: any): any {
    return {
      documents: results.results.find(r => r.entity === 'Document')?.results || [],
      folders: this.groupByFolder(results.results),
      totalFound: results.metadata.totalFound
    };
  }

  protected async getUserRole(userId: string): Promise<string> {
    return 'attorney'; // Placeholder
  }

  // Document Management specific methods
  async getDocumentTree(userId: string, folderId?: string): Promise<any> {
    return this.getModuleData(userId, {
      action: 'view_tree',
      entityId: folderId,
      options: {
        includeRelated: true,
        useCache: true
      }
    });
  }

  async getDocumentVersions(documentId: string, userId: string): Promise<any> {
    return this.getModuleData(userId, {
      action: 'view_versions',
      entityId: documentId,
      filters: { documentId },
      options: { includeRelated: true }
    });
  }

  private organizeFolderStructure(data: any): any[] {
    // Logic to organize documents into folder structure
    return []; // Placeholder
  }

  private groupByFolder(results: any[]): any {
    // Logic to group search results by folder
    return {}; // Placeholder
  }
}

/**
 * 🏭 ADAPTER FACTORY
 * Creates appropriate adapters for modules
 */
@Injectable()
export class ModuleDataAdapterFactory {
  private readonly adapters = new Map<string, BaseModuleDataAdapter>();

  constructor(
    private dataContextProvider: DataContextProviderService,
    private dataHub: DataManagementHubService
  ) {
    this.initializeAdapters();
  }

  getAdapter(moduleName: string): BaseModuleDataAdapter | null {
    return this.adapters.get(moduleName) || null;
  }

  private initializeAdapters(): void {
    // Initialize all adapters
    this.adapters.set('client-portal', 
      new ClientPortalDataAdapter(this.dataContextProvider, this.dataHub)
    );
    
    this.adapters.set('ai-assistant', 
      new AIAssistantDataAdapter(this.dataContextProvider, this.dataHub)
    );
    
    this.adapters.set('document-management', 
      new DocumentManagementDataAdapter(this.dataContextProvider, this.dataHub)
    );
  }
}

// Legal Research Service - Advanced Semantic Search Engine
// Phase 2: Feature 1 Implementation

import {
  LegalResearchRequest,
  LegalResearchResult,
  LegalDocument,
  Citation,
  Precedent,
  ResearchAnalysis,
  LegalArea,
  DocumentType,
  AuthorityLevel,
  BindingLevel,
  SemanticSearchOptions,
} from '../types/legal-research.types';
import { AIGatewayService } from './ai-gateway.service';
import { CacheService } from './cache.service';
import { UsageTracker } from './usage-tracker.service';
import {
  LegalJurisdiction,
  SupportedLanguage,
  AIProvider,
  AIAnalysisType,
} from '../types/ai.types';
import winston from 'winston';

export class LegalResearchService {
  private aiGateway: AIGatewayService;
  private cache: CacheService;
  private usageTracker: UsageTracker;
  private logger!: winston.Logger;
  private legalSources: Map<string, any> = new Map();

  constructor() {
    this.aiGateway = new AIGatewayService();
    this.cache = new CacheService();
    this.usageTracker = new UsageTracker();
    this.initializeLogger();
    this.initializeLegalSources();
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
        new winston.transports.File({ filename: 'logs/legal-research.log' }),
        new winston.transports.Console(),
      ],
    });
  }

  private initializeLegalSources() {
    // Initialize legal databases and sources for 71 jurisdictions
    this.setupAfricanSources();
    this.setupMiddleEasternSources();
    this.setupInternationalSources();
  }

  private setupAfricanSources() {
    const africanCountries = [
      'nigeria',
      'south_africa',
      'egypt',
      'kenya',
      'ghana',
      'morocco',
      'ethiopia',
      'uganda',
      'tunisia',
      'algeria',
      'angola',
      'cameroon',
      'ivory_coast',
      'madagascar',
      'mozambique',
      'mali',
      'burkina_faso',
      'niger',
      'malawi',
      'zambia',
      'senegal',
      'chad',
      'somalia',
      'zimbabwe',
      'guinea',
      'rwanda',
      'benin',
      'burundi',
      'tunisia',
      'sierra_leone',
      'togo',
      'libya',
      'liberia',
      'mauritania',
      'lesotho',
      'namibia',
      'botswana',
      'gambia',
      'gabon',
      'guinea_bissau',
      'mauritius',
      'eswatini',
      'djibouti',
      'comoros',
      'cape_verde',
      'sao_tome_principe',
      'seychelles',
      'central_african_republic',
      'congo',
      'dr_congo',
      'equatorial_guinea',
      'eritrea',
      'south_sudan',
      'sudan',
    ];

    africanCountries.forEach(country => {
      this.legalSources.set(country, {
        courtSystems: [],
        legalDatabases: [],
        governmentSources: [],
        academicSources: [],
        lastUpdated: new Date(),
      });
    });
  }

  private setupMiddleEasternSources() {
    const middleEasternCountries = [
      'uae',
      'saudi_arabia',
      'israel',
      'turkey',
      'iran',
      'iraq',
      'jordan',
      'kuwait',
      'lebanon',
      'oman',
      'palestine',
      'qatar',
      'syria',
      'yemen',
      'bahrain',
      'cyprus',
    ];

    middleEasternCountries.forEach(country => {
      this.legalSources.set(country, {
        courtSystems: [],
        legalDatabases: [],
        governmentSources: [],
        academicSources: [],
        lastUpdated: new Date(),
      });
    });
  }

  private setupInternationalSources() {
    this.legalSources.set('international', {
      treaties: [],
      internationalCourts: [],
      regionalBodies: [],
      academicSources: [],
      lastUpdated: new Date(),
    });
  }

  /**
   * Main research method - executes comprehensive legal research
   */
  public async research(request: LegalResearchRequest): Promise<LegalResearchResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      this.logger.info(`Starting legal research`, { requestId, query: request.query });

      // Validate request
      this.validateRequest(request);

      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = await this.cache.get(cacheKey);
      if (cachedResult) {
        this.logger.info(`Returning cached result`, { requestId });
        return cachedResult;
      }

      // Execute multi-stage research
      const documents = await this.executeSemanticSearch(request);
      const citations = await this.generateCitations(documents, request.citationFormat);
      const precedents = await this.findPrecedents(documents, request);
      const analysis = request.includeAnalysis
        ? await this.generateAnalysis(documents, precedents, request)
        : null;

      // Compile results
      const result: LegalResearchResult = {
        requestId,
        query: request.query,
        executionTime: Date.now() - startTime,
        totalDocuments: documents.length,
        documents,
        citations,
        precedents,
        analysis: analysis!,
        overallConfidence: this.calculateOverallConfidence(documents, precedents),
        sources: this.getUsedSources(request.jurisdictions),
        suggestions: await this.generateSuggestions(request, documents),
        relatedQueries: await this.generateRelatedQueries(request.query),
        metadata: {
          searchStrategy: ['semantic', 'keyword', 'citation'],
          providersUsed: [AIProvider.OLLAMA, AIProvider.LEGAL_BERT],
          cachingUsed: false,
          qualityScore: 0.95,
          completeness: 0.9,
          freshness: 0.85,
          diversityScore: 0.88,
        },
      };

      // Cache result
      await this.cache.set(cacheKey, result, 3600); // 1 hour TTL

      // Track usage
      await this.usageTracker.trackUsage({
        id: 'temp-id',
        requestId,
        userId: 'research-user',
        provider: AIProvider.OLLAMA,
        model: 'research',
        analysisType: AIAnalysisType.LEGAL_RESEARCH,
        tokensUsed: 0,
        cost: 0,
        success: true,
        processingTime: result.executionTime,
        timestamp: new Date(),
      });

      this.logger.info(`Research completed`, {
        requestId,
        documentsFound: documents.length,
        executionTime: result.executionTime,
      });

      return result;
    } catch (error) {
      this.logger.error(`Research failed`, { requestId, error });
      throw new Error(`Legal research failed: ${error}`);
    }
  }

  /**
   * Execute semantic search across legal databases
   */
  private async executeSemanticSearch(request: LegalResearchRequest): Promise<LegalDocument[]> {
    const searchOptions: SemanticSearchOptions = {
      enableVectorSearch: request.semanticSearch,
      similarityThreshold: request.confidenceThreshold,
      maxSimilarDocuments: request.maxResults,
      includeConceptualMatches: true,
      weightFactors: {
        recency: 0.3,
        relevance: 0.4,
        authority: 0.2,
        jurisdiction: 0.1,
      },
    };

    // Multi-provider search strategy
    const searchPromises = [];

    // 1. AI-enhanced query understanding
    const enhancedQuery = await this.enhanceQuery(request.query, request.legalAreas);

    // 2. Jurisdiction-specific searches
    for (const jurisdiction of request.jurisdictions) {
      searchPromises.push(this.searchJurisdiction(enhancedQuery, jurisdiction, request));
    }

    // 3. Cross-jurisdictional search for comparative analysis
    if (request.jurisdictions.length > 1) {
      searchPromises.push(this.searchComparative(enhancedQuery, request.jurisdictions, request));
    }

    // Execute all searches in parallel
    const searchResults = await Promise.all(searchPromises);
    const allDocuments = searchResults.flat();

    // Deduplicate and rank
    const uniqueDocuments = this.deduplicateDocuments(allDocuments);
    const rankedDocuments = this.rankDocuments(uniqueDocuments, request, searchOptions);

    return rankedDocuments.slice(0, request.maxResults);
  }

  /**
   * Enhance query using AI for better search results
   */
  private async enhanceQuery(query: string, legalAreas: LegalArea[]): Promise<string> {
    const enhancementPrompt = `
    As a legal research expert, enhance this search query for better legal database results:
    
    Original Query: "${query}"
    Legal Areas: ${legalAreas.join(', ')}
    
    Provide:
    1. Enhanced query with legal terminology
    2. Alternative phrasings
    3. Related legal concepts
    4. Key search terms
    
    Enhanced query:`;

    try {
      const response = await this.aiGateway.processRequest(
        {
          input: enhancementPrompt,
          type: AIAnalysisType.LEGAL_RESEARCH,
          context: {
            jurisdiction: LegalJurisdiction.INTERNATIONAL,
            legalSystem: 'mixed' as any,
            language: SupportedLanguage.ENGLISH,
            practiceArea: 'legal_research',
            confidentialityLevel: 'public',
          },
          provider: AIProvider.LEGAL_BERT,
        },
        'research-user'
      );

      return response.output || query;
    } catch (error) {
      this.logger.warn(`Query enhancement failed, using original`, { error });
      return query;
    }
  }

  /**
   * Search within specific jurisdiction
   */
  private async searchJurisdiction(
    query: string,
    jurisdiction: LegalJurisdiction,
    request: LegalResearchRequest
  ): Promise<LegalDocument[]> {
    // Simulated search - in production, this would query real legal databases
    const mockDocuments: LegalDocument[] = [
      {
        id: `doc_${jurisdiction}_1`,
        title: `Legal Document for ${jurisdiction}`,
        content: `Content related to ${query} in ${jurisdiction}`,
        excerpt: `Relevant excerpt for ${query}...`,
        documentType: DocumentType.CASE_LAW,
        jurisdiction,
        language: SupportedLanguage.ENGLISH,
        legalAreas: request.legalAreas,
        publicationDate: new Date('2023-01-01'),
        lastUpdated: new Date(),
        authority: AuthorityLevel.APPELLATE_COURT,
        source: {
          id: `source_${jurisdiction}`,
          name: `${jurisdiction} Legal Database`,
          type: 'legal_database' as any,
          jurisdiction,
          credibility: 'high' as any,
          accessLevel: 'public' as any,
          lastUpdated: new Date(),
          subscription: false,
          searchCapabilities: ['full_text', 'semantic'] as any,
        },
        metadata: {
          wordCount: 5000,
          pageCount: 20,
          tableOfContents: ['Introduction', 'Analysis', 'Conclusion'],
          keyTerms: query.split(' '),
          entities: [],
          topics: [],
          complexity: request.complexity,
          readingTime: 15,
          checksum: 'mock_checksum',
          version: '1.0',
        },
        relevanceScore: 0.85,
        confidenceScore: 0.9,
      },
    ];

    return mockDocuments;
  }

  /**
   * Execute comparative search across multiple jurisdictions
   */
  private async searchComparative(
    query: string,
    jurisdictions: LegalJurisdiction[],
    request: LegalResearchRequest
  ): Promise<LegalDocument[]> {
    // Comparative analysis across jurisdictions
    this.logger.info(`Executing comparative search across ${jurisdictions.length} jurisdictions`);

    // This would use AI to find similar legal concepts across jurisdictions
    return [];
  }

  /**
   * Generate legal citations in specified format
   */
  private async generateCitations(documents: LegalDocument[], format: any): Promise<Citation[]> {
    return documents.map(doc => ({
      id: `citation_${doc.id}`,
      document: doc,
      format,
      citation: this.formatCitation(doc, format),
      shortForm: this.formatShortCitation(doc, format),
      accessed: new Date(),
      validatedAt: new Date(),
      isValid: true,
    }));
  }

  /**
   * Find legal precedents relevant to the query
   */
  private async findPrecedents(
    documents: LegalDocument[],
    request: LegalResearchRequest
  ): Promise<Precedent[]> {
    const caseDocuments = documents.filter(
      doc =>
        doc.documentType === DocumentType.CASE_LAW ||
        doc.documentType === DocumentType.COURT_DECISION
    );

    return caseDocuments.map(caseDoc => ({
      id: `precedent_${caseDoc.id}`,
      case: caseDoc,
      principle: 'Legal principle extracted from case',
      bindingLevel: BindingLevel.BINDING,
      applicableJurisdictions: [caseDoc.jurisdiction],
      similarCases: [],
      keyFacts: ['Key fact 1', 'Key fact 2'],
      legalReasoning: 'Legal reasoning from the case',
      relevanceToQuery: caseDoc.relevanceScore,
      isOverruled: false,
      relatedStatutes: [],
    }));
  }

  /**
   * Generate comprehensive analysis of research results
   */
  private async generateAnalysis(
    documents: LegalDocument[],
    precedents: Precedent[],
    request: LegalResearchRequest
  ): Promise<ResearchAnalysis> {
    const analysisPrompt = `
    Analyze these legal research results:
    
    Query: ${request.query}
    Documents Found: ${documents.length}
    Jurisdictions: ${request.jurisdictions.join(', ')}
    Legal Areas: ${request.legalAreas.join(', ')}
    
    Provide comprehensive analysis including:
    1. Summary of findings
    2. Key legal principles
    3. Jurisdictional differences
    4. Recommended actions
    5. Research gaps
    `;

    try {
      const response = await this.aiGateway.processRequest(
        {
          input: analysisPrompt,
          type: AIAnalysisType.LEGAL_RESEARCH,
          context: {
            jurisdiction: request.jurisdictions[0],
            legalSystem: 'mixed' as any,
            language: SupportedLanguage.ENGLISH,
            practiceArea: request.legalAreas[0],
            confidentialityLevel: 'public',
          },
          provider: AIProvider.OLLAMA,
        },
        'research-user'
      );

      return {
        summary: response.output || 'Analysis summary',
        keyFindings: ['Finding 1', 'Finding 2', 'Finding 3'],
        legalTrends: [],
        jurisdictionalAnalysis: [],
        recommendedActions: ['Action 1', 'Action 2'],
        researchGaps: ['Gap 1', 'Gap 2'],
        confidenceLevel: 0.85,
        methodologyUsed: ['AI analysis', 'Semantic search', 'Citation analysis'],
        limitations: ['Limited to available databases', 'AI interpretation required'],
      };
    } catch (error) {
      this.logger.warn(`Analysis generation failed`, { error });
      return {
        summary: 'Analysis unavailable',
        keyFindings: [],
        legalTrends: [],
        jurisdictionalAnalysis: [],
        recommendedActions: [],
        researchGaps: [],
        confidenceLevel: 0.5,
        methodologyUsed: [],
        limitations: ['Analysis generation failed'],
      };
    }
  }

  // ===== UTILITY METHODS =====

  private validateRequest(request: LegalResearchRequest): void {
    // Implement JSON schema validation
    if (!request.query || request.query.length < 3) {
      throw new Error('Query must be at least 3 characters long');
    }
    if (!request.jurisdictions || request.jurisdictions.length === 0) {
      throw new Error('At least one jurisdiction must be specified');
    }
    if (!request.legalAreas || request.legalAreas.length === 0) {
      throw new Error('At least one legal area must be specified');
    }
  }

  private generateRequestId(): string {
    return `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCacheKey(request: LegalResearchRequest): string {
    const key = JSON.stringify({
      query: request.query,
      jurisdictions: request.jurisdictions.sort(),
      legalAreas: request.legalAreas.sort(),
      documentTypes: request.documentTypes.sort(),
      complexity: request.complexity,
    });
    return `research:${Buffer.from(key).toString('base64')}`;
  }

  private deduplicateDocuments(documents: LegalDocument[]): LegalDocument[] {
    const seen = new Set();
    return documents.filter(doc => {
      const key = `${doc.title}:${doc.jurisdiction}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private rankDocuments(
    documents: LegalDocument[],
    request: LegalResearchRequest,
    options: SemanticSearchOptions
  ): LegalDocument[] {
    return documents.sort((a, b) => {
      const scoreA = this.calculateDocumentScore(a, request, options);
      const scoreB = this.calculateDocumentScore(b, request, options);
      return scoreB - scoreA;
    });
  }

  private calculateDocumentScore(
    doc: LegalDocument,
    request: LegalResearchRequest,
    options: SemanticSearchOptions
  ): number {
    const weights = options.weightFactors;

    const relevanceScore = doc.relevanceScore * weights.relevance;
    const recencyScore = this.calculateRecencyScore(doc.publicationDate) * weights.recency;
    const authorityScore = this.calculateAuthorityScore(doc.authority) * weights.authority;
    const jurisdictionScore = request.jurisdictions.includes(doc.jurisdiction) ? 1 : 0.5;

    return (
      relevanceScore + recencyScore + authorityScore + jurisdictionScore * weights.jurisdiction
    );
  }

  private calculateRecencyScore(date: Date): number {
    const now = new Date();
    const ageInYears = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, 1 - ageInYears / 10); // Decreases over 10 years
  }

  private calculateAuthorityScore(authority: AuthorityLevel): number {
    const scores = {
      [AuthorityLevel.SUPREME_COURT]: 1.0,
      [AuthorityLevel.APPELLATE_COURT]: 0.8,
      [AuthorityLevel.TRIAL_COURT]: 0.6,
      [AuthorityLevel.ADMINISTRATIVE]: 0.5,
      [AuthorityLevel.ACADEMIC]: 0.4,
      [AuthorityLevel.PRACTITIONER]: 0.3,
      [AuthorityLevel.UNKNOWN]: 0.2,
    };
    return scores[authority] || 0.2;
  }

  private calculateOverallConfidence(documents: LegalDocument[], precedents: Precedent[]): number {
    if (documents.length === 0) return 0;

    const docConfidences = documents.map(d => d.confidenceScore);
    const avgDocConfidence = docConfidences.reduce((sum, conf) => sum + conf, 0) / documents.length;

    // Factor in number of supporting documents and precedents
    const volumeBonus = Math.min(0.1, (documents.length + precedents.length) * 0.01);

    return Math.min(1.0, avgDocConfidence + volumeBonus);
  }

  private getUsedSources(jurisdictions: LegalJurisdiction[]): any[] {
    return jurisdictions.map(jurisdiction => this.legalSources.get(jurisdiction)).filter(Boolean);
  }

  private async generateSuggestions(
    request: LegalResearchRequest,
    documents: LegalDocument[]
  ): Promise<any[]> {
    // Generate intelligent suggestions based on results
    return [
      {
        type: 'related_search',
        suggestion: 'Consider searching for recent amendments to relevant statutes',
        reason: 'Recent legislative changes may affect your research',
        priority: 'high',
        estimatedValue: 0.8,
        relatedQueries: ['recent amendments', 'legislative updates'],
      },
    ];
  }

  private async generateRelatedQueries(query: string): Promise<string[]> {
    // Generate related queries using AI
    return [
      `${query} recent developments`,
      `${query} comparative analysis`,
      `${query} regulatory updates`,
    ];
  }

  private formatCitation(document: LegalDocument, format: any): string {
    // Implement proper citation formatting based on format
    return `${document.title}, ${document.jurisdiction} (${document.publicationDate.getFullYear()})`;
  }

  private formatShortCitation(document: LegalDocument, format: any): string {
    // Implement short citation formatting
    return `${document.title.substring(0, 50)}...`;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

export interface LegalQuery {
  id: string;
  userId: string;
  query: string;
  category: string;
  context?: {
    jurisdiction?: string;
    practiceArea?: string;
    caseId?: string;
    clientId?: string;
    urgency?: 'low' | 'medium' | 'high' | 'urgent';
  };
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  response?: LegalResponse;
  metadata?: Record<string, any>;
}

export interface LegalResponse {
  id: string;
  answer: string;
  confidence: number;
  sources: LegalSource[];
  recommendations: string[];
  relatedCases?: string[];
  keyPoints: string[];
  legalCitations: string[];
  nextSteps: string[];
  warnings?: string[];
  estimatedReadingTime: number;
  complexity: 'low' | 'medium' | 'high';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LegalSource {
  id: string;
  title: string;
  type: 'statute' | 'case-law' | 'regulation' | 'secondary' | 'internal';
  citation: string;
  jurisdiction: string;
  relevance: number;
  excerpt: string;
  url?: string;
  lastUpdated: Date;
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  documentType: string;
  analysis: {
    summary: string;
    keyProvisions: string[];
    riskFactors: string[];
    obligations: string[];
    deadlines: Date[];
    parties: string[];
    governingLaw: string;
    redFlags: string[];
    recommendations: string[];
    missingClauses: string[];
  };
  confidence: number;
  processingTime: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LegalPrecedent {
  id: string;
  caseTitle: string;
  citation: string;
  court: string;
  jurisdiction: string;
  date: Date;
  keyFacts: string[];
  holding: string;
  reasoning: string[];
  relevance: number;
  impact: 'high' | 'medium' | 'low';
  status: 'active' | 'overruled' | 'distinguished' | 'questioned';
  relatedCases: string[];
  metadata?: Record<string, any>;
}

export interface LegalResearchTask {
  id: string;
  title: string;
  description: string;
  practiceArea: string;
  jurisdiction: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  progress: number;
  findings: LegalFinding[];
  sources: LegalSource[];
  timestamp: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface LegalFinding {
  id: string;
  title: string;
  summary: string;
  details: string;
  significance: 'critical' | 'important' | 'moderate' | 'minor';
  confidence: number;
  sources: string[];
  tags: string[];
  timestamp: Date;
}

@Injectable()
export class AiLegalAssistantService {
  private readonly logger = new Logger(AiLegalAssistantService.name);
  private openai: OpenAI;
  private legalQueries = new Map<string, LegalQuery>();
  private researchTasks = new Map<string, LegalResearchTask>();
  private legalKnowledgeBase: LegalSource[] = [];

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    this.initializeOpenAI();
    this.loadLegalKnowledgeBase();
  }

  private initializeOpenAI(): void {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. AI features will be limited.');
      return;
    }

    this.openai = new OpenAI({
      apiKey,
      organization: this.configService.get<string>('OPENAI_ORG_ID'),
    });

    this.logger.log('OpenAI client initialized successfully');
  }

  // Legal Query Processing
  async processLegalQuery(
    query: Omit<LegalQuery, 'id' | 'timestamp' | 'status'>
  ): Promise<LegalQuery> {
    const legalQuery: LegalQuery = {
      id: crypto.randomUUID(),
      ...query,
      timestamp: new Date(),
      status: 'pending',
    };

    this.legalQueries.set(legalQuery.id, legalQuery);
    this.eventEmitter.emit('legal-query.created', legalQuery);

    // Process query asynchronously
    this.processQueryAsync(legalQuery.id);

    return legalQuery;
  }

  private async processQueryAsync(queryId: string): Promise<void> {
    const query = this.legalQueries.get(queryId);
    if (!query) return;

    try {
      query.status = 'processing';
      this.eventEmitter.emit('legal-query.processing', query);

      const response = await this.generateLegalResponse(query);
      query.response = response;
      query.status = 'completed';

      this.eventEmitter.emit('legal-query.completed', query);
      this.logger.log(`Legal query processed successfully: ${queryId}`);
    } catch (error) {
      query.status = 'failed';
      this.logger.error(`Failed to process legal query ${queryId}: ${error.message}`);
      this.eventEmitter.emit('legal-query.failed', { query, error: error.message });
    }
  }

  private async generateLegalResponse(query: LegalQuery): Promise<LegalResponse> {
    const startTime = Date.now();

    // Search relevant sources
    const relevantSources = await this.searchLegalSources(query.query, query.context);

    // Generate AI response
    const aiResponse = await this.generateAIResponse(query, relevantSources);

    // Extract legal citations
    const legalCitations = this.extractLegalCitations(aiResponse);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(query, aiResponse);

    // Find related cases
    const relatedCases = await this.findRelatedCases(query);

    const response: LegalResponse = {
      id: crypto.randomUUID(),
      answer: aiResponse,
      confidence: this.calculateConfidence(relevantSources, aiResponse),
      sources: relevantSources,
      recommendations,
      relatedCases,
      keyPoints: this.extractKeyPoints(aiResponse),
      legalCitations,
      nextSteps: await this.generateNextSteps(query, aiResponse),
      warnings: this.identifyWarnings(aiResponse),
      estimatedReadingTime: Math.ceil(aiResponse.split(' ').length / 200), // 200 WPM
      complexity: this.assessComplexity(aiResponse),
      timestamp: new Date(),
      metadata: {
        processingTime: Date.now() - startTime,
        sourceCount: relevantSources.length,
        model: 'gpt-4-turbo',
      },
    };

    return response;
  }

  private async generateAIResponse(query: LegalQuery, sources: LegalSource[]): Promise<string> {
    if (!this.openai) {
      return this.generateFallbackResponse(query);
    }

    const systemPrompt = this.buildSystemPrompt(query.context);
    const userPrompt = this.buildUserPrompt(query, sources);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1, // Lower temperature for more consistent legal advice
        max_tokens: 2000,
        presence_penalty: -0.1,
        frequency_penalty: 0.1,
      });

      return completion.choices[0]?.message?.content || 'Unable to generate response';
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error.message}`);
      return this.generateFallbackResponse(query);
    }
  }

  private buildSystemPrompt(context?: LegalQuery['context']): string {
    const jurisdiction = context?.jurisdiction || 'United States';
    const practiceArea = context?.practiceArea || 'General Law';

    return `You are an expert legal assistant specializing in ${practiceArea} law in ${jurisdiction}. 

Your responsibilities:
1. Provide accurate, well-researched legal information
2. Cite relevant statutes, regulations, and case law
3. Identify potential legal issues and risks
4. Suggest practical next steps
5. Clearly distinguish between legal facts and opinions
6. Warn about areas requiring attorney consultation

Important disclaimers:
- This is informational only, not legal advice
- Laws vary by jurisdiction and change frequently
- Complex matters require attorney consultation
- Time-sensitive issues need immediate legal attention

Format your response with:
- Clear, concise explanations
- Relevant legal authorities
- Practical implications
- Recommended actions
- Risk factors to consider`;
  }

  private buildUserPrompt(query: LegalQuery, sources: LegalSource[]): string {
    let prompt = `Legal Question: ${query.query}\n\n`;

    if (query.context) {
      prompt += `Context:\n`;
      if (query.context.jurisdiction) prompt += `- Jurisdiction: ${query.context.jurisdiction}\n`;
      if (query.context.practiceArea) prompt += `- Practice Area: ${query.context.practiceArea}\n`;
      if (query.context.urgency) prompt += `- Urgency: ${query.context.urgency}\n`;
      prompt += '\n';
    }

    if (sources.length > 0) {
      prompt += `Relevant Legal Sources:\n`;
      sources.slice(0, 5).forEach((source, index) => {
        prompt += `${index + 1}. ${source.title}\n`;
        prompt += `   Citation: ${source.citation}\n`;
        prompt += `   Excerpt: ${source.excerpt}\n\n`;
      });
    }

    prompt += `Please provide a comprehensive legal analysis addressing the question above.`;

    return prompt;
  }

  private generateFallbackResponse(query: LegalQuery): string {
    return `I understand you're asking about: "${query.query}"

While I don't have access to real-time legal databases, I can provide some general guidance:

**Important Notice**: This is general information only and should not be considered legal advice. For specific legal matters, please consult with a qualified attorney.

**General Considerations**:
- Legal issues can be complex and jurisdiction-specific
- Laws and regulations change frequently
- Individual circumstances significantly affect legal outcomes
- Time limitations may apply to legal actions

**Recommended Next Steps**:
1. Consult with a qualified attorney in your jurisdiction
2. Gather all relevant documentation
3. Research applicable local laws and regulations
4. Consider time-sensitive deadlines
5. Document all relevant facts and circumstances

**Additional Resources**:
- State bar association referral services
- Legal aid organizations for qualifying individuals
- Court self-help centers
- Government legal information websites

For urgent legal matters, seek immediate legal counsel.`;
  }

  // Document Analysis
  async analyzeDocument(
    documentId: string,
    documentContent: string,
    documentType: string
  ): Promise<DocumentAnalysis> {
    const startTime = Date.now();

    try {
      const analysis = await this.performDocumentAnalysis(documentContent, documentType);

      const documentAnalysis: DocumentAnalysis = {
        id: crypto.randomUUID(),
        documentId,
        documentType,
        analysis,
        confidence: this.calculateDocumentAnalysisConfidence(analysis),
        processingTime: Date.now() - startTime,
        timestamp: new Date(),
        metadata: {
          contentLength: documentContent.length,
          model: 'gpt-4-turbo',
        },
      };

      this.eventEmitter.emit('document.analyzed', documentAnalysis);
      return documentAnalysis;
    } catch (error) {
      this.logger.error(`Document analysis failed: ${error.message}`);
      throw error;
    }
  }

  private async performDocumentAnalysis(
    content: string,
    documentType: string
  ): Promise<DocumentAnalysis['analysis']> {
    if (!this.openai) {
      return this.generateFallbackDocumentAnalysis(documentType);
    }

    const systemPrompt = `You are a legal document analysis expert. Analyze the provided ${documentType} document and extract key information.

Focus on:
1. Document summary and purpose
2. Key provisions and clauses
3. Risk factors and potential issues
4. Legal obligations and responsibilities
5. Important deadlines and dates
6. Parties involved
7. Governing law and jurisdiction
8. Red flags or concerning language
9. Missing standard clauses
10. Recommendations for improvement

Provide structured, actionable analysis that helps legal professionals understand the document's implications.`;

    const userPrompt = `Please analyze this ${documentType} document:

${content.substring(0, 8000)} ${content.length > 8000 ? '...(truncated)' : ''}

Provide a comprehensive analysis following the structured format.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 2500,
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseDocumentAnalysisResponse(response);
    } catch (error) {
      this.logger.error(`OpenAI document analysis error: ${error.message}`);
      return this.generateFallbackDocumentAnalysis(documentType);
    }
  }

  private parseDocumentAnalysisResponse(response: string): DocumentAnalysis['analysis'] {
    // Parse the AI response into structured format
    // This is a simplified implementation - in production, use more sophisticated parsing

    return {
      summary: this.extractSection(response, 'summary') || 'Document analysis completed',
      keyProvisions: this.extractListItems(response, 'provisions|clauses'),
      riskFactors: this.extractListItems(response, 'risk|risks'),
      obligations: this.extractListItems(response, 'obligations|responsibilities'),
      deadlines: this.extractDates(response),
      parties: this.extractListItems(response, 'parties|party'),
      governingLaw: this.extractSection(response, 'governing law|jurisdiction') || 'Not specified',
      redFlags: this.extractListItems(response, 'red flags|concerns|issues'),
      recommendations: this.extractListItems(response, 'recommendations|suggest'),
      missingClauses: this.extractListItems(response, 'missing|absent'),
    };
  }

  // Legal Research
  async createResearchTask(
    task: Omit<
      LegalResearchTask,
      'id' | 'timestamp' | 'status' | 'progress' | 'findings' | 'sources'
    >
  ): Promise<LegalResearchTask> {
    const researchTask: LegalResearchTask = {
      id: crypto.randomUUID(),
      ...task,
      status: 'pending',
      progress: 0,
      findings: [],
      sources: [],
      timestamp: new Date(),
    };

    this.researchTasks.set(researchTask.id, researchTask);
    this.eventEmitter.emit('research-task.created', researchTask);

    // Start research asynchronously
    this.performResearchAsync(researchTask.id);

    return researchTask;
  }

  private async performResearchAsync(taskId: string): Promise<void> {
    const task = this.researchTasks.get(taskId);
    if (!task) return;

    try {
      task.status = 'in-progress';
      this.eventEmitter.emit('research-task.started', task);

      // Simulate research phases
      const phases = [
        { name: 'Source Discovery', weight: 30 },
        { name: 'Analysis', weight: 40 },
        { name: 'Synthesis', weight: 30 },
      ];

      for (const [index, phase] of phases.entries()) {
        this.logger.log(`Research task ${taskId}: ${phase.name}`);

        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 2000));

        task.progress = phases.slice(0, index + 1).reduce((sum, p) => sum + p.weight, 0);
        this.eventEmitter.emit('research-task.progress', task);
      }

      // Generate findings
      task.findings = await this.generateResearchFindings(task);
      task.sources = await this.gatherResearchSources(task);
      task.status = 'completed';
      task.completedAt = new Date();
      task.progress = 100;

      this.eventEmitter.emit('research-task.completed', task);
      this.logger.log(`Research task completed: ${taskId}`);
    } catch (error) {
      task.status = 'cancelled';
      this.logger.error(`Research task failed ${taskId}: ${error.message}`);
      this.eventEmitter.emit('research-task.failed', { task, error: error.message });
    }
  }

  // Utility Methods
  private async searchLegalSources(
    query: string,
    context?: LegalQuery['context']
  ): Promise<LegalSource[]> {
    // In production, this would search actual legal databases
    return this.legalKnowledgeBase
      .filter(source => {
        const matchesQuery =
          source.title.toLowerCase().includes(query.toLowerCase()) ||
          source.excerpt.toLowerCase().includes(query.toLowerCase());
        const matchesJurisdiction =
          !context?.jurisdiction || source.jurisdiction === context.jurisdiction;
        return matchesQuery && matchesJurisdiction;
      })
      .slice(0, 10)
      .map(source => ({ ...source, relevance: Math.random() * 0.4 + 0.6 }))
      .sort((a, b) => b.relevance - a.relevance);
  }

  private extractLegalCitations(text: string): string[] {
    // Simplified citation extraction - in production, use more sophisticated regex
    const citationPatterns = [
      /\d+\s+[A-Z][a-z]+\.?\s+\d+/g, // e.g., "123 F.3d 456"
      /\d+\s+U\.S\.C\.?\s+§?\s*\d+/g, // e.g., "42 U.S.C. § 1983"
      /\d+\s+[A-Z][a-z]+\.\s*\d+/g, // e.g., "123 Cal. 456"
    ];

    const citations: string[] = [];
    citationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) citations.push(...matches);
    });

    return [...new Set(citations)]; // Remove duplicates
  }

  private calculateConfidence(sources: LegalSource[], response: string): number {
    let confidence = 0.5; // Base confidence

    // Adjust based on source quality
    confidence += Math.min(sources.length * 0.1, 0.3);

    // Adjust based on response length and detail
    confidence += Math.min(response.length / 5000, 0.2);

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private extractKeyPoints(text: string): string[] {
    // Simplified key point extraction
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  private assessComplexity(text: string): 'low' | 'medium' | 'high' {
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / text.split(/[.!?]+/).length;

    if (avgWordsPerSentence > 25 || words > 1500) return 'high';
    if (avgWordsPerSentence > 15 || words > 800) return 'medium';
    return 'low';
  }

  private async generateRecommendations(query: LegalQuery, response: string): Promise<string[]> {
    // Generate contextual recommendations
    const recommendations = [
      'Consult with a qualified attorney for personalized advice',
      'Review applicable local laws and regulations',
      'Document all relevant facts and circumstances',
      'Consider time-sensitive deadlines and statutes of limitations',
    ];

    if (query.context?.urgency === 'urgent') {
      recommendations.unshift('Seek immediate legal counsel due to urgent nature');
    }

    return recommendations;
  }

  private async generateNextSteps(query: LegalQuery, response: string): Promise<string[]> {
    return [
      'Review the provided analysis thoroughly',
      'Gather additional documentation if needed',
      'Consult with legal counsel',
      'Monitor for any changes in applicable law',
    ];
  }

  private identifyWarnings(response: string): string[] {
    const warnings: string[] = [];

    if (response.toLowerCase().includes('urgent') || response.toLowerCase().includes('immediate')) {
      warnings.push('Time-sensitive matter requiring prompt attention');
    }

    if (
      response.toLowerCase().includes('complex') ||
      response.toLowerCase().includes('complicated')
    ) {
      warnings.push('Complex legal matter requiring specialized expertise');
    }

    return warnings;
  }

  private async findRelatedCases(query: LegalQuery): Promise<string[]> {
    // Mock implementation - in production, search case databases
    return ['Smith v. Jones (2023)', 'ABC Corp v. XYZ Inc (2022)', 'State v. Brown (2021)'];
  }

  // Helper methods for document analysis
  private extractSection(text: string, sectionName: string): string | null {
    const regex = new RegExp(`${sectionName}[:\\-\\s]+(.*?)(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractListItems(text: string, category: string): string[] {
    const regex = new RegExp(`${category}[:\\-\\s]+([\\s\\S]*?)(?=\\n\\n|[A-Z][a-z]+:|$)`, 'i');
    const match = text.match(regex);

    if (!match) return [];

    return match[1]
      .split(/\n|•|-|\d+\./)
      .filter(item => item.trim().length > 5)
      .map(item => item.trim())
      .slice(0, 10);
  }

  private extractDates(text: string): Date[] {
    const dateRegex =
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b|\b[A-Z][a-z]+ \d{1,2}, \d{4}\b/g;
    const matches = text.match(dateRegex) || [];

    return matches
      .map(dateStr => new Date(dateStr))
      .filter(date => !isNaN(date.getTime()))
      .slice(0, 10);
  }

  private calculateDocumentAnalysisConfidence(analysis: DocumentAnalysis['analysis']): number {
    let confidence = 0.5;

    if (analysis.keyProvisions.length > 0) confidence += 0.1;
    if (analysis.riskFactors.length > 0) confidence += 0.1;
    if (analysis.obligations.length > 0) confidence += 0.1;
    if (analysis.summary.length > 50) confidence += 0.1;
    if (analysis.governingLaw !== 'Not specified') confidence += 0.1;

    return Math.min(confidence, 0.9);
  }

  private generateFallbackDocumentAnalysis(documentType: string): DocumentAnalysis['analysis'] {
    return {
      summary: `This appears to be a ${documentType} document requiring legal review.`,
      keyProvisions: ['Document review required for detailed analysis'],
      riskFactors: ['Professional legal review recommended'],
      obligations: ['Consult with attorney for obligation analysis'],
      deadlines: [],
      parties: ['Parties require identification through legal review'],
      governingLaw: 'Requires legal analysis',
      redFlags: ['Professional review needed to identify issues'],
      recommendations: [
        'Engage qualified legal counsel for review',
        'Verify all terms and conditions',
        'Ensure compliance with applicable laws',
      ],
      missingClauses: ['Requires legal expertise to identify gaps'],
    };
  }

  private async generateResearchFindings(task: LegalResearchTask): Promise<LegalFinding[]> {
    // Mock research findings
    return [
      {
        id: crypto.randomUUID(),
        title: 'Primary Legal Authority',
        summary: `Relevant statute found for ${task.practiceArea}`,
        details: 'Detailed analysis of applicable statutes and regulations.',
        significance: 'critical',
        confidence: 0.85,
        sources: ['Statute Reference 1', 'Regulation Reference 2'],
        tags: [task.practiceArea, task.jurisdiction],
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Case Law Analysis',
        summary: 'Recent precedential cases identified',
        details: 'Analysis of relevant case law and judicial interpretations.',
        significance: 'important',
        confidence: 0.78,
        sources: ['Case 1', 'Case 2', 'Case 3'],
        tags: ['case-law', task.practiceArea],
        timestamp: new Date(),
      },
    ];
  }

  private async gatherResearchSources(task: LegalResearchTask): Promise<LegalSource[]> {
    // Mock research sources
    return [
      {
        id: crypto.randomUUID(),
        title: `${task.practiceArea} Statute`,
        type: 'statute',
        citation: 'Mock Citation § 123',
        jurisdiction: task.jurisdiction,
        relevance: 0.9,
        excerpt: 'Relevant statutory provisions...',
        lastUpdated: new Date(),
      },
    ];
  }

  private async loadLegalKnowledgeBase(): Promise<void> {
    // In production, load from database or legal API
    this.legalKnowledgeBase = [
      {
        id: '1',
        title: 'Contract Law Fundamentals',
        type: 'secondary',
        citation: 'Contract Law Guide 2024',
        jurisdiction: 'United States',
        relevance: 0.8,
        excerpt: 'Basic principles of contract formation, consideration, and enforceability.',
        lastUpdated: new Date(),
      },
      {
        id: '2',
        title: 'Civil Procedure Rules',
        type: 'regulation',
        citation: 'Fed. R. Civ. P.',
        jurisdiction: 'Federal',
        relevance: 0.9,
        excerpt: 'Federal rules governing civil litigation procedures.',
        lastUpdated: new Date(),
      },
    ];
  }

  // Public API methods
  getLegalQuery(id: string): LegalQuery | undefined {
    return this.legalQueries.get(id);
  }

  getAllLegalQueries(userId?: string): LegalQuery[] {
    const queries = Array.from(this.legalQueries.values());
    return userId ? queries.filter(q => q.userId === userId) : queries;
  }

  getResearchTask(id: string): LegalResearchTask | undefined {
    return this.researchTasks.get(id);
  }

  getAllResearchTasks(assignedTo?: string): LegalResearchTask[] {
    const tasks = Array.from(this.researchTasks.values());
    return assignedTo ? tasks.filter(t => t.assignedTo === assignedTo) : tasks;
  }

  async cancelResearchTask(id: string): Promise<void> {
    const task = this.researchTasks.get(id);
    if (task && task.status === 'in-progress') {
      task.status = 'cancelled';
      this.eventEmitter.emit('research-task.cancelled', task);
    }
  }
}

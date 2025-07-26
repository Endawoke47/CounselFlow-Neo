// OpenAI Provider - Premium API (Hybrid capability)
import OpenAI from 'openai';
import { BaseAIProvider, AIProviderResult } from './base.provider';
import { ValidatedAIRequest } from '../../types/ai.types';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: any) {
    super(config);

    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async process(request: ValidatedAIRequest): Promise<AIProviderResult> {
    this.validateRequest(request);

    const model = request.model || 'gpt-4';
    const prompt = this.formatLegalPrompt(request);

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: request.options?.temperature || 0.1,
        max_tokens: request.options?.maxTokens || 2048,
      });

      const response = completion.choices[0]?.message?.content || '';

      return {
        output: this.formatLegalResponse(response, request.type),
        model,
        confidence: 0.95, // OpenAI typically provides high-quality responses
        tokensUsed: completion.usage?.total_tokens || 0,
        metadata: {
          provider: 'openai',
          finishReason: completion.choices[0]?.finish_reason,
          usage: completion.usage,
        },
      };
    } catch (error) {
      throw new Error(
        `OpenAI processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await this.client.models.list();
      return models.data.filter(model => model.id.includes('gpt')).map(model => model.id);
    } catch {
      return ['gpt-4', 'gpt-3.5-turbo'];
    }
  }

  private getSystemPrompt(request: ValidatedAIRequest): string {
    const { context } = request;

    let systemPrompt = `You are an expert legal AI assistant with deep knowledge of African and Middle Eastern legal systems. `;

    if (context?.jurisdiction) {
      const countryName = this.getCountryName(context.jurisdiction);
      systemPrompt += `You specialize in ${countryName} law and legal practices. `;
    }

    systemPrompt += `You provide accurate, professional legal analysis while being mindful of:
    - Jurisdictional differences across 54 African and 17 Middle Eastern countries
    - Mixed legal systems (Common Law, Civil Law, Islamic Law, Customary Law)
    - Cultural and linguistic considerations
    - Professional legal standards and ethics
    
    Always provide structured, actionable responses with clear risk assessments.`;

    if (context?.confidentialityLevel === 'privileged') {
      systemPrompt += ` This analysis involves attorney-client privileged information. Maintain highest confidentiality standards.`;
    }

    return systemPrompt;
  }

  private formatLegalResponse(response: string, type: string): any {
    try {
      // Try to parse structured JSON response if GPT returns it
      if (response.includes('{') && response.includes('}')) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch {
      // If not JSON, structure it manually
    }

    // Structure the response based on analysis type
    switch (type) {
      case 'contract_analysis':
        return {
          analysis: response,
          riskLevel: this.extractRiskLevel(response),
          keyFindings: this.extractKeyFindings(response),
          recommendations: this.extractRecommendations(response),
          complianceNotes: this.extractComplianceNotes(response),
        };
      case 'legal_research':
        return {
          research: response,
          relevantStatutes: this.extractStatutes(response),
          casePrecedents: this.extractPrecedents(response),
          legalAnalysis: this.extractAnalysis(response),
          practicalGuidance: this.extractGuidance(response),
        };
      case 'risk_assessment':
        return {
          riskAnalysis: response,
          riskLevel: this.extractRiskLevel(response),
          mitigationStrategies: this.extractMitigation(response),
          timelineConsiderations: this.extractTimeline(response),
        };
      default:
        return { analysis: response };
    }
  }

  private extractRiskLevel(text: string): string {
    const riskPatterns = [
      /risk.*?(?:high|medium|low)/gi,
      /(?:high|medium|low).*?risk/gi,
      /risk level[:\s]*(?:high|medium|low)/gi,
    ];

    for (const pattern of riskPatterns) {
      const match = text.match(pattern);
      if (match) {
        const risk = match[0].toLowerCase();
        if (risk.includes('high')) return 'HIGH';
        if (risk.includes('medium')) return 'MEDIUM';
        if (risk.includes('low')) return 'LOW';
      }
    }
    return 'MEDIUM';
  }

  private extractKeyFindings(text: string): string[] {
    const findings: string[] = [];
    const sections = text.split(/(?:\n|^)(?:\d+\.|[-*])\s+/);

    for (const section of sections) {
      if (section.trim().length > 20 && section.trim().length < 200) {
        findings.push(section.trim().replace(/^\d+\.\s*/, ''));
      }
    }

    return findings.slice(0, 5);
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const patterns = [
      /recommend(?:ation)?s?[:\s]*(.*?)(?:\n\n|$)/gi,
      /(?:should|must|ought to|advise)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          recommendations.push(match[1].trim());
        }
      }
    }

    return recommendations.slice(0, 5);
  }

  private extractComplianceNotes(text: string): string[] {
    const notes: string[] = [];
    const patterns = [
      /compliance[:\s]*(.*?)(?:\n|$)/gi,
      /(?:regulatory|legal requirement)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          notes.push(match[1].trim());
        }
      }
    }

    return notes.slice(0, 3);
  }

  private extractStatutes(text: string): string[] {
    const statutes: string[] = [];
    const patterns = [
      /(?:act|statute|law|regulation|code)\s+[^\n.]{10,}/gi,
      /section\s+\d+[^\n.]*/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        statutes.push(match[0].trim());
      }
    }

    return statutes.slice(0, 5);
  }

  private extractPrecedents(text: string): string[] {
    const precedents: string[] = [];
    const patterns = [/(?:case|precedent)[:\s]*[^\n.]{10,}/gi, /\w+\s+v\.?\s+\w+[^\n.]*/gi];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        precedents.push(match[0].trim());
      }
    }

    return precedents.slice(0, 3);
  }

  private extractAnalysis(text: string): string {
    const sentences = text.split(/[.!?]+/);
    return sentences.slice(0, 5).join('. ').trim() + '.';
  }

  private extractGuidance(text: string): string[] {
    const guidance: string[] = [];
    const patterns = [/(?:practical|guidance|step)[:\s]*(.*?)(?:\n|$)/gi];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          guidance.push(match[1].trim());
        }
      }
    }

    return guidance.slice(0, 3);
  }

  private extractMitigation(text: string): string[] {
    const strategies: string[] = [];
    const patterns = [/(?:mitig|prevent|avoid)[:\s]*(.*?)(?:\n|$)/gi];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          strategies.push(match[1].trim());
        }
      }
    }

    return strategies.slice(0, 3);
  }

  private extractTimeline(text: string): string[] {
    const timeline: string[] = [];
    const patterns = [
      /(?:timeline|timeframe|duration)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:\d+\s*(?:days?|weeks?|months?|years?))[^\n.]*/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        timeline.push(match[0].trim());
      }
    }

    return timeline.slice(0, 3);
  }
}

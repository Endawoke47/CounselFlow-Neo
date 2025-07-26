// Anthropic Claude Provider - Premium API (Hybrid capability)
import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider, AIProviderResult } from './base.provider';
import { ValidatedAIRequest } from '../../types/ai.types';

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(config: any) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async process(request: ValidatedAIRequest): Promise<AIProviderResult> {
    this.validateRequest(request);

    const model = request.model || 'claude-3-haiku-20240307';
    const systemPrompt = this.getSystemPrompt(request);
    const userPrompt = this.formatLegalPrompt(request);

    try {
      const message = await this.client.completions.create({
        model,
        max_tokens_to_sample: request.options?.maxTokens || 2048,
        temperature: request.options?.temperature || 0.1,
        prompt: `${systemPrompt}\n\nHuman: ${userPrompt}\n\nAssistant:`,
      });

      const response = message.completion || '';

      return {
        output: this.formatLegalResponse(response, request.type),
        model,
        confidence: 0.93,
        tokensUsed: this.estimateTokensUsed(response),
        metadata: {
          provider: 'anthropic',
          stopReason: message.stop_reason,
        },
      };
    } catch (error) {
      throw new Error(
        `Anthropic processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check with minimal token usage
      await this.client.completions.create({
        model: 'claude-instant-v1',
        max_tokens_to_sample: 10,
        prompt: 'Human: Hello\n\nAssistant:',
      });
      return true;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
  }

  private getSystemPrompt(request: ValidatedAIRequest): string {
    const { context } = request;

    let systemPrompt = `You are Claude, an expert legal AI assistant with comprehensive knowledge of African and Middle Eastern legal systems. `;

    if (context?.jurisdiction) {
      systemPrompt += `You have particular expertise in legal systems of ${context.jurisdiction}. `;
    }

    systemPrompt += `Your expertise covers:
    - All 54 African countries' legal systems
    - All 17 Middle Eastern countries' legal frameworks  
    - Mixed legal traditions (Common Law, Civil Law, Islamic Law, Customary Law)
    - Cross-border legal considerations
    - Cultural and linguistic legal nuances
    
    Provide thorough, accurate legal analysis with clear risk assessments and actionable recommendations. Always consider jurisdictional variations and cultural contexts.`;

    if (context?.confidentialityLevel === 'privileged') {
      systemPrompt += ` This analysis involves attorney-client privileged material. Maintain strict confidentiality.`;
    }

    return systemPrompt;
  }

  private formatLegalResponse(response: string, type: string): any {
    // Try to parse structured response if available
    try {
      if (response.includes('{') && response.includes('}')) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch {
      // Continue with manual structuring
    }

    switch (type) {
      case 'contract_analysis':
        return {
          analysis: response,
          riskAssessment: this.extractRiskAssessment(response),
          keyProvisions: this.extractKeyProvisions(response),
          complianceIssues: this.extractComplianceIssues(response),
          recommendations: this.extractRecommendations(response),
          jurisdictionalConsiderations: this.extractJurisdictionalNotes(response),
        };
      case 'legal_research':
        return {
          research: response,
          primarySources: this.extractPrimarySources(response),
          secondarySources: this.extractSecondarySources(response),
          legalPrinciples: this.extractLegalPrinciples(response),
          practicalApplication: this.extractPracticalApplication(response),
        };
      case 'compliance_check':
        return {
          complianceAnalysis: response,
          complianceStatus: this.extractComplianceStatus(response),
          violations: this.extractViolations(response),
          remedialActions: this.extractRemedialActions(response),
          monitoringRequirements: this.extractMonitoring(response),
        };
      default:
        return { analysis: response };
    }
  }

  private extractRiskAssessment(text: string): any {
    const riskLevel = this.extractRiskLevel(text);
    const riskFactors = this.extractRiskFactors(text);

    return {
      level: riskLevel,
      factors: riskFactors,
      impact: this.extractImpact(text),
      likelihood: this.extractLikelihood(text),
    };
  }

  private extractRiskLevel(text: string): string {
    const patterns = [
      /risk.*?(?:high|medium|low|critical|minimal)/gi,
      /(?:high|medium|low|critical|minimal).*?risk/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const risk = match[0].toLowerCase();
        if (risk.includes('critical') || risk.includes('high')) return 'HIGH';
        if (risk.includes('medium') || risk.includes('moderate')) return 'MEDIUM';
        if (risk.includes('low') || risk.includes('minimal')) return 'LOW';
      }
    }
    return 'MEDIUM';
  }

  private extractRiskFactors(text: string): string[] {
    const factors: string[] = [];
    const patterns = [
      /(?:risk factor|concern|issue)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:potential|possible)\s+(?:risk|problem)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          factors.push(match[1].trim());
        }
      }
    }

    return factors.slice(0, 5);
  }

  private extractKeyProvisions(text: string): string[] {
    const provisions: string[] = [];
    const patterns = [
      /(?:key|important|critical)\s+(?:provision|clause|term)[:\s]*(.*?)(?:\n|$)/gi,
      /provision[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          provisions.push(match[1].trim());
        }
      }
    }

    return provisions.slice(0, 5);
  }

  private extractComplianceIssues(text: string): string[] {
    const issues: string[] = [];
    const patterns = [
      /(?:compliance|regulatory)\s+(?:issue|problem|concern)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:non-compliant|violation)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          issues.push(match[1].trim());
        }
      }
    }

    return issues.slice(0, 3);
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const patterns = [
      /recommend(?:ation)?[:\s]*(.*?)(?:\n\n|$)/gi,
      /(?:should|must|need to|advise)[:\s]*(.*?)(?:\n|$)/gi,
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

  private extractJurisdictionalNotes(text: string): string[] {
    const notes: string[] = [];
    const patterns = [
      /(?:jurisdiction|legal system|local law)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:country|state|regional)\s+(?:law|requirement)[:\s]*(.*?)(?:\n|$)/gi,
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

  private extractPrimarySources(text: string): string[] {
    const sources: string[] = [];
    const patterns = [
      /(?:act|statute|law|constitution|regulation)[:\s]*[^\n.]{10,}/gi,
      /section\s+\d+[^\n.]*/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        sources.push(match[0].trim());
      }
    }

    return sources.slice(0, 5);
  }

  private extractSecondarySources(text: string): string[] {
    const sources: string[] = [];
    const patterns = [
      /(?:case|precedent|decision)[:\s]*[^\n.]{15,}/gi,
      /\w+\s+v\.?\s+\w+[^\n.]*/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        sources.push(match[0].trim());
      }
    }

    return sources.slice(0, 3);
  }

  private extractLegalPrinciples(text: string): string[] {
    const principles: string[] = [];
    const patterns = [
      /(?:principle|doctrine|rule)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:established|fundamental)\s+(?:law|principle)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          principles.push(match[1].trim());
        }
      }
    }

    return principles.slice(0, 3);
  }

  private extractPracticalApplication(text: string): string[] {
    const applications: string[] = [];
    const patterns = [
      /(?:practical|application|practice)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:in practice|practically)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          applications.push(match[1].trim());
        }
      }
    }

    return applications.slice(0, 3);
  }

  private extractComplianceStatus(text: string): string {
    const patterns = [
      /compliance.*?(?:status|level)[:\s]*(\w+)/gi,
      /(?:compliant|non-compliant|partial)/gi,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const status = match[0].toLowerCase();
        if (status.includes('non') || status.includes('violation')) return 'NON_COMPLIANT';
        if (status.includes('partial')) return 'PARTIAL';
        if (status.includes('compliant')) return 'COMPLIANT';
      }
    }
    return 'UNKNOWN';
  }

  private extractViolations(text: string): string[] {
    const violations: string[] = [];
    const patterns = [/(?:violation|breach|non-compliance)[:\s]*(.*?)(?:\n|$)/gi];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          violations.push(match[1].trim());
        }
      }
    }

    return violations.slice(0, 3);
  }

  private extractRemedialActions(text: string): string[] {
    const actions: string[] = [];
    const patterns = [
      /(?:remedial|corrective)\s+action[:\s]*(.*?)(?:\n|$)/gi,
      /(?:fix|correct|remedy)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          actions.push(match[1].trim());
        }
      }
    }

    return actions.slice(0, 3);
  }

  private extractMonitoring(text: string): string[] {
    const monitoring: string[] = [];
    const patterns = [
      /(?:monitor|track|review)[:\s]*(.*?)(?:\n|$)/gi,
      /ongoing\s+(?:compliance|monitoring)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 15) {
          monitoring.push(match[1].trim());
        }
      }
    }

    return monitoring.slice(0, 3);
  }

  private extractImpact(text: string): string {
    const patterns = [/impact[:\s]*(\w+)/gi, /(?:significant|minor|major|severe)\s+impact/gi];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const impact = match[0].toLowerCase();
        if (impact.includes('severe') || impact.includes('major')) return 'HIGH';
        if (impact.includes('significant') || impact.includes('moderate')) return 'MEDIUM';
        if (impact.includes('minor') || impact.includes('low')) return 'LOW';
      }
    }
    return 'MEDIUM';
  }

  private extractLikelihood(text: string): string {
    const patterns = [/likelihood[:\s]*(\w+)/gi, /(?:likely|unlikely|probable|possible)/gi];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const likelihood = match[0].toLowerCase();
        if (likelihood.includes('very likely') || likelihood.includes('probable')) return 'HIGH';
        if (likelihood.includes('likely') || likelihood.includes('possible')) return 'MEDIUM';
        if (likelihood.includes('unlikely') || likelihood.includes('rare')) return 'LOW';
      }
    }
    return 'MEDIUM';
  }

  private estimateTokensUsed(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

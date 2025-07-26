// Ollama Provider - Self-hosted local models (Primary)
import { BaseAIProvider, AIProviderResult } from './base.provider';
import { ValidatedAIRequest } from '../../types/ai.types';

export class OllamaProvider extends BaseAIProvider {
  private baseURL: string;

  constructor(config: any) {
    super(config);
    this.baseURL = config.baseURL || 'http://localhost:11434';
  }

  async process(request: ValidatedAIRequest): Promise<AIProviderResult> {
    this.validateRequest(request);

    const model = request.model || 'llama3.2:latest';
    const prompt = this.formatLegalPrompt(request);

    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: request.options?.temperature || 0.1,
            top_p: 0.9,
            num_predict: request.options?.maxTokens || 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        output: this.formatLegalResponse(data.response, request.type),
        model,
        confidence: 0.85, // Ollama doesn't provide confidence scores
        tokensUsed: this.estimateTokens(data.response),
        metadata: {
          provider: 'ollama',
          totalDuration: data.total_duration,
          loadDuration: data.load_duration,
          evalCount: data.eval_count,
        },
      };
    } catch (error) {
      throw new Error(
        `Ollama processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  }

  private formatLegalResponse(response: string, type: string): any {
    // Structure the response based on analysis type
    switch (type) {
      case 'contract_analysis':
        return {
          analysis: response,
          riskLevel: this.extractRiskLevel(response),
          keyFindings: this.extractKeyFindings(response),
          recommendations: this.extractRecommendations(response),
        };
      case 'legal_research':
        return {
          research: response,
          relevantLaws: this.extractLaws(response),
          precedents: this.extractPrecedents(response),
          summary: this.extractSummary(response),
        };
      default:
        return { analysis: response };
    }
  }

  private extractRiskLevel(text: string): string {
    const riskPatterns = [/risk.*?(?:high|medium|low)/gi, /(?:high|medium|low).*?risk/gi];

    for (const pattern of riskPatterns) {
      const match = text.match(pattern);
      if (match) {
        const risk = match[0].toLowerCase();
        if (risk.includes('high')) return 'HIGH';
        if (risk.includes('medium')) return 'MEDIUM';
        if (risk.includes('low')) return 'LOW';
      }
    }
    return 'MEDIUM'; // default
  }

  private extractKeyFindings(text: string): string[] {
    const findings: string[] = [];
    const patterns = [
      /(?:key findings?|important|critical|significant)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:\d+\.)\s*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          findings.push(match[1].trim());
        }
      }
    }

    return findings.slice(0, 5); // Top 5 findings
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const patterns = [
      /(?:recommend|suggest|advise)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:should|must|need to)[:\s]*(.*?)(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          recommendations.push(match[1].trim());
        }
      }
    }

    return recommendations.slice(0, 5);
  }

  private extractLaws(text: string): string[] {
    const laws: string[] = [];
    const patterns = [
      /(?:act|law|statute|regulation|code)[:\s]*(.*?)(?:\n|$)/gi,
      /(?:section|article)\s+\d+.*?(?:\n|$)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && match[0].trim().length > 5) {
          laws.push(match[0].trim());
        }
      }
    }

    return laws.slice(0, 10);
  }

  private extractPrecedents(text: string): string[] {
    const precedents: string[] = [];
    const patterns = [
      /(?:case|precedent|decision)[:\s]*(.*?)(?:\n|$)/gi,
      /v\.\s+.*?(?:\n|$)/gi, // Case citations with "v."
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && match[0].trim().length > 10) {
          precedents.push(match[0].trim());
        }
      }
    }

    return precedents.slice(0, 5);
  }

  private extractSummary(text: string): string {
    const sentences = text.split(/[.!?]+/);
    return sentences.slice(0, 3).join('. ').trim() + '.';
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

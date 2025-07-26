// Google Gemini Provider - Premium API (Hybrid capability)
import { BaseAIProvider, AIProviderResult } from './base.provider';
import { ValidatedAIRequest } from '../../types/ai.types';

export class GoogleProvider extends BaseAIProvider {
  private apiKey: string;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1/models';

  constructor(config: any) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Google API key is required');
    }

    this.apiKey = config.apiKey;
  }

  async process(request: ValidatedAIRequest): Promise<AIProviderResult> {
    this.validateRequest(request);

    const model = request.model || 'gemini-pro';
    const prompt = this.formatLegalPrompt(request);

    try {
      const response = await fetch(`${this.baseURL}/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: request.options?.temperature || 0.1,
            maxOutputTokens: request.options?.maxTokens || 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        output: this.formatLegalResponse(generatedText, request.type),
        model,
        confidence: 0.91,
        tokensUsed: this.estimateTokens(generatedText),
        metadata: {
          provider: 'google',
          finishReason: data.candidates?.[0]?.finishReason,
          safetyRatings: data.candidates?.[0]?.safetyRatings,
        },
      };
    } catch (error) {
      throw new Error(
        `Google processing failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`);
      if (!response.ok) return ['gemini-pro'];

      const data = await response.json();
      return data.models?.map((model: any) => model.name.split('/').pop()) || ['gemini-pro'];
    } catch {
      return ['gemini-pro', 'gemini-1.5-flash'];
    }
  }

  private formatLegalResponse(response: string, type: string): any {
    switch (type) {
      case 'contract_analysis':
        return {
          analysis: response,
          riskLevel: this.extractRiskLevel(response),
          keyIssues: this.extractKeyIssues(response),
          recommendations: this.extractRecommendations(response),
        };
      case 'legal_research':
        return {
          research: response,
          sources: this.extractSources(response),
          summary: this.extractSummary(response),
        };
      default:
        return { analysis: response };
    }
  }

  private extractRiskLevel(text: string): string {
    const patterns = [/risk.*?(?:high|medium|low)/gi];
    for (const pattern of patterns) {
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

  private extractKeyIssues(text: string): string[] {
    const issues: string[] = [];
    const patterns = [/(?:issue|problem|concern)[:\s]*(.*?)(?:\n|$)/gi];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          issues.push(match[1].trim());
        }
      }
    }
    return issues.slice(0, 5);
  }

  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const patterns = [/recommend[:\s]*(.*?)(?:\n|$)/gi];

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

  private extractSources(text: string): string[] {
    const sources: string[] = [];
    const patterns = [/(?:source|reference)[:\s]*(.*?)(?:\n|$)/gi];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          sources.push(match[1].trim());
        }
      }
    }
    return sources.slice(0, 3);
  }

  private extractSummary(text: string): string {
    const sentences = text.split(/[.!?]+/);
    return sentences.slice(0, 3).join('. ').trim() + '.';
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

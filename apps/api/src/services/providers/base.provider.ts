// Base AI Provider Interface
import { ValidatedAIRequest, ProviderConfig } from '../../types/ai.types';

export interface AIProviderResult {
  output: any;
  model: string;
  confidence: number;
  tokensUsed: number;
  metadata?: Record<string, any>;
}

export abstract class BaseAIProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract process(request: ValidatedAIRequest): Promise<AIProviderResult>;
  abstract healthCheck(): Promise<boolean>;
  abstract getAvailableModels(): Promise<string[]>;

  protected validateRequest(request: ValidatedAIRequest): void {
    if (!request.input) {
      throw new Error('Input is required');
    }
    if (!request.type) {
      throw new Error('Analysis type is required');
    }
  }

  protected formatLegalPrompt(request: ValidatedAIRequest): string {
    const { context, input, type } = request;

    let prompt = `You are a legal AI assistant specializing in `;

    if (context?.jurisdiction) {
      const countryName = this.getCountryName(context.jurisdiction);
      prompt += `${countryName} law and legal systems. `;
    } else {
      prompt += `African and Middle Eastern legal systems. `;
    }

    if (context?.language && context.language !== 'en') {
      prompt += `Please respond in ${this.getLanguageName(context.language)}. `;
    }

    switch (type) {
      case 'contract_analysis':
        prompt += `\n\nAnalyze the following contract and provide:\n1. Risk assessment\n2. Key terms analysis\n3. Compliance considerations\n4. Recommendations\n\nContract:\n${JSON.stringify(input)}`;
        break;
      case 'legal_research':
        prompt += `\n\nConduct legal research on: ${JSON.stringify(input)}\n\nProvide:\n1. Relevant statutes\n2. Case law precedents\n3. Legal analysis\n4. Practical recommendations`;
        break;
      case 'compliance_check':
        prompt += `\n\nReview for compliance with applicable laws:\n${JSON.stringify(input)}\n\nProvide:\n1. Compliance status\n2. Identified issues\n3. Required actions\n4. Risk level`;
        break;
      default:
        prompt += `\n\nAnalyze the following legal matter:\n${JSON.stringify(input)}`;
    }

    return prompt;
  }

  protected getCountryName(jurisdiction: string): string {
    const countryMap: Record<string, string> = {
      NG: 'Nigerian',
      ZA: 'South African',
      EG: 'Egyptian',
      KE: 'Kenyan',
      MA: 'Moroccan',
      ET: 'Ethiopian',
      GH: 'Ghanaian',
      TN: 'Tunisian',
      AE: 'UAE',
      SA: 'Saudi Arabian',
      IL: 'Israeli',
      TR: 'Turkish',
      // Add more as needed
    };
    return countryMap[jurisdiction] || jurisdiction;
  }

  private getLanguageName(language: string): string {
    const languageMap: Record<string, string> = {
      ar: 'Arabic',
      fr: 'French',
      pt: 'Portuguese',
      sw: 'Swahili',
      am: 'Amharic',
      he: 'Hebrew',
      fa: 'Persian',
      tr: 'Turkish',
      de: 'German',
    };
    return languageMap[language] || 'English';
  }
}

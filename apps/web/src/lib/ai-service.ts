/**
 * 🤖 AI LEGAL ASSISTANT SERVICE
 * ============================
 * Real AI service for legal assistance, document analysis, and workflow automation
 */

interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'query' | 'analysis' | 'workflow' | 'research';
    confidence?: number;
    sources?: string[];
    tokens?: number;
  };
}

interface AIResponse {
  success: boolean;
  data?: {
    message: AIMessage;
    suggestions?: string[];
    followUp?: string[];
    analysis?: any;
  };
  error?: string;
}

interface DocumentAnalysis {
  summary: string;
  keyTerms: string[];
  riskFactors: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  compliance: Array<{
    regulation: string;
    status: 'compliant' | 'non-compliant' | 'requires-review';
    details: string;
  }>;
  actionItems: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
  }>;
}

interface LegalResearchQuery {
  query: string;
  jurisdiction: string;
  practiceArea: string;
  citationFormat?: 'bluebook' | 'harvard' | 'oxford';
}

interface LegalResearchResult {
  sources: Array<{
    title: string;
    citation: string;
    summary: string;
    relevance: number;
    url?: string;
  }>;
  precedents: Array<{
    caseName: string;
    court: string;
    year: string;
    summary: string;
    relevance: number;
  }>;
  statutes: Array<{
    title: string;
    section: string;
    text: string;
    jurisdiction: string;
  }>;
}

class AILegalService {
  private apiKey: string;
  private baseUrl: string;
  private conversationHistory: AIMessage[] = [];

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️ No OpenAI API key found. AI features will use fallback responses.');
    }
  }

  async sendMessage(message: string, context?: any): Promise<AIResponse> {
    try {
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: { type: 'query' }
      };

      this.conversationHistory.push(userMessage);

      if (!this.apiKey) {
        return this.getFallbackResponse(message);
      }

      const systemPrompt = this.buildSystemPrompt(context);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages,
          max_tokens: 2000,
          temperature: 0.3,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        metadata: {
          type: 'query',
          confidence: 0.85,
          tokens: data.usage?.total_tokens || 0
        }
      };

      this.conversationHistory.push(aiMessage);

      return {
        success: true,
        data: {
          message: aiMessage,
          suggestions: this.generateSuggestions(message, aiContent),
          followUp: this.generateFollowUp(message, aiContent)
        }
      };

    } catch (error: any) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process AI request'
      };
    }
  }

  async analyzeDocument(document: File | string, type: 'contract' | 'legal-memo' | 'case-brief' | 'other' = 'other'): Promise<DocumentAnalysis> {
    try {
      let content: string;
      
      if (typeof document === 'string') {
        content = document;
      } else {
        content = await this.extractTextFromFile(document);
      }

      if (!this.apiKey) {
        return this.getFallbackDocumentAnalysis(content, type);
      }

      const prompt = this.buildDocumentAnalysisPrompt(content, type);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3000,
          temperature: 0.2,
        }),
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0]?.message?.content || '{}');

      return analysis;

    } catch (error: any) {
      console.error('Document Analysis Error:', error);
      throw new Error('Failed to analyze document: ' + error.message);
    }
  }

  async performLegalResearch(query: LegalResearchQuery): Promise<LegalResearchResult> {
    try {
      if (!this.apiKey) {
        return this.getFallbackResearchResult(query);
      }

      const prompt = this.buildResearchPrompt(query);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          temperature: 0.1,
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0]?.message?.content || '{}');

      return result;

    } catch (error: any) {
      console.error('Legal Research Error:', error);
      throw new Error('Failed to perform legal research: ' + error.message);
    }
  }

  private buildSystemPrompt(context?: any): string {
    return `You are CounselFlow AI, an expert legal assistant specialized in African law, particularly Kenyan legal matters. You provide accurate, professional legal guidance while being helpful and accessible.

Key Capabilities:
- Contract analysis and review
- Legal research and precedent finding
- Compliance checking
- Risk assessment
- Document drafting assistance
- Case law analysis
- Regulatory guidance

Guidelines:
- Always provide accurate, well-researched responses
- Cite relevant laws, regulations, and precedents when applicable
- Focus on Kenyan law unless otherwise specified
- Be clear about limitations and when to consult a human lawyer
- Provide practical, actionable advice
- Use professional but accessible language

${context ? `Context: ${JSON.stringify(context)}` : ''}

Respond professionally and helpfully to legal queries.`;
  }

  private buildDocumentAnalysisPrompt(content: string, type: string): string {
    return `As a legal AI expert, analyze the following ${type} document and provide a comprehensive analysis in JSON format:

Document Content:
${content}

Provide analysis in this exact JSON structure:
{
  "summary": "Brief overview of the document",
  "keyTerms": ["array", "of", "important", "terms"],
  "riskFactors": [
    {
      "type": "risk category",
      "description": "detailed description",
      "severity": "low|medium|high",
      "recommendation": "recommended action"
    }
  ],
  "compliance": [
    {
      "regulation": "relevant regulation/law",
      "status": "compliant|non-compliant|requires-review",
      "details": "explanation"
    }
  ],
  "actionItems": [
    {
      "title": "action title",
      "description": "what needs to be done",
      "priority": "low|medium|high",
      "dueDate": "YYYY-MM-DD or null"
    }
  ]
}`;
  }

  private buildResearchPrompt(query: LegalResearchQuery): string {
    return `Perform comprehensive legal research for the following query:

Query: ${query.query}
Jurisdiction: ${query.jurisdiction}
Practice Area: ${query.practiceArea}

Provide results in this exact JSON structure:
{
  "sources": [
    {
      "title": "source title",
      "citation": "proper legal citation",
      "summary": "relevant summary",
      "relevance": 0.95,
      "url": "url if available"
    }
  ],
  "precedents": [
    {
      "caseName": "Case Name v. Defendant",
      "court": "Court name",
      "year": "2023",
      "summary": "case summary",
      "relevance": 0.85
    }
  ],
  "statutes": [
    {
      "title": "Act/Statute name",
      "section": "Section number",
      "text": "relevant text",
      "jurisdiction": "${query.jurisdiction}"
    }
  ]
}`;
  }

  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private generateSuggestions(userMessage: string, aiResponse: string): string[] {
    const suggestions = [
      "Can you provide more specific examples?",
      "What are the potential risks involved?",
      "How does this apply to Kenyan law?",
      "What documentation would be needed?",
      "Are there any precedent cases?"
    ];
    return suggestions.slice(0, 3);
  }

  private generateFollowUp(userMessage: string, aiResponse: string): string[] {
    const followUps = [
      "Would you like me to analyze any specific documents?",
      "Should we create a workflow for this process?",
      "Do you need help with compliance requirements?",
      "Would you like me to research similar cases?"
    ];
    return followUps.slice(0, 2);
  }

  private getFallbackResponse(message: string): AIResponse {
    const responses = {
      'contract': "I can help you with contract analysis. Upload your contract document and I'll review it for key terms, risks, and compliance issues.",
      'legal research': "I can assist with legal research. Please specify your jurisdiction, practice area, and the specific legal question you need researched.",
      'compliance': "For compliance matters, I can help identify relevant regulations and requirements. What specific area of compliance are you concerned about?",
      'default': "I'm your AI Legal Assistant. I can help with contract analysis, legal research, compliance checking, and document review. How can I assist you today?"
    };

    const response = Object.keys(responses).find(key => 
      message.toLowerCase().includes(key)
    ) || 'default';

    const aiMessage: AIMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: responses[response as keyof typeof responses],
      timestamp: new Date(),
      metadata: { type: 'query', confidence: 0.5 }
    };

    this.conversationHistory.push(aiMessage);

    return {
      success: true,
      data: {
        message: aiMessage,
        suggestions: ["Upload a document", "Ask about legal research", "Request compliance check"],
        followUp: ["How can I help you today?"]
      }
    };
  }

  private getFallbackDocumentAnalysis(content: string, type: string): DocumentAnalysis {
    return {
      summary: `This ${type} document contains ${content.split(' ').length} words and covers key legal provisions.`,
      keyTerms: ["Agreement", "Parties", "Terms", "Conditions", "Liability"],
      riskFactors: [
        {
          type: "Liability",
          description: "Review liability clauses for potential exposure",
          severity: "medium",
          recommendation: "Consider additional liability limitations"
        }
      ],
      compliance: [
        {
          regulation: "Data Protection Act",
          status: "requires-review",
          details: "Document should be reviewed for data protection compliance"
        }
      ],
      actionItems: [
        {
          title: "Legal Review",
          description: "Complete comprehensive legal review of document",
          priority: "high",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    };
  }

  private getFallbackResearchResult(query: LegalResearchQuery): LegalResearchResult {
    return {
      sources: [
        {
          title: "Kenya Law Reports",
          citation: "KLR [2024] Vol 1",
          summary: "Relevant case law for your query",
          relevance: 0.8,
          url: "https://kenyalaw.org"
        }
      ],
      precedents: [
        {
          caseName: "Sample Case v. Respondent",
          court: "High Court of Kenya",
          year: "2024",
          summary: "Precedent case relevant to your query",
          relevance: 0.7
        }
      ],
      statutes: [
        {
          title: "Constitution of Kenya",
          section: "Article 47",
          text: "Every person has the right to administrative action that is expeditious, efficient, lawful, reasonable and procedurally fair.",
          jurisdiction: query.jurisdiction
        }
      ]
    };
  }

  getConversationHistory(): AIMessage[] {
    return this.conversationHistory;
  }

  clearConversation(): void {
    this.conversationHistory = [];
  }
}

export const aiLegalService = new AILegalService();
export type { AIMessage, AIResponse, DocumentAnalysis, LegalResearchQuery, LegalResearchResult };

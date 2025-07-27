export interface CreateLegalQueryDto {
  query: string;
  category?: string;
  context?: {
    jurisdiction?: string;
    practiceArea?: string;
    caseId?: string;
    clientId?: string;
    urgency?: 'low' | 'medium' | 'high' | 'urgent';
  };
}

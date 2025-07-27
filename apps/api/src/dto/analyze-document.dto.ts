export interface AnalyzeDocumentDto {
  documentId?: string;
  documentType?: 'contract' | 'agreement' | 'legal-brief' | 'regulation' | 'case-law';
  content?: string;
  analysisType?: 'risk-assessment' | 'clause-extraction' | 'compliance-validation' | 'precedent-analysis';
}

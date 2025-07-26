/**
 * AI Contract Analysis Hook
 * Provides comprehensive contract analysis capabilities
 */

import { useState, useCallback } from 'react';
import { ContractRiskAnalysis, ContractClauseExtraction, ContractComparison, ContractSummary } from '../types/ai';
import { realApiClient } from '../lib/real-api-client';

interface UseAIContractAnalysisReturn {
  isAnalyzing: boolean;
  error: string | null;
  riskAnalysis: ContractRiskAnalysis | null;
  clauseExtraction: ContractClauseExtraction | null;
  comparison: ContractComparison | null;
  summary: ContractSummary | null;
  analyzeRisk: (contractText: string, contractType?: string) => Promise<void>;
  extractClauses: (contractText: string) => Promise<void>;
  compareContracts: (contract1: string, contract2: string, focusAreas?: string[]) => Promise<void>;
  generateSummary: (contractText: string) => Promise<void>;
  clearResults: () => void;
}

export const useAIContractAnalysis = (): UseAIContractAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<ContractRiskAnalysis | null>(null);
  const [clauseExtraction, setClauseExtraction] = useState<ContractClauseExtraction | null>(null);
  const [comparison, setComparison] = useState<ContractComparison | null>(null);
  const [summary, setSummary] = useState<ContractSummary | null>(null);

  const analyzeRisk = useCallback(async (contractText: string, contractType = 'general') => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await realApiClient.analyzeContractRisk(contractText, contractType);

      if (response.success && response.data) {
        setRiskAnalysis(response.data.analysis);
      } else {
        throw new Error(response.message || 'Failed to analyze contract risk');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze contract risk');
      console.error('Risk analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const extractClauses = useCallback(async (contractText: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await realApiClient.extractContractClauses(contractText);

      if (response.success && response.data) {
        setClauseExtraction(response.data.extraction);
      } else {
        throw new Error(response.message || 'Failed to extract contract clauses');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract contract clauses');
      console.error('Clause extraction error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const compareContracts = useCallback(async (
    contract1: string, 
    contract2: string, 
    focusAreas?: string[]
  ) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await realApiClient.compareContracts(contract1, contract2, focusAreas);

      if (response.success && response.data) {
        setComparison(response.data.comparison);
      } else {
        throw new Error(response.message || 'Failed to compare contracts');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to compare contracts');
      console.error('Contract comparison error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateSummary = useCallback(async (contractText: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await realApiClient.generateContractSummary(contractText);

      if (response.success && response.data) {
        setSummary(response.data.summary);
      } else {
        throw new Error(response.message || 'Failed to generate contract summary');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate contract summary');
      console.error('Contract summary error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setRiskAnalysis(null);
    setClauseExtraction(null);
    setComparison(null);
    setSummary(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    error,
    riskAnalysis,
    clauseExtraction,
    comparison,
    summary,
    analyzeRisk,
    extractClauses,
    compareContracts,
    generateSummary,
    clearResults
  };
};

/**
 * Simple AI Contract Analysis Component
 * Core AI-powered contract analysis without external UI dependencies
 */

import React, { useState } from 'react';
import { Brain, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAIContractAnalysis } from '../hooks/useAIContractAnalysis';

interface SimpleAIContractAnalysisProps {
  contractText?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export const SimpleAIContractAnalysis: React.FC<SimpleAIContractAnalysisProps> = ({
  contractText: initialContractText = '',
  onAnalysisComplete
}) => {
  const [contractText, setContractText] = useState(initialContractText);
  const [activeTab, setActiveTab] = useState('risk');

  const {
    isAnalyzing,
    error,
    riskAnalysis,
    clauseExtraction,
    summary,
    analyzeRisk,
    extractClauses,
    generateSummary,
    clearResults
  } = useAIContractAnalysis();

  const handleAnalyzeRisk = async () => {
    if (!contractText.trim()) return;
    await analyzeRisk(contractText);
    onAnalysisComplete?.(riskAnalysis);
  };

  const handleExtractClauses = async () => {
    if (!contractText.trim()) return;
    await extractClauses(contractText);
    onAnalysisComplete?.(clauseExtraction);
  };

  const handleGenerateSummary = async () => {
    if (!contractText.trim()) return;
    await generateSummary(contractText);
    onAnalysisComplete?.(summary);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Contract Analysis</h1>
            <p className="text-gray-600">AI-powered contract intelligence and risk assessment</p>
          </div>
        </div>
        <button
          onClick={clearResults}
          disabled={isAnalyzing}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Clear Results
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">Analysis Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Contract Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Contract Text Input</span>
        </h2>
        <textarea
          value={contractText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContractText(e.target.value)}
          placeholder="Paste your contract text here for AI analysis..."
          className="w-full min-h-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isAnalyzing}
        />
      </div>

      {/* Analysis Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'risk'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Risk Analysis
          </button>
          <button
            onClick={() => setActiveTab('clauses')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'clauses'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Clause Extraction
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary
          </button>
        </div>

        <div className="p-6">
          {/* Risk Analysis Tab */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Contract Risk Analysis</span>
                </h3>
                <button
                  onClick={handleAnalyzeRisk}
                  disabled={isAnalyzing || !contractText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                >
                  {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  <span>Analyze Risk</span>
                </button>
              </div>

              {riskAnalysis ? (
                <div className="space-y-6">
                  {/* Overall Risk Score */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className={`text-2xl font-bold ${getRiskColor(riskAnalysis.riskLevel)}`}>
                        {riskAnalysis.overallRiskScore}/100
                      </div>
                      <p className="text-sm text-gray-600">Overall Risk Score</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(riskAnalysis.riskLevel)}`}>
                        {riskAnalysis.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {riskAnalysis.totalRisks}
                      </div>
                      <p className="text-sm text-gray-600">Total Risks Found</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {riskAnalysis.complianceIssues.length}
                      </div>
                      <p className="text-sm text-gray-600">Compliance Issues</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {riskAnalysis.recommendations.length}
                      </div>
                      <p className="text-sm text-gray-600">Recommendations</p>
                    </div>
                  </div>

                  {/* Executive Overview */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Executive Overview</h4>
                    <p className="text-gray-700">{riskAnalysis.executiveOverview}</p>
                  </div>

                  {/* Risk Assessments */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Risk Assessments</h4>
                    <div className="space-y-4">
                      {riskAnalysis.riskAssessments.map((risk: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-900">{risk.category}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(risk.severity)}`}>
                              {risk.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{risk.description}</p>
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Impact:</strong> {risk.impact}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Recommendation:</strong> {risk.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No risk analysis available. Please analyze a contract first.</p>
                </div>
              )}
            </div>
          )}

          {/* Clause Extraction Tab */}
          {activeTab === 'clauses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Contract Clause Extraction</h3>
                <button
                  onClick={handleExtractClauses}
                  disabled={isAnalyzing || !contractText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
                >
                  {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  <span>Extract Clauses</span>
                </button>
              </div>

              {clauseExtraction ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {clauseExtraction.totalClauses}
                      </div>
                      <p className="text-sm text-gray-600">Total Clauses</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {clauseExtraction.problematicClauses.length}
                      </div>
                      <p className="text-sm text-gray-600">Problematic Clauses</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {clauseExtraction.missingStandardClauses.length}
                      </div>
                      <p className="text-sm text-gray-600">Missing Standard Clauses</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {clauseExtraction.clauses.map((clause: any) => (
                      <div key={clause.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{clause.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            clause.type === 'problematic' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {clause.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{clause.content}</p>
                        <div className="text-sm text-gray-600">
                          <strong>Analysis:</strong> {clause.analysis.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No clause extraction available. Please extract clauses first.</p>
                </div>
              )}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Contract Summary</h3>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isAnalyzing || !contractText.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center space-x-2"
                >
                  {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  <span>Generate Summary</span>
                </button>
              </div>

              {summary ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
                    <p className="text-gray-700">{summary.executiveSummary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Contract Type</label>
                      <p className="text-gray-900">{summary.contractType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Jurisdiction</label>
                      <p className="text-gray-900">{summary.jurisdiction}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Key Terms</h4>
                    <div className="space-y-4">
                      {summary.keyTerms.map((term: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-900">{term.title}</h5>
                          <p className="text-gray-700 mb-2">{term.content}</p>
                          <div className="text-sm text-gray-600">
                            <strong>Business Impact:</strong> {term.businessImpact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No contract summary available. Please generate a summary first.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600">Analyzing contract with AI...</p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-1/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

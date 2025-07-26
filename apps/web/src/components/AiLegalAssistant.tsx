'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { 
  Send, 
  Upload, 
  FileText, 
  Search, 
  Play, 
  Pause, 
  Square, 
  Download,
  Brain,
  MessageSquare,
  Workflow,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Bot
} from 'lucide-react';
import { aiLegalService, type AIMessage, type DocumentAnalysis, type LegalResearchQuery } from '@/lib/ai-service';
import { workflowEngine, type WorkflowExecution, type WorkflowTemplate } from '@/lib/workflow-engine';

export function AiLegalAssistant() {
  // Tab state
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat state
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Document analysis state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // Legal research state
  const [researchQuery, setResearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Kenya');
  const [practiceArea, setPracticeArea] = useState('Contract Law');
  const [researchResults, setResearchResults] = useState<any>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  
  // Workflow state
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load initial data
    loadWorkflows();
    loadExecutions();
    
    // Load conversation history
    const history = aiLegalService.getConversationHistory();
    setMessages(history);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadWorkflows = () => {
    const templates = workflowEngine.getAllTemplates();
    setWorkflows(templates);
  };

  const loadExecutions = () => {
    const allExecutions = workflowEngine.getAllExecutions();
    setExecutions(allExecutions.slice(-10)); // Show last 10 executions
  };

  // Chat functionality
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setChatError(null);

    try {
      const response = await aiLegalService.sendMessage(userMessage, {
        currentContext: 'legal-assistant',
        documentAnalysis,
        researchResults
      });

      if (response.success && response.data) {
        setMessages(aiLegalService.getConversationHistory());
      } else {
        setChatError(response.error || 'Failed to send message');
      }
    } catch (error: any) {
      setChatError(error.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Document analysis functionality
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocumentAnalysis(null);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!selectedFile) return;

    setAnalysisLoading(true);
    try {
      const analysis = await aiLegalService.analyzeDocument(selectedFile, 'contract');
      setDocumentAnalysis(analysis);
      
      // Add analysis to chat
      const analysisMessage = `📄 Document Analysis Complete for "${selectedFile.name}":\n\n` +
        `**Summary:** ${analysis.summary}\n\n` +
        `**Key Terms:** ${analysis.keyTerms.join(', ')}\n\n` +
        `**Risk Factors:** ${analysis.riskFactors.length} identified\n` +
        `**Action Items:** ${analysis.actionItems.length} pending`;
      
      await aiLegalService.sendMessage(analysisMessage, { type: 'document-analysis', analysis });
      setMessages(aiLegalService.getConversationHistory());
      
    } catch (error: any) {
      setChatError(`Document analysis failed: ${error.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Legal research functionality
  const handleLegalResearch = async () => {
    if (!researchQuery.trim()) return;

    setResearchLoading(true);
    try {
      const query: LegalResearchQuery = {
        query: researchQuery,
        jurisdiction,
        practiceArea
      };
      
      const results = await aiLegalService.performLegalResearch(query);
      setResearchResults(results);
      
      // Add research to chat
      const researchMessage = `🔍 Legal Research Complete for "${researchQuery}":\n\n` +
        `**Sources Found:** ${results.sources.length}\n` +
        `**Precedents:** ${results.precedents.length}\n` +
        `**Statutes:** ${results.statutes.length}`;
      
      await aiLegalService.sendMessage(researchMessage, { type: 'legal-research', results });
      setMessages(aiLegalService.getConversationHistory());
      
    } catch (error: any) {
      setChatError(`Legal research failed: ${error.message}`);
    } finally {
      setResearchLoading(false);
    }
  };

  // Workflow functionality
  const handleExecuteWorkflow = async (workflowId: string, triggerData: any = {}) => {
    try {
      const executionId = await workflowEngine.executeWorkflow(workflowId, triggerData);
      
      // Add execution to chat
      const workflowName = workflows.find(w => w.id === workflowId)?.name || 'Unknown Workflow';
      await aiLegalService.sendMessage(
        `🔄 Started workflow execution: "${workflowName}" (ID: ${executionId})`,
        { type: 'workflow-execution', executionId, workflowId }
      );
      setMessages(aiLegalService.getConversationHistory());
      
      // Refresh executions
      setTimeout(() => loadExecutions(), 1000);
      
    } catch (error: any) {
      setChatError(`Workflow execution failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">AI Legal Assistant</h1>
              <p className="mt-2 text-lg text-neutral-600">
                Intelligent legal analysis, research, and workflow automation
              </p>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Document Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Legal Research</span>
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center space-x-2">
              <Workflow className="w-4 h-4" />
              <span>Workflows</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <div className="p-4 border-b border-neutral-200">
                    <h3 className="font-semibold text-neutral-900 flex items-center">
                      <Bot className="w-5 h-5 mr-2 text-primary-600" />
                      AI Legal Assistant
                    </h3>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-neutral-500 py-8">
                        <Brain className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <p>Start a conversation with your AI Legal Assistant</p>
                        <p className="text-sm mt-2">Ask about legal matters, upload documents, or request research</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex space-x-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-primary-600" />
                            </div>
                          )}
                          <div
                            className={`max-w-md px-4 py-2 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-100 text-neutral-900'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <div className="text-xs mt-1 opacity-70">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-neutral-600" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex space-x-3 justify-start">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="bg-neutral-100 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Error Display */}
                  {chatError && (
                    <div className="p-4 border-t border-neutral-200">
                      <Alert className="bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="ml-2">{chatError}</span>
                      </Alert>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 border-t border-neutral-200">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask your AI legal assistant..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-neutral-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setInputMessage("Analyze this contract for risks and compliance issues")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Contract Analysis
                    </Button>
                    <Button
                      onClick={() => setInputMessage("Research case law about employment contracts in Kenya")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Legal Research
                    </Button>
                    <Button
                      onClick={() => setInputMessage("Create a workflow for contract approval process")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Workflow className="w-4 h-4 mr-2" />
                      Workflow Creation
                    </Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-neutral-900 mb-3">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Contract analyzed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>Workflow executing</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-3 h-3 text-purple-500" />
                      <span>Research completed</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Document Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload and Analysis */}
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  Document Upload & Analysis
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Select Document
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt"
                      className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                      <p className="text-xs text-neutral-500">
                        Size: {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleAnalyzeDocument}
                    disabled={!selectedFile || analysisLoading}
                    className="w-full"
                  >
                    {analysisLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze Document
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Analysis Results */}
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Analysis Results</h3>
                
                {documentAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Summary</h4>
                      <p className="text-sm text-neutral-600">{documentAnalysis.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Key Terms</h4>
                      <div className="flex flex-wrap gap-2">
                        {documentAnalysis.keyTerms.map((term, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        {documentAnalysis.riskFactors.map((risk, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              risk.severity === 'high'
                                ? 'bg-red-50 border-red-200'
                                : risk.severity === 'medium'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-green-50 border-green-200'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <AlertTriangle
                                className={`w-4 h-4 mt-0.5 ${
                                  risk.severity === 'high'
                                    ? 'text-red-500'
                                    : risk.severity === 'medium'
                                    ? 'text-yellow-500'
                                    : 'text-green-500'
                                }`}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{risk.type}</p>
                                <p className="text-xs text-neutral-600 mt-1">{risk.description}</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                  <strong>Recommendation:</strong> {risk.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p>Upload and analyze a document to see results</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Legal Research Tab */}
          <TabsContent value="research" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Research Query */}
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                  Legal Research Query
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Research Question
                    </label>
                    <textarea
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      placeholder="Enter your legal research question..."
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Jurisdiction
                      </label>
                      <select
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="East Africa">East Africa</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Practice Area
                      </label>
                      <select
                        value={practiceArea}
                        onChange={(e) => setPracticeArea(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Contract Law">Contract Law</option>
                        <option value="Employment Law">Employment Law</option>
                        <option value="Corporate Law">Corporate Law</option>
                        <option value="Commercial Law">Commercial Law</option>
                        <option value="Constitutional Law">Constitutional Law</option>
                        <option value="Criminal Law">Criminal Law</option>
                        <option value="Family Law">Family Law</option>
                        <option value="Property Law">Property Law</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleLegalResearch}
                    disabled={!researchQuery.trim() || researchLoading}
                    className="w-full"
                  >
                    {researchLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Start Research
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Research Results */}
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Research Results</h3>
                
                {researchResults ? (
                  <div className="space-y-4">
                    {/* Sources */}
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Legal Sources ({researchResults.sources.length})</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {researchResults.sources.map((source: any, index: number) => (
                          <div key={index} className="p-2 bg-neutral-50 rounded border">
                            <p className="font-medium text-sm">{source.title}</p>
                            <p className="text-xs text-neutral-600">{source.citation}</p>
                            <p className="text-xs text-neutral-500 mt-1">{source.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Precedents */}
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Case Precedents ({researchResults.precedents.length})</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {researchResults.precedents.map((precedent: any, index: number) => (
                          <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="font-medium text-sm">{precedent.caseName}</p>
                            <p className="text-xs text-neutral-600">{precedent.court} ({precedent.year})</p>
                            <p className="text-xs text-neutral-500 mt-1">{precedent.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Statutes */}
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Relevant Statutes ({researchResults.statutes.length})</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {researchResults.statutes.map((statute: any, index: number) => (
                          <div key={index} className="p-2 bg-green-50 rounded border border-green-200">
                            <p className="font-medium text-sm">{statute.title} - {statute.section}</p>
                            <p className="text-xs text-neutral-500 mt-1">{statute.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 py-8">
                    <Search className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p>Enter a research query to find relevant legal sources</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Workflows */}
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                  <Workflow className="w-5 h-5 mr-2 text-primary-600" />
                  Available Workflows
                </h3>
                
                <div className="space-y-3">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">{workflow.name}</h4>
                          <p className="text-sm text-neutral-600 mt-1">{workflow.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                            <span>{workflow.nodes.length} nodes</span>
                            <span className="capitalize">{workflow.category}</span>
                            <span>v{workflow.version}</span>
                          </div>
                          
                          {/* AI Capabilities Indicator */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {workflow.nodes.filter(node => node.type === 'ai-analysis').map((node, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {node.config.analysisTypes?.[0] || 'AI Analysis'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleExecuteWorkflow(workflow.id, { source: 'manual' })}
                          size="sm"
                          className="ml-2"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Executions */}
              <Card className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Recent Executions</h3>
                
                <div className="space-y-3">
                  {executions.length > 0 ? (
                    executions.map((execution) => (
                      <div
                        key={execution.id}
                        className="p-3 bg-neutral-50 rounded-lg border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(execution.status)}
                            <span className="font-medium text-sm">
                              {workflows.find(w => w.id === execution.workflowId)?.name || 'Unknown Workflow'}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {formatTime(execution.startTime)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-neutral-600">
                          <span className="capitalize">{execution.status}</span>
                          {execution.endTime && (
                            <span className="ml-2">
                              Duration: {Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s
                            </span>
                          )}
                        </div>
                        {execution.executionLog.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-neutral-500">
                              {execution.executionLog.length} steps completed
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-neutral-500 py-8">
                      <Workflow className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                      <p>No workflow executions yet</p>
                      <p className="text-sm mt-1">Run a workflow to see execution history</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

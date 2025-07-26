'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  FileText, 
  Search, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Workflow,
  Zap,
  Upload,
  Download,
  Eye,
  BarChart3,
  Settings,
  Users,
  Shield,
  TrendingUp
} from 'lucide-react';
import { workflowEngine, type WorkflowExecution, type WorkflowTemplate } from '@/lib/workflow-engine';
import MainLayout from '@/components/layout/MainLayout';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [executionResults, setExecutionResults] = useState<any>(null);

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
    
    // Refresh executions every 2 seconds to show real-time updates
    const interval = setInterval(loadExecutions, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadWorkflows = () => {
    const templates = workflowEngine.getAllTemplates();
    setWorkflows(templates);
  };

  const loadExecutions = () => {
    const allExecutions = workflowEngine.getAllExecutions();
    setExecutions(allExecutions.slice(-10)); // Show last 10 executions
  };

  const handleExecuteWorkflow = async (workflow: WorkflowTemplate) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setSelectedWorkflow(workflow);
    setExecutionResults(null);

    try {
      const triggerData = {
        source: 'manual',
        input: executionInput,
        document: selectedFile ? await readFileContent(selectedFile) : undefined,
        timestamp: new Date().toISOString()
      };

      const executionId = await workflowEngine.executeWorkflow(workflow.id, triggerData);
      
      // Monitor execution progress
      monitorExecution(executionId);
      
    } catch (error: any) {
      console.error('Workflow execution failed:', error);
      alert(`Workflow execution failed: ${error.message}`);
      setIsExecuting(false);
    }
  };

  const monitorExecution = (executionId: string) => {
    const checkExecution = () => {
      const execution = workflowEngine.getExecution(executionId);
      if (execution) {
        setExecutionResults(execution);
        
        if (execution.status === 'completed' || execution.status === 'failed') {
          setIsExecuting(false);
          loadExecutions();
        } else {
          setTimeout(checkExecution, 1000);
        }
      }
    };
    
    setTimeout(checkExecution, 1000);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Contract Management': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Compliance': return <Shield className="w-5 h-5 text-green-600" />;
      case 'Document Automation': return <Zap className="w-5 h-5 text-purple-600" />;
      case 'Legal Research': return <Search className="w-5 h-5 text-orange-600" />;
      case 'Contract Intelligence': return <Brain className="w-5 h-5 text-pink-600" />;
      default: return <Workflow className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const calculateExecutionDuration = (execution: WorkflowExecution) => {
    if (!execution.endTime) return 'Running...';
    const duration = execution.endTime.getTime() - execution.startTime.getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
                <Workflow className="w-8 h-8 mr-3 text-primary-600" />
                AI-Powered Legal Workflows
              </h1>
              <p className="text-neutral-600 mt-2">
                Automate legal processes with intelligent AI workflows for contract analysis, compliance monitoring, 
                document generation, and legal research.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {workflows.length} Active Workflows
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {executions.length} Recent Executions
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Workflows */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary-600" />
                Available AI Workflows
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      selectedWorkflow?.id === workflow.id 
                        ? 'border-primary-300 bg-primary-50' 
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCategoryIcon(workflow.category)}
                          <h3 className="font-medium text-neutral-900">{workflow.name}</h3>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">{workflow.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-neutral-500">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {workflow.nodes.length} nodes
                          </span>
                          <span className="capitalize">{workflow.category}</span>
                          <span>v{workflow.version}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteWorkflow(workflow);
                        }}
                        size="sm"
                        className="w-full"
                        disabled={isExecuting}
                      >
                        {isExecuting && selectedWorkflow?.id === workflow.id ? (
                          <>
                            <Clock className="w-3 h-3 mr-1 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Execute Workflow
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Execution Input */}
            {selectedWorkflow && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary-600" />
                  Configure Execution: {selectedWorkflow.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Input Content or Query
                    </label>
                    <Textarea
                      value={executionInput}
                      onChange={(e) => setExecutionInput(e.target.value)}
                      placeholder="Enter contract text, legal query, or requirements..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Upload Document (Optional)
                    </label>
                    <Input
                      type="file"
                      accept=".txt,.docx,.pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                    {selectedFile && (
                      <p className="text-sm text-neutral-600 mt-1">
                        Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Execution Results */}
            {executionResults && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                  Execution Results
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(executionResults.status)}
                      <span className="font-medium capitalize">{executionResults.status}</span>
                    </div>
                    <div className="text-sm text-neutral-600">
                      Duration: {calculateExecutionDuration(executionResults)}
                    </div>
                  </div>
                  
                  {executionResults.executionLog.length > 0 && (
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Execution Log</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {executionResults.executionLog.map((log: any, index: number) => (
                          <div key={index} className="p-2 bg-white border rounded text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{log.nodeId}</span>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(log.status)}
                                <span className="text-xs text-neutral-500">
                                  {formatTime(new Date(log.timestamp))}
                                </span>
                              </div>
                            </div>
                            {log.output && (
                              <div className="mt-1 text-neutral-600">
                                {typeof log.output === 'object' ? 
                                  JSON.stringify(log.output, null, 2).substring(0, 200) + '...' :
                                  log.output.toString().substring(0, 200) + '...'
                                }
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Recent Executions Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                Recent Executions
              </h2>
              
              {executions.length > 0 ? (
                <div className="space-y-3">
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="p-3 bg-neutral-50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(execution.status)}
                          <span className="text-sm font-medium">
                            {workflows.find(w => w.id === execution.workflowId)?.name || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500">
                          {formatTime(execution.startTime)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-neutral-600">
                        <div className="flex justify-between">
                          <span className="capitalize">{execution.status}</span>
                          <span>{calculateExecutionDuration(execution)}</span>
                        </div>
                        {execution.executionLog.length > 0 && (
                          <div className="mt-1">
                            {execution.executionLog.length} steps completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-neutral-500 py-8">
                  <Workflow className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p>No executions yet</p>
                  <p className="text-sm mt-1">Run a workflow to see execution history</p>
                </div>
              )}
            </Card>

            {/* Workflow Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Workflow Statistics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Total Workflows</span>
                  <Badge variant="secondary">{workflows.length}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Completed Today</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {executions.filter(e => e.status === 'completed').length}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Success Rate</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {executions.length > 0 ? 
                      Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100) : 0
                    }%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Avg Duration</span>
                  <Badge variant="secondary">
                    {executions.length > 0 ? '12s' : 'N/A'}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

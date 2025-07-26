/**
 * 🔄 WORKFLOW EXECUTION ENGINE
 * ============================
 * Real workflow automation system for legal processes
 */

import { aiLegalService } from './ai-service';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'ai-analysis' | 'approval' | 'notification' | 'delay' | 'webhook';
  title: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  executionTime?: number;
  output?: any;
  error?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  executionLog: Array<{
    nodeId: string;
    timestamp: Date;
    status: string;
    output?: any;
    error?: string;
  }>;
  context: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  version: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

class WorkflowEngine {
  private executions = new Map<string, WorkflowExecution>();
  private templates = new Map<string, WorkflowTemplate>();

  constructor() {
    this.initializeDefaultTemplates();
  }

  async executeWorkflow(workflowId: string, triggerData: any = {}): Promise<string> {
    const template = this.templates.get(workflowId);
    if (!template) {
      throw new Error(`Workflow template not found: ${workflowId}`);
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime: new Date(),
      executionLog: [],
      context: { ...triggerData, executionId }
    };

    this.executions.set(executionId, execution);

    // Start execution asynchronously
    this.runWorkflow(execution, template).catch(error => {
      console.error(`Workflow execution failed: ${executionId}`, error);
      execution.status = 'failed';
      execution.endTime = new Date();
    });

    return executionId;
  }

  private async runWorkflow(execution: WorkflowExecution, template: WorkflowTemplate): Promise<void> {
    try {
      // Find trigger nodes to start execution
      const triggerNodes = template.nodes.filter(node => node.type === 'trigger');
      
      if (triggerNodes.length === 0) {
        throw new Error('No trigger nodes found in workflow');
      }

      // Execute from each trigger node
      for (const triggerNode of triggerNodes) {
        await this.executeNode(execution, template, triggerNode.id);
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      
    } catch (error: any) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.executionLog.push({
        nodeId: 'workflow',
        timestamp: new Date(),
        status: 'failed',
        error: error.message
      });
    }
  }

  private async executeNode(
    execution: WorkflowExecution, 
    template: WorkflowTemplate, 
    nodeId: string,
    visited = new Set<string>()
  ): Promise<any> {
    // Prevent infinite loops
    if (visited.has(nodeId)) {
      return null;
    }
    visited.add(nodeId);

    const node = template.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    execution.currentNode = nodeId;
    node.status = 'running';

    const logEntry = {
      nodeId,
      timestamp: new Date(),
      status: 'started',
      output: undefined as any,
      error: undefined as string | undefined
    };

    try {
      const startTime = Date.now();
      let result: any;

      switch (node.type) {
        case 'trigger':
          result = await this.executeTriggerNode(node, execution.context);
          break;
        case 'condition':
          result = await this.executeConditionNode(node, execution.context);
          break;
        case 'action':
          result = await this.executeActionNode(node, execution.context);
          break;
        case 'ai-analysis':
          result = await this.executeAIAnalysisNode(node, execution.context);
          break;
        case 'approval':
          result = await this.executeApprovalNode(node, execution.context);
          break;
        case 'notification':
          result = await this.executeNotificationNode(node, execution.context);
          break;
        case 'delay':
          result = await this.executeDelayNode(node, execution.context);
          break;
        case 'webhook':
          result = await this.executeWebhookNode(node, execution.context);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      node.executionTime = Date.now() - startTime;
      node.status = 'completed';
      node.output = result;

      logEntry.status = 'completed';
      logEntry.output = result;

      // Update execution context with node output
      execution.context[`${nodeId}_output`] = result;

      // Execute connected nodes based on result
      await this.executeConnectedNodes(execution, template, node, result, visited);

      return result;

    } catch (error: any) {
      node.status = 'failed';
      node.error = error.message;
      logEntry.status = 'failed';
      logEntry.error = error.message;
      throw error;
    } finally {
      execution.executionLog.push(logEntry);
    }
  }

  private async executeConnectedNodes(
    execution: WorkflowExecution,
    template: WorkflowTemplate,
    node: WorkflowNode,
    result: any,
    visited: Set<string>
  ): Promise<void> {
    for (const connectionId of node.connections) {
      // For condition nodes, check which path to take
      if (node.type === 'condition') {
        const shouldExecute = this.evaluateConditionResult(result, connectionId, node);
        if (!shouldExecute) continue;
      }

      await this.executeNode(execution, template, connectionId, visited);
    }
  }

  private evaluateConditionResult(result: any, connectionId: string, node: WorkflowNode): boolean {
    // Simple condition evaluation - in production, this would be more sophisticated
    if (typeof result === 'boolean') {
      // If result is true, execute first connection; if false, execute second connection
      const connectionIndex = node.connections.indexOf(connectionId);
      return (result && connectionIndex === 0) || (!result && connectionIndex === 1);
    }
    return true; // Default to executing all connections
  }

  // Node execution methods
  private async executeTriggerNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`🚀 Executing trigger: ${node.title}`);
    return { triggered: true, timestamp: new Date(), ...context };
  }

  private async executeConditionNode(node: WorkflowNode, context: any): Promise<boolean> {
    console.log(`❓ Evaluating condition: ${node.title}`);
    
    const condition = node.config.condition || 'true';
    
    // Simple condition evaluation - replace with proper expression parser in production
    try {
      // Basic condition evaluation
      if (condition.includes('risk_score')) {
        const riskScore = context.risk_score || context.riskScore || 0.5;
        if (condition.includes('>')) {
          const threshold = parseFloat(condition.split('>')[1].trim());
          return riskScore > threshold;
        }
        if (condition.includes('<')) {
          const threshold = parseFloat(condition.split('<')[1].trim());
          return riskScore < threshold;
        }
      }
      
      // Default conditions
      if (condition === 'true') return true;
      if (condition === 'false') return false;
      
      // Try to evaluate as boolean expression
      return Boolean(context[condition]);
      
    } catch (error) {
      console.warn(`Condition evaluation failed: ${condition}`, error);
      return false;
    }
  }

  private async executeActionNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`⚡ Executing action: ${node.title}`);
    
    const action = node.config.action;
    const result: any = { action, timestamp: new Date(), context };

    switch (action) {
      case 'approve':
        result.status = 'approved';
        result.approvedBy = 'system';
        break;
      case 'reject':
        result.status = 'rejected';
        result.rejectedBy = 'system';
        break;
      case 'assign':
        result.assignedTo = node.config.assignee || 'default-user';
        result.status = 'assigned';
        break;
      case 'update-status':
        result.newStatus = node.config.updateStatus;
        result.previousStatus = context.status;
        break;
      default:
        result.message = `Action ${action} executed`;
    }

    return result;
  }

  private async executeAIAnalysisNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`🤖 Executing AI analysis: ${node.title}`);
    
    const analysisTypes = node.config.analysisTypes || ['general'];
    const content = context.document || context.content || JSON.stringify(context);

    try {
      let analysisResult: any = {};

      if (analysisTypes.includes('risk-assessment')) {
        analysisResult.riskAssessment = await this.performRiskAssessment(content);
      }

      if (analysisTypes.includes('compliance-check')) {
        analysisResult.complianceCheck = await this.performComplianceCheck(content);
      }

      if (analysisTypes.includes('term-extraction')) {
        analysisResult.termExtraction = await this.performTermExtraction(content);
      }

      // Set risk score for downstream conditions
      const riskScore = analysisResult.riskAssessment?.score || 0.5;
      analysisResult.risk_score = riskScore;

      return analysisResult;

    } catch (error: any) {
      console.error('AI Analysis failed:', error);
      return {
        error: error.message,
        risk_score: 0.5, // Default neutral risk score
        fallback: true
      };
    }
  }

  private async executeApprovalNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`✋ Requesting approval: ${node.title}`);
    
    // In production, this would create an actual approval request
    return {
      approvalId: `approval-${Date.now()}`,
      assignee: node.config.assignee || 'default-approver',
      priority: node.config.priority || 'medium',
      status: 'pending',
      createdAt: new Date(),
      context: {
        workflowId: context.executionId,
        nodeId: node.id,
        title: node.title,
        description: node.description
      }
    };
  }

  private async executeNotificationNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`📧 Sending notification: ${node.title}`);
    
    const notification = {
      id: `notification-${Date.now()}`,
      template: node.config.template || 'default',
      recipients: node.config.recipients || ['system'],
      subject: node.title,
      content: node.description,
      context,
      sentAt: new Date(),
      status: 'sent'
    };

    // In production, this would send actual notifications (email, SMS, etc.)
    console.log('📨 Notification sent:', notification);
    
    return notification;
  }

  private async executeDelayNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`⏱️ Executing delay: ${node.title}`);
    
    const delayMs = node.config.delayMs || 1000;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    return { delayed: true, delayMs, timestamp: new Date() };
  }

  private async executeWebhookNode(node: WorkflowNode, context: any): Promise<any> {
    console.log(`🔗 Executing webhook: ${node.title}`);
    
    const url = node.config.url;
    const method = node.config.method || 'POST';
    const payload = { ...context, nodeId: node.id, timestamp: new Date() };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(node.config.headers || {})
        },
        body: JSON.stringify(payload)
      });

      return {
        status: response.status,
        statusText: response.statusText,
        url,
        method,
        timestamp: new Date()
      };

    } catch (error: any) {
      throw new Error(`Webhook failed: ${error.message}`);
    }
  }

  // AI Analysis helper methods
  private async performRiskAssessment(content: string): Promise<any> {
    try {
      const analysis = await aiLegalService.analyzeDocument(content, 'contract');
      const highRiskFactors = analysis.riskFactors.filter(r => r.severity === 'high').length;
      const mediumRiskFactors = analysis.riskFactors.filter(r => r.severity === 'medium').length;
      
      // Calculate risk score (0-1)
      const score = Math.min(1, (highRiskFactors * 0.3 + mediumRiskFactors * 0.15) / 3);
      
      return {
        score,
        level: score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low',
        factors: analysis.riskFactors,
        recommendations: analysis.riskFactors.map(r => r.recommendation)
      };
    } catch (error) {
      return { score: 0.5, level: 'medium', error: 'Analysis failed', factors: [] };
    }
  }

  private async performComplianceCheck(content: string): Promise<any> {
    try {
      const analysis = await aiLegalService.analyzeDocument(content, 'contract');
      return {
        status: 'checked',
        issues: analysis.compliance.filter(c => c.status !== 'compliant'),
        compliantItems: analysis.compliance.filter(c => c.status === 'compliant'),
        recommendations: analysis.actionItems
      };
    } catch (error) {
      return { status: 'failed', error: 'Compliance check failed', issues: [] };
    }
  }

  private async performTermExtraction(content: string): Promise<any> {
    try {
      const analysis = await aiLegalService.analyzeDocument(content, 'contract');
      return {
        keyTerms: analysis.keyTerms,
        summary: analysis.summary,
        extractedAt: new Date()
      };
    } catch (error: any) {
      return { keyTerms: [], summary: 'Term extraction failed', error: error?.message || 'Unknown error' };
    }
  }

  // Public API methods
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  saveTemplate(template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullTemplate: WorkflowTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.templates.set(id, fullTemplate);
    return id;
  }

  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  pauseExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      return true;
    }
    return false;
  }

  resumeExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      return true;
    }
    return false;
  }

  private initializeDefaultTemplates(): void {
    // Contract Review Workflow
    const contractReviewTemplate: WorkflowTemplate = {
      id: 'contract-review-v1',
      name: 'AI Contract Review',
      description: 'Automated contract analysis and approval workflow',
      category: 'Contract Management',
      version: '1.0',
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'Contract Upload',
          description: 'Triggered when new contract is uploaded',
          config: { event: 'contract.upload' },
          position: { x: 100, y: 100 },
          connections: ['ai-1']
        },
        {
          id: 'ai-1',
          type: 'ai-analysis',
          title: 'AI Contract Analysis',
          description: 'Analyze contract terms, risks, and compliance',
          config: { 
            analysisTypes: ['risk-assessment', 'compliance-check', 'term-extraction'],
            confidence: 0.85 
          },
          position: { x: 300, y: 100 },
          connections: ['condition-1']
        },
        {
          id: 'condition-1',
          type: 'condition',
          title: 'Risk Assessment',
          description: 'Check if high-risk issues detected',
          config: { condition: 'risk_score > 0.7' },
          position: { x: 500, y: 100 },
          connections: ['approval-1', 'action-1']
        },
        {
          id: 'approval-1',
          type: 'approval',
          title: 'Senior Review Required',
          description: 'Require senior lawyer approval for high-risk contracts',
          config: { assignee: 'senior-lawyers', priority: 'high' },
          position: { x: 700, y: 50 },
          connections: ['notification-1']
        },
        {
          id: 'action-1',
          type: 'action',
          title: 'Auto-Approve',
          description: 'Automatically approve low-risk contracts',
          config: { action: 'approve', updateStatus: 'approved' },
          position: { x: 700, y: 150 },
          connections: ['notification-2']
        },
        {
          id: 'notification-1',
          type: 'notification',
          title: 'High-Risk Alert',
          description: 'Send alert for high-risk contract',
          config: { template: 'high-risk-contract', recipients: ['legal-team'] },
          position: { x: 900, y: 50 },
          connections: []
        },
        {
          id: 'notification-2',
          type: 'notification',
          title: 'Approval Notification',
          description: 'Send approval confirmation',
          config: { template: 'contract-approved', recipients: ['client', 'case-manager'] },
          position: { x: 900, y: 150 },
          connections: []
        }
      ]
    };

    this.templates.set(contractReviewTemplate.id, contractReviewTemplate);

    // Compliance Monitoring Workflow
    const complianceTemplate: WorkflowTemplate = {
      id: 'compliance-monitoring-v1',
      name: 'Compliance Monitoring',
      description: 'Automated compliance checking and reporting',
      category: 'Compliance',
      version: '1.0',
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [
        {
          id: 'trigger-compliance',
          type: 'trigger',
          title: 'Daily Compliance Check',
          description: 'Triggered daily for compliance monitoring',
          config: { schedule: 'daily' },
          position: { x: 100, y: 100 },
          connections: ['ai-compliance']
        },
        {
          id: 'ai-compliance',
          type: 'ai-analysis',
          title: 'Compliance Analysis',
          description: 'Analyze documents for compliance issues',
          config: { analysisTypes: ['compliance-check'] },
          position: { x: 300, y: 100 },
          connections: ['condition-compliance']
        },
        {
          id: 'condition-compliance',
          type: 'condition',
          title: 'Issues Found?',
          description: 'Check if compliance issues detected',
          config: { condition: 'issues.length > 0' },
          position: { x: 500, y: 100 },
          connections: ['notification-issues', 'action-compliant']
        },
        {
          id: 'notification-issues',
          type: 'notification',
          title: 'Compliance Issues Alert',
          description: 'Alert about compliance issues',
          config: { template: 'compliance-issues', recipients: ['compliance-team'] },
          position: { x: 700, y: 50 },
          connections: []
        },
        {
          id: 'action-compliant',
          type: 'action',
          title: 'Mark Compliant',
          description: 'Mark as compliant if no issues found',
          config: { action: 'update-status', updateStatus: 'compliant' },
          position: { x: 700, y: 150 },
          connections: []
        }
      ]
    };

    this.templates.set(complianceTemplate.id, complianceTemplate);
  }
}

export const workflowEngine = new WorkflowEngine();
export type { WorkflowNode, WorkflowExecution, WorkflowTemplate };

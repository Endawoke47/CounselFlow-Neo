// Legal Workflow Automation Service
// Phase 3: Feature 1 - Advanced Workflow Management & Process Automation Engine
// Core service for creating, managing, and executing legal workflows

import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  WorkflowTemplate,
  WorkflowAnalytics,
  WorkflowExecutionRequest,
  WorkflowExecutionResponse,
  WorkflowAnalyticsRequest,
  WorkflowAnalyticsResponse,
  WorkflowType,
  WorkflowStatus,
  WorkflowComplexity,
  StepType,
  StepStatus,
  TriggerType,
  ExecutionContext,
  ExecutionMetrics,
  AnalyticsPeriod,
} from '../types/workflow-automation.types';
import { LegalJurisdiction } from '../types/ai.types';
import { LegalArea } from '../types/legal-research.types';

export class WorkflowAutomationService {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  // ============================================================================
  // WORKFLOW DEFINITION MANAGEMENT
  // ============================================================================

  /**
   * Create a new workflow definition
   */
  async createWorkflow(
    definition: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): Promise<WorkflowDefinition> {
    try {
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const workflow: WorkflowDefinition = {
        ...definition,
        id: workflowId,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate workflow definition
      await this.validateWorkflowDefinition(workflow);

      // Store workflow
      this.workflows.set(workflowId, workflow);

      return workflow;
    } catch (error) {
      throw new Error(
        `Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update an existing workflow definition
   */
  async updateWorkflow(
    workflowId: string,
    updates: Partial<WorkflowDefinition>
  ): Promise<WorkflowDefinition> {
    try {
      const existingWorkflow = this.workflows.get(workflowId);
      if (!existingWorkflow) {
        throw new Error('Workflow not found');
      }

      const updatedWorkflow: WorkflowDefinition = {
        ...existingWorkflow,
        ...updates,
        id: workflowId, // Ensure ID doesn't change
        updatedAt: new Date(),
      };

      // Validate updated workflow
      await this.validateWorkflowDefinition(updatedWorkflow);

      // Store updated workflow
      this.workflows.set(workflowId, updatedWorkflow);

      return updatedWorkflow;
    } catch (error) {
      throw new Error(
        `Failed to update workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a workflow definition
   */
  async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Check if workflow has active executions
      const activeExecutions = Array.from(this.executions.values()).filter(
        execution =>
          execution.workflowDefinitionId === workflowId &&
          execution.status === WorkflowStatus.ACTIVE
      );

      if (activeExecutions.length > 0) {
        throw new Error('Cannot delete workflow with active executions');
      }

      this.workflows.delete(workflowId);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get workflow definition by ID
   */
  async getWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * List workflows with filtering and pagination
   */
  async listWorkflows(filters?: {
    type?: WorkflowType;
    status?: WorkflowStatus;
    category?: string;
    jurisdiction?: LegalJurisdiction;
    legalArea?: LegalArea;
    createdBy?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ workflows: WorkflowDefinition[]; total: number }> {
    try {
      let workflowList = Array.from(this.workflows.values());

      // Apply filters
      if (filters) {
        if (filters.type) {
          workflowList = workflowList.filter(w => w.type === filters.type);
        }
        if (filters.category) {
          workflowList = workflowList.filter(w => w.category === filters.category);
        }
        if (filters.jurisdiction) {
          workflowList = workflowList.filter(w => w.jurisdiction === filters.jurisdiction);
        }
        if (filters.legalArea) {
          workflowList = workflowList.filter(w => w.legalArea === filters.legalArea);
        }
        if (filters.createdBy) {
          workflowList = workflowList.filter(w => w.createdBy === filters.createdBy);
        }
        if (filters.isActive !== undefined) {
          workflowList = workflowList.filter(w => w.isActive === filters.isActive);
        }
      }

      const total = workflowList.length;

      // Apply pagination
      if (filters?.offset) {
        workflowList = workflowList.slice(filters.offset);
      }
      if (filters?.limit) {
        workflowList = workflowList.slice(0, filters.limit);
      }

      return { workflows: workflowList, total };
    } catch (error) {
      throw new Error(
        `Failed to list workflows: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  /**
   * Execute a workflow
   */
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
    try {
      const workflow = this.workflows.get(request.workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      if (!workflow.isActive) {
        throw new Error('Workflow is not active');
      }

      // Create execution context
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const execution: WorkflowExecution = {
        id: executionId,
        workflowDefinitionId: request.workflowId,
        workflowName: workflow.name,
        version: workflow.version,
        triggeredBy: request.context?.userId || 'system',
        triggerType: request.triggerType || TriggerType.MANUAL_START,
        triggerData: request.metadata,
        status: WorkflowStatus.ACTIVE,
        priority: request.priority || workflow.priority,
        startTime: new Date(),
        currentStep: this.findStartStep(workflow.steps)?.id,
        nextSteps: this.getNextSteps(workflow.steps, this.findStartStep(workflow.steps)?.id),
        completedSteps: [],
        failedSteps: [],
        skippedSteps: [],
        variables: { ...request.variables },
        context: this.createExecutionContext(request),
        metrics: this.initializeMetrics(workflow.steps.length),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store execution
      this.executions.set(executionId, execution);

      // Update workflow usage count
      workflow.usageCount += 1;
      workflow.lastUsed = new Date();
      this.workflows.set(request.workflowId, workflow);

      // Start execution
      await this.processExecution(executionId);

      return {
        executionId,
        status: execution.status,
        message: 'Workflow execution started',
        estimatedDuration: this.estimateExecutionDuration(workflow),
        nextSteps: execution.nextSteps,
      };
    } catch (error) {
      return {
        executionId: '',
        status: WorkflowStatus.ERROR,
        message: `Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [
          {
            id: `error_${Date.now()}`,
            stepId: '',
            stepName: 'Execution Start',
            code: 'EXECUTION_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            type: 'EXECUTION',
            severity: 'CRITICAL',
            timestamp: new Date(),
            retryable: false,
            retryCount: 0,
            resolutionStatus: 'PENDING',
          },
        ],
      };
    }
  }

  /**
   * Get execution status and details
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution | null> {
    return this.executions.get(executionId) || null;
  }

  /**
   * Cancel a running workflow execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    try {
      const execution = this.executions.get(executionId);
      if (!execution) {
        throw new Error('Execution not found');
      }

      if (execution.status !== WorkflowStatus.ACTIVE) {
        throw new Error('Execution is not active');
      }

      execution.status = WorkflowStatus.CANCELLED;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.updatedAt = new Date();

      this.executions.set(executionId, execution);

      return true;
    } catch (error) {
      throw new Error(
        `Failed to cancel execution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Retry a failed workflow execution
   */
  async retryExecution(executionId: string): Promise<WorkflowExecutionResponse> {
    try {
      const execution = this.executions.get(executionId);
      if (!execution) {
        throw new Error('Execution not found');
      }

      if (execution.status !== WorkflowStatus.ERROR) {
        throw new Error('Execution is not in error state');
      }

      // Reset execution state
      execution.status = WorkflowStatus.ACTIVE;
      execution.endTime = undefined;
      execution.duration = undefined;
      execution.errors = [];
      execution.updatedAt = new Date();

      // Resume from last successful step
      const lastCompletedStep = execution.completedSteps[execution.completedSteps.length - 1];
      if (lastCompletedStep) {
        const workflow = this.workflows.get(execution.workflowDefinitionId);
        if (workflow) {
          execution.nextSteps = this.getNextSteps(workflow.steps, lastCompletedStep);
        }
      }

      this.executions.set(executionId, execution);

      // Continue execution
      await this.processExecution(executionId);

      return {
        executionId,
        status: execution.status,
        message: 'Workflow execution retried',
        nextSteps: execution.nextSteps,
      };
    } catch (error) {
      return {
        executionId,
        status: WorkflowStatus.ERROR,
        message: `Failed to retry execution: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [
          {
            id: `error_${Date.now()}`,
            stepId: '',
            stepName: 'Execution Retry',
            code: 'RETRY_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            type: 'EXECUTION',
            severity: 'HIGH',
            timestamp: new Date(),
            retryable: false,
            retryCount: 0,
            resolutionStatus: 'PENDING',
          },
        ],
      };
    }
  }

  // ============================================================================
  // WORKFLOW PROCESSING
  // ============================================================================

  /**
   * Process workflow execution
   */
  private async processExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== WorkflowStatus.ACTIVE) {
      return;
    }

    const workflow = this.workflows.get(execution.workflowDefinitionId);
    if (!workflow) {
      throw new Error('Workflow definition not found');
    }

    try {
      while (
        execution.nextSteps &&
        execution.nextSteps.length > 0 &&
        execution.status === WorkflowStatus.ACTIVE
      ) {
        const currentStepId = execution.nextSteps[0];
        const step = workflow.steps.find(s => s.id === currentStepId);

        if (!step) {
          throw new Error(`Step not found: ${currentStepId}`);
        }

        // Execute step
        await this.executeStep(execution, step);

        // Update execution state
        execution.currentStep = currentStepId;
        execution.completedSteps.push(currentStepId);
        execution.nextSteps = this.getNextSteps(workflow.steps, currentStepId);
        execution.updatedAt = new Date();

        // Check if workflow is complete
        if (execution.nextSteps.length === 0 || step.type === StepType.END) {
          execution.status = WorkflowStatus.COMPLETED;
          execution.endTime = new Date();
          execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
          break;
        }
      }

      this.executions.set(executionId, execution);
    } catch (error) {
      execution.status = WorkflowStatus.ERROR;
      execution.endTime = new Date();
      execution.duration = execution.endTime
        ? execution.endTime.getTime() - execution.startTime.getTime()
        : 0;

      if (!execution.errors) {
        execution.errors = [];
      }

      execution.errors.push({
        id: `error_${Date.now()}`,
        stepId: execution.currentStep || '',
        stepName: execution.currentStep || 'Unknown',
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'EXECUTION',
        severity: 'HIGH',
        timestamp: new Date(),
        retryable: true,
        retryCount: 0,
        resolutionStatus: 'PENDING',
      });

      this.executions.set(executionId, execution);
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(execution: WorkflowExecution, step: WorkflowStep): Promise<void> {
    const startTime = Date.now();

    try {
      // Update step status
      step.status = StepStatus.RUNNING;
      step.startTime = new Date();

      // Execute step based on type
      switch (step.type) {
        case StepType.DOCUMENT_GENERATION:
          await this.executeDocumentGeneration(execution, step);
          break;
        case StepType.EMAIL_NOTIFICATION:
          await this.executeEmailNotification(execution, step);
          break;
        case StepType.APPROVAL_GATE:
          await this.executeApprovalGate(execution, step);
          break;
        case StepType.CONDITIONAL_BRANCH:
          await this.executeConditionalBranch(execution, step);
          break;
        case StepType.API_CALL:
          await this.executeApiCall(execution, step);
          break;
        case StepType.DELAY:
          await this.executeDelay(execution, step);
          break;
        case StepType.TASK_ASSIGNMENT:
          await this.executeTaskAssignment(execution, step);
          break;
        case StepType.DATA_VALIDATION:
          await this.executeDataValidation(execution, step);
          break;
        default:
          // Default handling for unknown step types
          await this.executeCustomStep(execution, step);
      }

      // Update step completion
      step.status = StepStatus.COMPLETED;
      step.endTime = new Date();
      step.actualDuration = Date.now() - startTime;
    } catch (error) {
      step.status = StepStatus.FAILED;
      step.endTime = new Date();
      step.actualDuration = Date.now() - startTime;

      if (!step.errors) {
        step.errors = [];
      }

      step.errors.push({
        id: `error_${Date.now()}`,
        stepId: step.id,
        stepName: step.name,
        code: 'STEP_EXECUTION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'EXECUTION',
        severity: 'HIGH',
        timestamp: new Date(),
        retryable: true,
        retryCount: 0,
        resolutionStatus: 'PENDING',
      });

      throw error;
    }
  }

  // ============================================================================
  // STEP EXECUTION METHODS
  // ============================================================================

  private async executeDocumentGeneration(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    // Simulate document generation
    const config = step.config;
    const templateId = config.templateId;
    const outputFormat = config.outputFormat || ['PDF'];

    // Generate document using variables from execution context
    const variables = { ...execution.variables };

    // Simulate generation time based on document complexity
    await this.delay(2000 + Math.random() * 3000);

    step.output = {
      documentId: `doc_${Date.now()}`,
      templateId,
      formats: outputFormat,
      variables,
      generatedAt: new Date().toISOString(),
      size: Math.floor(Math.random() * 1000000) + 100000, // Random size
    };
  }

  private async executeEmailNotification(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    const config = step.config;
    const recipients = config.recipients || [];
    const subject = this.substituteVariables(
      config.subject || 'Workflow Notification',
      execution.variables
    );
    const message = this.substituteVariables(
      config.message || 'A workflow step has been completed.',
      execution.variables
    );

    // Simulate email sending
    await this.delay(500 + Math.random() * 1500);

    step.output = {
      recipients,
      subject,
      message,
      sentAt: new Date().toISOString(),
      status: 'SENT',
    };
  }

  private async executeApprovalGate(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    const config = step.config;
    const approvers = config.approvers || [];
    const approvalType = config.approvalType || 'SINGLE';

    // For demo purposes, simulate auto-approval after a delay
    const autoApproveAfter = config.autoApproveAfter || 5; // minutes

    if (autoApproveAfter > 0) {
      // Simulate approval delay
      await this.delay(1000); // Short delay for demo

      step.output = {
        approvers,
        approvalType,
        status: 'AUTO_APPROVED',
        approvedAt: new Date().toISOString(),
        approvedBy: 'system',
      };
    } else {
      // Set status to waiting for approval
      step.status = StepStatus.WAITING_APPROVAL;
      step.output = {
        approvers,
        approvalType,
        status: 'PENDING_APPROVAL',
        requestedAt: new Date().toISOString(),
      };
    }
  }

  private async executeConditionalBranch(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    // Evaluate conditions
    const conditions = step.conditions || [];
    let conditionMet = false;

    for (const condition of conditions) {
      // Simple condition evaluation (in production, use a proper expression evaluator)
      const result = this.evaluateCondition(condition.expression, execution.variables);
      if (result) {
        conditionMet = true;
        break;
      }
    }

    step.output = {
      conditionMet,
      evaluatedAt: new Date().toISOString(),
      variables: execution.variables,
    };
  }

  private async executeApiCall(execution: WorkflowExecution, step: WorkflowStep): Promise<void> {
    const config = step.config;
    const endpoint = config.endpoint;
    const method = config.method || 'GET';
    const headers = config.headers || {};
    const payload = config.payload;

    // Simulate API call
    await this.delay(1000 + Math.random() * 2000);

    step.output = {
      endpoint,
      method,
      headers,
      payload,
      response: {
        status: 200,
        data: { success: true, timestamp: new Date().toISOString() },
      },
      executedAt: new Date().toISOString(),
    };
  }

  private async executeDelay(execution: WorkflowExecution, step: WorkflowStep): Promise<void> {
    const config = step.config;
    const delayMinutes = config.delayMinutes || 1;

    // For demo purposes, use milliseconds instead of minutes
    const delayMs = delayMinutes * 100; // Scale down for demo
    await this.delay(delayMs);

    step.output = {
      delayMinutes,
      actualDelayMs: delayMs,
      delayedUntil: new Date(Date.now() + delayMs).toISOString(),
    };
  }

  private async executeTaskAssignment(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    const assignedTo = step.assignedTo || [];
    const assignedRoles = step.assignedRoles || [];

    await this.delay(500);

    step.output = {
      taskId: `task_${Date.now()}`,
      assignedTo,
      assignedRoles,
      assignedAt: new Date().toISOString(),
      status: 'ASSIGNED',
    };
  }

  private async executeDataValidation(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    const variables = execution.variables;
    const validationResults = [];

    // Perform basic validation
    for (const [key, value] of Object.entries(variables)) {
      validationResults.push({
        field: key,
        value,
        isValid: value !== null && value !== undefined && value !== '',
        message: value ? 'Valid' : 'Missing or empty value',
      });
    }

    const isValid = validationResults.every(result => result.isValid);

    step.output = {
      isValid,
      validationResults,
      validatedAt: new Date().toISOString(),
    };

    if (!isValid) {
      throw new Error('Data validation failed');
    }
  }

  private async executeCustomStep(execution: WorkflowExecution, step: WorkflowStep): Promise<void> {
    // Handle custom step types
    await this.delay(1000);

    step.output = {
      stepType: step.type,
      executedAt: new Date().toISOString(),
      message: 'Custom step executed successfully',
    };
  }

  // ============================================================================
  // WORKFLOW ANALYTICS
  // ============================================================================

  /**
   * Get workflow analytics
   */
  async getWorkflowAnalytics(
    request: WorkflowAnalyticsRequest
  ): Promise<WorkflowAnalyticsResponse> {
    try {
      const workflowIds = request.workflowIds || Array.from(this.workflows.keys());
      const analytics: WorkflowAnalytics[] = [];

      for (const workflowId of workflowIds) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) continue;

        const executions = Array.from(this.executions.values()).filter(
          execution => execution.workflowDefinitionId === workflowId
        );

        const workflowAnalytics = await this.calculateWorkflowAnalytics(
          workflow,
          executions,
          request.period
        );
        analytics.push(workflowAnalytics);
      }

      const summary = this.calculateAnalyticsSummary(analytics);

      return {
        analytics,
        summary,
        recommendations: this.generateRecommendations(analytics),
      };
    } catch (error) {
      throw new Error(
        `Failed to get workflow analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async calculateWorkflowAnalytics(
    workflow: WorkflowDefinition,
    executions: WorkflowExecution[],
    period: AnalyticsPeriod
  ): Promise<WorkflowAnalytics> {
    const now = new Date();
    const periodStart = this.getPeriodStart(period, now);
    const recentExecutions = executions.filter(execution => execution.startTime >= periodStart);

    const completedExecutions = executions.filter(
      execution => execution.status === WorkflowStatus.COMPLETED
    );
    const failedExecutions = executions.filter(
      execution => execution.status === WorkflowStatus.ERROR
    );

    const durations = completedExecutions
      .filter(execution => execution.duration)
      .map(execution => execution.duration!);

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      totalExecutions: executions.length,
      recentExecutions: recentExecutions.length,
      averageExecutionsPerDay: recentExecutions.length / this.getDaysInPeriod(period),
      averageDuration:
        durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      medianDuration: durations.length > 0 ? this.calculateMedian(durations) : 0,
      fastestExecution: durations.length > 0 ? Math.min(...durations) : 0,
      slowestExecution: durations.length > 0 ? Math.max(...durations) : 0,
      successRate: executions.length > 0 ? completedExecutions.length / executions.length : 0,
      errorRate: executions.length > 0 ? failedExecutions.length / executions.length : 0,
      timeoutRate: 0, // Not implemented in this demo
      stepPerformance: [],
      bottleneckSteps: [],
      errorProneSteps: [],
      costSavings: this.calculateCostSavings(executions),
      timesSaved: this.calculateTimeSaved(executions),
      documentsGenerated: this.countDocumentsGenerated(executions),
      approvalsProcessed: this.countApprovalsProcessed(executions),
      usageTrend: [],
      performanceTrend: [],
      errorTrend: [],
      lastCalculated: new Date(),
      period,
    };
  }

  private calculateAnalyticsSummary(analytics: WorkflowAnalytics[]) {
    const totalExecutions = analytics.reduce((sum, a) => sum + a.totalExecutions, 0);
    const totalWorkflows = analytics.length;
    const averageSuccessRate =
      analytics.length > 0
        ? analytics.reduce((sum, a) => sum + a.successRate, 0) / analytics.length
        : 0;
    const averageDuration =
      analytics.length > 0
        ? analytics.reduce((sum, a) => sum + a.averageDuration, 0) / analytics.length
        : 0;

    return {
      totalWorkflows,
      totalExecutions,
      averageSuccessRate,
      averageDuration,
      topPerformingWorkflows: analytics
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5)
        .map(a => a.workflowId),
      bottleneckWorkflows: analytics
        .sort((a, b) => b.averageDuration - a.averageDuration)
        .slice(0, 3)
        .map(a => a.workflowId),
      costSavings: analytics.reduce((sum, a) => sum + a.costSavings, 0),
      timeSaved: analytics.reduce((sum, a) => sum + a.timesSaved, 0),
    };
  }

  private generateRecommendations(analytics: WorkflowAnalytics[]) {
    const recommendations = [];

    // Identify workflows with low success rates
    const lowSuccessRateWorkflows = analytics.filter(a => a.successRate < 0.8);
    if (lowSuccessRateWorkflows.length > 0) {
      recommendations.push({
        type: 'ERROR_REDUCTION',
        title: 'Improve Workflow Reliability',
        description:
          'Several workflows have success rates below 80%. Consider reviewing error-prone steps and adding better error handling.',
        impact: 'HIGH',
        effort: 'MEDIUM',
        workflowIds: lowSuccessRateWorkflows.map(w => w.workflowId),
      } as const);
    }

    // Identify slow workflows
    const slowWorkflows = analytics.filter(a => a.averageDuration > 300000); // 5 minutes
    if (slowWorkflows.length > 0) {
      recommendations.push({
        type: 'PERFORMANCE',
        title: 'Optimize Slow Workflows',
        description:
          'Some workflows are taking longer than expected. Consider optimizing bottleneck steps or adding parallel processing.',
        impact: 'MEDIUM',
        effort: 'HIGH',
        workflowIds: slowWorkflows.map(w => w.workflowId),
      } as const);
    }

    return recommendations;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async validateWorkflowDefinition(workflow: WorkflowDefinition): Promise<void> {
    // Validate basic properties
    if (!workflow.name || workflow.name.trim().length === 0) {
      throw new Error('Workflow name is required');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    // Validate steps
    const stepIds = new Set<string>();
    let hasStartStep = false;
    let hasEndStep = false;

    for (const step of workflow.steps) {
      if (stepIds.has(step.id)) {
        throw new Error(`Duplicate step ID: ${step.id}`);
      }
      stepIds.add(step.id);

      if (step.type === StepType.START) {
        hasStartStep = true;
      }
      if (step.type === StepType.END) {
        hasEndStep = true;
      }

      // Validate step dependencies
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          if (!stepIds.has(depId)) {
            throw new Error(`Step ${step.id} depends on non-existent step: ${depId}`);
          }
        }
      }
    }

    if (!hasStartStep) {
      throw new Error('Workflow must have a START step');
    }

    if (!hasEndStep) {
      throw new Error('Workflow must have an END step');
    }
  }

  private findStartStep(steps: WorkflowStep[]): WorkflowStep | undefined {
    return steps.find(step => step.type === StepType.START);
  }

  private getNextSteps(steps: WorkflowStep[], currentStepId?: string): string[] {
    if (!currentStepId) {
      const startStep = this.findStartStep(steps);
      return startStep ? [startStep.id] : [];
    }

    const currentStep = steps.find(step => step.id === currentStepId);
    if (!currentStep) {
      return [];
    }

    // Return successors if defined, otherwise find steps that depend on current step
    if (currentStep.successors && currentStep.successors.length > 0) {
      return currentStep.successors;
    }

    // Find steps that have current step as dependency
    return steps.filter(step => step.dependencies?.includes(currentStepId)).map(step => step.id);
  }

  private createExecutionContext(request: WorkflowExecutionRequest): ExecutionContext {
    return {
      userId: request.context?.userId || 'anonymous',
      userRoles: request.context?.userRoles || [],
      organizationId: request.context?.organizationId || 'default',
      teamId: request.context?.teamId,
      caseId: request.context?.caseId,
      clientId: request.context?.clientId,
      matterId: request.context?.matterId,
      documentIds: request.context?.documentIds,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: request.context?.sessionId,
      ipAddress: request.context?.ipAddress,
      userAgent: request.context?.userAgent,
      customData: request.context?.customData,
    };
  }

  private initializeMetrics(totalSteps: number): ExecutionMetrics {
    return {
      totalSteps,
      completedSteps: 0,
      failedSteps: 0,
      skippedSteps: 0,
      totalDuration: 0,
      averageStepDuration: 0,
      longestStep: '',
      longestStepDuration: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      apiCalls: 0,
      documentsGenerated: 0,
      notificationsSent: 0,
      approvalsRequired: 0,
      approvalsReceived: 0,
    };
  }

  private estimateExecutionDuration(workflow: WorkflowDefinition): number {
    // Simple estimation based on step count and complexity
    const baseTime = 30000; // 30 seconds base time
    const stepTime = workflow.steps.length * 5000; // 5 seconds per step
    const complexityMultiplier =
      workflow.complexity === WorkflowComplexity.SIMPLE
        ? 1
        : workflow.complexity === WorkflowComplexity.MODERATE
          ? 1.5
          : workflow.complexity === WorkflowComplexity.COMPLEX
            ? 2
            : 3;

    return (baseTime + stepTime) * complexityMultiplier;
  }

  private substituteVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return result;
  }

  private evaluateCondition(expression: string, variables: Record<string, any>): boolean {
    // Simple condition evaluation (in production, use a proper expression evaluator)
    try {
      // Replace variables in expression
      let evaluableExpression = expression;
      for (const [key, value] of Object.entries(variables)) {
        evaluableExpression = evaluableExpression.replace(
          new RegExp(`\\b${key}\\b`, 'g'),
          typeof value === 'string' ? `"${value}"` : String(value)
        );
      }

      // For demo purposes, use a simple evaluation
      // In production, use a safe expression evaluator
      return Boolean(eval(evaluableExpression));
    } catch (error) {
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getPeriodStart(period: AnalyticsPeriod, now: Date): Date {
    const start = new Date(now);
    switch (period) {
      case AnalyticsPeriod.LAST_7_DAYS:
        start.setDate(start.getDate() - 7);
        break;
      case AnalyticsPeriod.LAST_30_DAYS:
        start.setDate(start.getDate() - 30);
        break;
      case AnalyticsPeriod.LAST_90_DAYS:
        start.setDate(start.getDate() - 90);
        break;
      case AnalyticsPeriod.LAST_YEAR:
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    return start;
  }

  private getDaysInPeriod(period: AnalyticsPeriod): number {
    switch (period) {
      case AnalyticsPeriod.LAST_7_DAYS:
        return 7;
      case AnalyticsPeriod.LAST_30_DAYS:
        return 30;
      case AnalyticsPeriod.LAST_90_DAYS:
        return 90;
      case AnalyticsPeriod.LAST_YEAR:
        return 365;
      default:
        return 30;
    }
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  }

  private calculateCostSavings(executions: WorkflowExecution[]): number {
    // Estimate cost savings based on automation
    const completedExecutions = executions.filter(e => e.status === WorkflowStatus.COMPLETED);
    const avgSavingsPerExecution = 150; // Estimated savings per automated workflow
    return completedExecutions.length * avgSavingsPerExecution;
  }

  private calculateTimeSaved(executions: WorkflowExecution[]): number {
    // Estimate time saved in hours
    const completedExecutions = executions.filter(e => e.status === WorkflowStatus.COMPLETED);
    const avgTimeSavedPerExecution = 2; // Hours saved per automated workflow
    return completedExecutions.length * avgTimeSavedPerExecution;
  }

  private countDocumentsGenerated(executions: WorkflowExecution[]): number {
    return executions.reduce((count, execution) => {
      const docSteps = execution.completedSteps.length; // Simplified count
      return count + docSteps;
    }, 0);
  }

  private countApprovalsProcessed(executions: WorkflowExecution[]): number {
    return executions.reduce((count, execution) => {
      const approvalSteps = execution.completedSteps.length; // Simplified count
      return count + approvalSteps;
    }, 0);
  }

  private initializeDefaultTemplates(): void {
    // Initialize with some default workflow templates
    const defaultTemplates = [
      {
        id: 'template_case_intake',
        name: 'Case Intake Workflow',
        description:
          'Standard case intake process with client onboarding, document collection, and initial assessment',
        category: 'CASE_MANAGEMENT',
        type: WorkflowType.CASE_INTAKE,
        complexity: WorkflowComplexity.MODERATE,
      },
      {
        id: 'template_contract_review',
        name: 'Contract Review Workflow',
        description:
          'Automated contract review process with legal analysis, risk assessment, and approval routing',
        category: 'CONTRACT_MANAGEMENT',
        type: WorkflowType.CONTRACT_NEGOTIATION,
        complexity: WorkflowComplexity.COMPLEX,
      },
      {
        id: 'template_document_approval',
        name: 'Document Approval Workflow',
        description:
          'Multi-stage document approval process with notifications and deadline tracking',
        category: 'DOCUMENT_MANAGEMENT',
        type: WorkflowType.DOCUMENT_APPROVAL,
        complexity: WorkflowComplexity.SIMPLE,
      },
    ];

    // Store templates (simplified for demo)
    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template as WorkflowTemplate);
    });
  }
}

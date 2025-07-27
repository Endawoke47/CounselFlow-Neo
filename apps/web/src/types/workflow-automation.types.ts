// Workflow Automation Types
export enum WorkflowType {
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  CASE_MANAGEMENT = 'CASE_MANAGEMENT',
  CLIENT_ONBOARDING = 'CLIENT_ONBOARDING',
  CONTRACT_WORKFLOW = 'CONTRACT_WORKFLOW'
}

export enum StepType {
  START = 'START',
  TASK = 'TASK',
  DECISION = 'DECISION',
  END = 'END'
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface WorkflowStep {
  id: string
  type: StepType
  name: string
  status: StepStatus
  description?: string
}

export interface Workflow {
  id: string
  name: string
  type: WorkflowType
  steps: WorkflowStep[]
  status: StepStatus
  createdAt: Date
  updatedAt: Date
}

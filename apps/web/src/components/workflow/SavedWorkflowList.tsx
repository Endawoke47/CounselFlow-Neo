import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  created: string;
  version: string;
  nodes: any[];
  edges: any[];
  steps: any[];
  triggers: any[];
  conditions: any[];
}

interface SavedWorkflowListProps {
  onLoadWorkflow: (workflow: SavedWorkflow) => void;
  onCreateNew: () => void;
}

// Demo saved workflows
const DEMO_WORKFLOWS: SavedWorkflow[] = [
  {
    id: 'workflow_contract_review',
    name: 'Contract Review Pipeline',
    description: 'Automated contract analysis and approval workflow',
    created: '2024-01-15T10:30:00Z',
    version: '1.2',
    nodes: [],
    edges: [],
    steps: [
      { type: 'trigger', title: 'Contract Upload' },
      { type: 'aiAgent', title: 'AI Risk Analysis' },
      { type: 'condition', title: 'Risk Assessment' },
      { type: 'action', title: 'Save to Matter' },
      { type: 'notification', title: 'Alert Legal Team' }
    ],
    triggers: [{ event: 'contract.upload' }],
    conditions: [{ expression: 'risk_score > 0.7' }]
  },
  {
    id: 'workflow_client_onboarding',
    name: 'Client Onboarding Automation',
    description: 'Streamlined client intake and document processing',
    created: '2024-01-12T14:20:00Z',
    version: '1.0',
    nodes: [],
    edges: [],
    steps: [
      { type: 'trigger', title: 'Client Inquiry' },
      { type: 'aiAgent', title: 'Case Assessment' },
      { type: 'condition', title: 'Viability Check' },
      { type: 'action', title: 'Create Client Record' },
      { type: 'notification', title: 'Welcome Email' }
    ],
    triggers: [{ event: 'client.inquiry' }],
    conditions: [{ expression: 'merit_score > 0.6' }]
  },
  {
    id: 'workflow_compliance_audit',
    name: 'Automated Compliance Audit',
    description: 'Quarterly compliance checking and reporting',
    created: '2024-01-10T09:15:00Z',
    version: '2.1',
    nodes: [],
    edges: [],
    steps: [
      { type: 'trigger', title: 'Audit Scheduled' },
      { type: 'aiAgent', title: 'Document Scan' },
      { type: 'action', title: 'Generate Report' },
      { type: 'condition', title: 'Issues Found' },
      { type: 'notification', title: 'Compliance Alert' }
    ],
    triggers: [{ event: 'audit.scheduled' }],
    conditions: [{ expression: 'compliance_issues > 0' }]
  },
  {
    id: 'workflow_deadline_management',
    name: 'Smart Deadline Management',
    description: 'Intelligent deadline tracking and alerts',
    created: '2024-01-08T16:45:00Z',
    version: '1.3',
    nodes: [],
    edges: [],
    steps: [
      { type: 'trigger', title: 'Deadline Created' },
      { type: 'aiAgent', title: 'Priority Assessment' },
      { type: 'action', title: 'Schedule Reminders' },
      { type: 'notification', title: 'Team Alert' }
    ],
    triggers: [{ event: 'deadline.created' }],
    conditions: []
  },
  {
    id: 'workflow_document_processing',
    name: 'Document Processing Pipeline',
    description: 'Automated document classification and routing',
    created: '2024-01-05T11:30:00Z',
    version: '1.1',
    nodes: [],
    edges: [],
    steps: [
      { type: 'trigger', title: 'Document Upload' },
      { type: 'aiAgent', title: 'Document Classifier' },
      { type: 'condition', title: 'Document Type' },
      { type: 'action', title: 'Route to Team' },
      { type: 'notification', title: 'Processing Complete' }
    ],
    triggers: [{ event: 'document.upload' }],
    conditions: [{ expression: 'document_type == "contract"' }]
  }
];

export function SavedWorkflowList({ onLoadWorkflow, onCreateNew }: SavedWorkflowListProps) {
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    // Load workflows from localStorage and merge with demo workflows
    const savedWorkflows = JSON.parse(localStorage.getItem('counselflow_workflows') || '[]');
    setWorkflows([...DEMO_WORKFLOWS, ...savedWorkflows]);
  }, []);

  // Filter and sort workflows
  const filteredWorkflows = workflows
    .filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || 
                             workflow.name.toLowerCase().includes(filterCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'version':
          return b.version.localeCompare(a.version);
        default:
          return 0;
      }
    });

  const deleteWorkflow = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
      setWorkflows(updatedWorkflows);
      
      // Update localStorage
      const customWorkflows = updatedWorkflows.filter(w => !DEMO_WORKFLOWS.find(demo => demo.id === w.id));
      localStorage.setItem('counselflow_workflows', JSON.stringify(customWorkflows));
    }
  };

  const duplicateWorkflow = (workflow: SavedWorkflow) => {
    const newWorkflow = {
      ...workflow,
      id: `workflow_${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      created: new Date().toISOString(),
      version: '1.0'
    };
    
    const updatedWorkflows = [...workflows, newWorkflow];
    setWorkflows(updatedWorkflows);
    
    // Update localStorage
    const customWorkflows = updatedWorkflows.filter(w => !DEMO_WORKFLOWS.find(demo => demo.id === w.id));
    localStorage.setItem('counselflow_workflows', JSON.stringify(customWorkflows));
  };

  const getWorkflowIcon = (workflow: SavedWorkflow) => {
    if (workflow.name.toLowerCase().includes('contract')) return '📄';
    if (workflow.name.toLowerCase().includes('client')) return '👤';
    if (workflow.name.toLowerCase().includes('compliance')) return '✅';
    if (workflow.name.toLowerCase().includes('deadline')) return '⏰';
    if (workflow.name.toLowerCase().includes('document')) return '📁';
    return '⚙️';
  };

  const getWorkflowComplexity = (workflow: SavedWorkflow) => {
    const stepCount = workflow.steps.length;
    if (stepCount <= 3) return { level: 'Simple', color: 'bg-green-100 text-green-700' };
    if (stepCount <= 6) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
    return { level: 'Complex', color: 'bg-red-100 text-red-700' };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Saved Workflows</h2>
            <p className="text-gray-600">Manage your automated legal workflows</p>
          </div>
          <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
            + Create New Workflow
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-64"
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'created', label: 'Sort by Created' },
              { value: 'name', label: 'Sort by Name' },
              { value: 'version', label: 'Sort by Version' }
            ]}
          />
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'contract', label: 'Contract Workflows' },
              { value: 'client', label: 'Client Workflows' },
              { value: 'compliance', label: 'Compliance Workflows' },
              { value: 'document', label: 'Document Workflows' }
            ]}
          />
        </div>
      </div>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map(workflow => {
          const complexity = getWorkflowComplexity(workflow);
          const isDemo = DEMO_WORKFLOWS.find(demo => demo.id === workflow.id);
          
          return (
            <Card key={workflow.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getWorkflowIcon(workflow)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">v{workflow.version}</span>
                      {isDemo && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Demo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${complexity.color}`}>
                  {complexity.level}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workflow.description}</p>

              {/* Workflow Steps Preview */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-2">Workflow Steps:</div>
                <div className="flex flex-wrap gap-1">
                  {workflow.steps.slice(0, 4).map((step, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                      title={step.title}
                    >
                      {step.type === 'trigger' ? '⚡' :
                       step.type === 'aiAgent' ? '🤖' :
                       step.type === 'action' ? '⚙️' :
                       step.type === 'condition' ? '❓' :
                       step.type === 'notification' ? '📧' : '•'}
                    </span>
                  ))}
                  {workflow.steps.length > 4 && (
                    <span className="text-xs text-gray-500">+{workflow.steps.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500 mb-4">
                <div>Created: {new Date(workflow.created).toLocaleDateString()}</div>
                <div>Steps: {workflow.steps.length}</div>
                <div>Triggers: {workflow.triggers.length}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onLoadWorkflow(workflow)}
                  className="flex-1"
                >
                  🔧 Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateWorkflow(workflow)}
                >
                  📋
                </Button>
                {!isDemo && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteWorkflow(workflow.id)}
                  >
                    🗑️
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium mb-2">No workflows found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first workflow to get started'}
          </p>
          <Button onClick={onCreateNew}>
            + Create New Workflow
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{workflows.length}</div>
          <div className="text-sm text-gray-600">Total Workflows</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600">
            {workflows.filter(w => w.steps.some(s => s.type === 'aiAgent')).length}
          </div>
          <div className="text-sm text-gray-600">AI-Powered</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {workflows.reduce((sum, w) => sum + w.steps.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Steps</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {workflows.filter(w => !DEMO_WORKFLOWS.find(demo => demo.id === w.id)).length}
          </div>
          <div className="text-sm text-gray-600">Custom Workflows</div>
        </Card>
      </div>
    </div>
  );
}

export default SavedWorkflowList;

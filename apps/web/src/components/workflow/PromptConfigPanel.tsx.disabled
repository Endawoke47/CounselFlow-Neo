import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface PromptConfigPanelProps {
  selectedNode: any;
  workflowNodes: any[];
  workflowEdges: any[];
  onUpdateNode: (nodeId: string, data: any) => void;
}

export function PromptConfigPanel({ 
  selectedNode, 
  workflowNodes, 
  workflowEdges, 
  onUpdateNode 
}: PromptConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('config');

  const generateWorkflowJSON = () => {
    return {
      nodes: workflowNodes.map(node => ({
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position
      })),
      edges: workflowEdges,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Workflow Configuration</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="config">Node Config</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="preview">JSON Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {selectedNode ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Node Title</label>
                  <Input
                    value={selectedNode?.data?.title || ''}
                    onChange={(e) => onUpdateNode(selectedNode.id, {
                      ...selectedNode?.data,
                      title: e.target.value
                    })}
                    placeholder="Enter node title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-md text-sm"
                    rows={3}
                    value={selectedNode?.data?.description || ''}
                    onChange={(e) => onUpdateNode(selectedNode.id, {
                      ...selectedNode?.data,
                      description: e.target.value
                    })}
                    placeholder="Enter description..."
                  />
                </div>

                {/* AI Agent specific configuration */}
                {selectedNode.type === 'aiAgent' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">AI Model</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedNode?.data?.model || 'gpt-4'}
                        onChange={(e) => onUpdateNode(selectedNode.id, {
                          ...selectedNode?.data,
                          model: e.target.value
                        })}
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-3">Claude-3</option>
                        <option value="gemini-pro">Gemini Pro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">AI Prompt</label>
                      <textarea
                        className="w-full p-2 border rounded-md text-sm"
                        rows={6}
                        value={selectedNode?.data?.prompt || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, {
                          ...selectedNode?.data,
                          prompt: e.target.value
                        })}
                        placeholder="Enter your AI prompt here..."
                      />
                    </div>
                  </>
                )}

                {/* Trigger specific configuration */}
                {selectedNode.type === 'trigger' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Trigger Event</label>
                    <Input
                      value={selectedNode?.data?.event || ''}
                      onChange={(e) => onUpdateNode(selectedNode.id, {
                        ...selectedNode?.data,
                        event: e.target.value
                      })}
                      placeholder="e.g., document.uploaded"
                    />
                  </div>
                )}

                {/* Condition specific configuration */}
                {selectedNode.type === 'condition' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Condition Logic</label>
                    <Input
                      value={selectedNode?.data?.condition || ''}
                      onChange={(e) => onUpdateNode(selectedNode.id, {
                        ...selectedNode?.data,
                        condition: e.target.value
                      })}
                      placeholder="e.g., score > 0.8"
                    />
                  </div>
                )}

                {/* Action specific configuration */}
                {selectedNode.type === 'action' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Action Type</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={selectedNode?.data?.action || ''}
                      onChange={(e) => onUpdateNode(selectedNode.id, {
                        ...selectedNode?.data,
                        action: e.target.value
                      })}
                    >
                      <option value="">Select an action</option>
                      <option value="send-email">Send Email</option>
                      <option value="update-database">Update Database</option>
                      <option value="generate-document">Generate Document</option>
                      <option value="create-task">Create Task</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">Select a node to configure its properties</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="flex-1 overflow-y-auto p-4">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Workflow Overview</h3>
            <p className="text-gray-600 mb-4">Visual representation of your workflow</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Nodes: {workflowNodes.length} | Connections: {workflowEdges.length}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Workflow JSON</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(generateWorkflowJSON(), null, 2)}
            </pre>
            <Button onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(generateWorkflowJSON(), null, 2));
            }}>
              Copy to Clipboard
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PromptConfigPanel;

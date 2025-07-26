import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Components
const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-3 border-2 rounded-lg bg-green-100 border-green-400 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">⚡</span>
      <span className="font-medium text-sm">{data.title}</span>
    </div>
    <p className="text-xs text-gray-600">{data.description}</p>
    <div className="mt-2 text-xs bg-green-200 px-2 py-1 rounded">
      Trigger: {data.event || 'Not configured'}
    </div>
  </div>
);

const AIAgentNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-3 border-2 rounded-lg bg-purple-100 border-purple-400 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">🤖</span>
      <span className="font-medium text-sm">{data.title}</span>
    </div>
    <p className="text-xs text-gray-600">{data.description}</p>
    <div className="mt-2 text-xs bg-purple-200 px-2 py-1 rounded truncate">
      AI: {data.prompt || 'No prompt configured'}
    </div>
  </div>
);

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-3 border-2 rounded-lg bg-blue-100 border-blue-400 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">⚙️</span>
      <span className="font-medium text-sm">{data.title}</span>
    </div>
    <p className="text-xs text-gray-600">{data.description}</p>
    <div className="mt-2 text-xs bg-blue-200 px-2 py-1 rounded">
      Action: {data.action || 'Not configured'}
    </div>
  </div>
);

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-3 border-2 rounded-lg bg-yellow-100 border-yellow-400 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">❓</span>
      <span className="font-medium text-sm">{data.title}</span>
    </div>
    <p className="text-xs text-gray-600">{data.description}</p>
    <div className="mt-2 text-xs bg-yellow-200 px-2 py-1 rounded">
      If: {data.condition || 'No condition set'}
    </div>
  </div>
);

const NotificationNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-3 border-2 rounded-lg bg-pink-100 border-pink-400 ${selected ? 'ring-2 ring-blue-500' : ''}`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">📧</span>
      <span className="font-medium text-sm">{data.title}</span>
    </div>
    <p className="text-xs text-gray-600">{data.description}</p>
    <div className="mt-2 text-xs bg-pink-200 px-2 py-1 rounded">
      To: {data.recipients || 'No recipients'}
    </div>
  </div>
);

// Node types mapping
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  aiAgent: AIAgentNode,
  action: ActionNode,
  condition: ConditionNode,
  notification: NotificationNode,
};

// Initial example workflow
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: {
      title: 'Contract Uploaded',
      description: 'Triggered when new contract is uploaded',
      event: 'contract.upload'
    },
  },
  {
    id: '2',
    type: 'aiAgent',
    position: { x: 350, y: 100 },
    data: {
      title: 'AI Contract Analysis',
      description: 'Analyze contract for risks and obligations',
      prompt: 'Analyze this contract for potential risks, missing clauses, and extract key obligations'
    },
  },
  {
    id: '3',
    type: 'condition',
    position: { x: 600, y: 100 },
    data: {
      title: 'High Risk Check',
      description: 'Check if contract has high-risk issues',
      condition: 'risk_score > 0.7'
    },
  },
  {
    id: '4',
    type: 'action',
    position: { x: 850, y: 50 },
    data: {
      title: 'Save to Matter',
      description: 'Save analysis results to matter file',
      action: 'save_to_matter'
    },
  },
  {
    id: '5',
    type: 'notification',
    position: { x: 850, y: 150 },
    data: {
      title: 'Alert Legal Team',
      description: 'Send high-risk alert to legal team',
      recipients: 'legal-team@firm.com'
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    animated: true,
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'smoothstep',
    animated: true,
    label: 'Low Risk',
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    type: 'smoothstep',
    animated: true,
    label: 'High Risk',
  },
];

interface WorkflowDesignerCanvasProps {
  onNodeSelect: (node: Node | null) => void;
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  selectedNode: Node | null;
}

export function WorkflowDesignerCanvas({ 
  onNodeSelect, 
  onNodesChange, 
  onEdgesChange,
  selectedNode 
}: WorkflowDesignerCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = addEdge({ ...params, type: 'smoothstep', animated: true }, edges);
      setEdges(newEdge);
      onEdgesChange(newEdge);
    },
    [edges, setEdges, onEdgesChange],
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeSelect(node);
    },
    [onNodeSelect],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Handle nodes change and update parent
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      setNodes((nds) => {
        onNodesChange(nds);
        return nds;
      });
    },
    [onNodesChangeInternal, setNodes, onNodesChange],
  );

  // Handle edges change and update parent
  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      setEdges((eds) => {
        onEdgesChange(eds);
        return eds;
      });
    },
    [onEdgesChangeInternal, setEdges, onEdgesChange],
  );

  // Add new node
  const addNode = useCallback(
    (type: string, position = { x: 200, y: 200 }) => {
      const nodeDefaults: Record<string, any> = {
        trigger: {
          title: 'New Trigger',
          description: 'Configure trigger event',
          event: ''
        },
        aiAgent: {
          title: 'New AI Agent',
          description: 'Configure AI prompt and analysis',
          prompt: ''
        },
        action: {
          title: 'New Action',
          description: 'Configure action to perform',
          action: ''
        },
        condition: {
          title: 'New Condition',
          description: 'Configure decision logic',
          condition: ''
        },
        notification: {
          title: 'New Notification',
          description: 'Configure notification settings',
          recipients: ''
        }
      };

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: nodeDefaults[type] || { title: 'New Node', description: 'Configure this node' },
      };

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
        onNodesChange(updatedNodes);
        return updatedNodes;
      });
    },
    [setNodes, onNodesChange],
  );

  // Expose addNode to parent component
  React.useImperativeHandle(onNodeSelect, () => ({
    addNode,
  }));

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        className="workflow-canvas"
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger': return '#22c55e';
              case 'aiAgent': return '#a855f7';
              case 'action': return '#3b82f6';
              case 'condition': return '#eab308';
              case 'notification': return '#ec4899';
              default: return '#6b7280';
            }
          }}
          className="!bg-white"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default WorkflowDesignerCanvas;

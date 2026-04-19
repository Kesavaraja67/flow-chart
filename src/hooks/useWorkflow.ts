import { useCallback } from 'react';
import type { Connection, Edge, Node, NodeChange } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeType, WorkflowEdge } from '../types/workflow';
import { getDefaultData } from '../types/workflow';

const VALID_TYPES: NodeType[] = ['start', 'task', 'approval', 'automated', 'end'];

export function useWorkflow() {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorkflowStore(s => s.addNode);
  const addEdge = useWorkflowStore(s => s.addEdge);
  const deleteNode = useWorkflowStore(s => s.deleteNode);
  const deleteEdge = useWorkflowStore(s => s.deleteEdge);
  const setSelectedNode = useWorkflowStore(s => s.setSelectedNode);
  const updateNodePosition = useWorkflowStore(s => s.updateNodePosition);
  const nodes = useWorkflowStore(s => s.nodes);

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      const edge: WorkflowEdge = {
        id: crypto.randomUUID(),
        source: conn.source,
        target: conn.target,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
      };
      addEdge(edge);
    },
    [addEdge],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('application/reactflow') as NodeType;
      if (!VALID_TYPES.includes(nodeType)) return;

      if (nodeType === 'start' && nodes.some(n => n.type === 'start')) {
        window.alert('Only one Start node is allowed.');
        return;
      }

      const bounds = e.currentTarget.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      addNode({
        id: crypto.randomUUID(),
        type: nodeType,
        position,
        data: getDefaultData(nodeType),
      });
    },
    [addNode, nodes, screenToFlowPosition],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onNodesDelete = useCallback(
    (nodes: Node[]) => {
      nodes.forEach(n => deleteNode(n.id));
    },
    [deleteNode],
  );

  const onEdgesDelete = useCallback(
    (edges: Edge[]) => {
      edges.forEach(edge => deleteEdge(edge.id));
    },
    [deleteEdge],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach(change => {
        if (
          change.type === 'position' &&
          'dragging' in change &&
          change.dragging === false &&
          'position' in change &&
          change.position
        ) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [updateNodePosition],
  );

  return {
    onConnect,
    onDragOver,
    onDrop,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
    onEdgesDelete,
    onNodesChange,
  };
}

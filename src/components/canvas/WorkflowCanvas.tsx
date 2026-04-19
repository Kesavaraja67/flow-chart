import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useWorkflowStore } from '../../store/workflowStore';
import { nodeTypes } from '../nodes/index';

export function WorkflowCanvas() {
  const zustandNodes = useWorkflowStore(s => s.nodes);
  const zustandEdges = useWorkflowStore(s => s.edges);
  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);
  const undo = useWorkflowStore(s => s.undo);
  const redo = useWorkflowStore(s => s.redo);
  const deleteEdge = useWorkflowStore(s => s.deleteEdge);

  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);

  useEffect(() => {
    setRfNodes(
      zustandNodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data as unknown as Record<string, unknown>,
        selected: n.id === selectedNodeId,
      })),
    );
  }, [zustandNodes, selectedNodeId]);

  useEffect(() => {
    setRfEdges(
      zustandEdges.map(e => ({
        id: e.id,
        type: 'default',
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        targetHandle: e.targetHandle ?? undefined,
        label: e.label,
      })),
    );
  }, [zustandEdges]);

  const {
    onConnect,
    onDragOver,
    onDrop,
    onNodeClick,
    onPaneClick,
    onNodesDelete,
    onEdgesDelete,
    onNodesChange: syncPositionsToStore,
  } = useWorkflow();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRfNodes(nds => applyNodeChanges(changes, nds));
      syncPositionsToStore(changes);
    },
    [syncPositionsToStore],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setRfEdges(eds => applyEdgeChanges(changes, eds));
      changes.forEach(c => {
        if (c.type === 'remove') {
          deleteEdge(c.id);
        }
      });
    },
    [deleteEdge],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const [isDragOver, setIsDragOver] = useState(false);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--color-accent)',
      },
      style: {
        stroke: 'var(--color-accent)',
        strokeWidth: 2,
      },
    }),
    [],
  );

  return (
    <div
      className={`w-full h-full min-h-0 min-w-0 ${isDragOver ? 'canvas-drag-over' : ''}`}
      style={{ background: 'var(--color-bg-0)' }}
      onDragOver={e => {
        onDragOver(e);
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => {
        onDrop(e);
        setIsDragOver(false);
      }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        panOnDrag
        zoomOnScroll
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{ stroke: 'var(--color-accent)', strokeWidth: 2 }}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.1} color="var(--color-grid-dot)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={2}
          zoomable
          pannable
          nodeColor={n => {
            const t = n.type ?? '';
            if (t === 'start') return 'var(--color-start)';
            if (t === 'task') return 'var(--color-task)';
            if (t === 'approval') return 'var(--color-approval)';
            if (t === 'automated') return 'var(--color-automated)';
            return 'var(--color-end)';
          }}
        />
      </ReactFlow>
    </div>
  );
}

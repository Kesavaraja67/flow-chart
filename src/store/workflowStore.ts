import { create } from 'zustand';
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  SimulationStatus,
  SimulationResult,
  AutomationAction,
  HistoryEntry,
} from '../types/workflow';
import { getAutomations } from '../api/automations';
import { simulateWorkflow } from '../api/simulate';
import { validateWorkflow } from '../api/simulate';

function cloneNodes(nodes: WorkflowNode[]): WorkflowNode[] {
  return JSON.parse(JSON.stringify(nodes)) as WorkflowNode[];
}

function cloneEdges(edges: WorkflowEdge[]): WorkflowEdge[] {
  return JSON.parse(JSON.stringify(edges)) as WorkflowEdge[];
}

const n1 = crypto.randomUUID();
const n2 = crypto.randomUUID();
const n3 = crypto.randomUUID();
const n4 = crypto.randomUUID();
const n5 = crypto.randomUUID();

const DEMO_NODES: WorkflowNode[] = [
  {
    id: n1,
    type: 'start',
    position: { x: 80, y: 180 },
    data: {
      type: 'start',
      title: 'Employee Onboarding',
      metadata: [
        { id: crypto.randomUUID(), key: 'department', value: 'Engineering' },
        { id: crypto.randomUUID(), key: 'startDate', value: '2025-08-01' },
      ],
    },
  },
  {
    id: n2,
    type: 'task',
    position: { x: 360, y: 80 },
    data: {
      type: 'task',
      title: 'Collect Documents',
      description: 'Gather ID proof, offer letter, PAN, bank details from new hire',
      assignee: 'HR Ops Team',
      dueDate: '2025-08-02',
      priority: 'high',
      customFields: [{ id: crypto.randomUUID(), key: 'checklist', value: 'ID, Bank, PAN' }],
    },
  },
  {
    id: n3,
    type: 'approval',
    position: { x: 640, y: 180 },
    data: {
      type: 'approval',
      title: 'Manager Sign-off',
      approverRole: 'Manager',
      autoApproveThreshold: 0,
      requiresComment: true,
    },
  },
  {
    id: n4,
    type: 'automated',
    position: { x: 360, y: 300 },
    data: {
      type: 'automated',
      title: 'Send Welcome Email',
      actionId: 'send_email',
      actionParams: {
        to: 'employee@company.com',
        subject: 'Welcome to Tredence!',
        body: 'Hi, welcome aboard.',
      },
      retryOnFailure: true,
    },
  },
  {
    id: n5,
    type: 'end',
    position: { x: 640, y: 380 },
    data: {
      type: 'end',
      title: 'Onboarding Complete',
      endMessage: 'Employee successfully onboarded. All systems updated.',
      generateSummary: true,
      notifyStakeholders: true,
    },
  },
];

const DEMO_EDGES: WorkflowEdge[] = [
  { id: crypto.randomUUID(), source: n1, target: n2 },
  { id: crypto.randomUUID(), source: n2, target: n3 },
  { id: crypto.randomUUID(), source: n3, target: n4 },
  { id: crypto.randomUUID(), source: n4, target: n5 },
];

const INITIAL_NODES = cloneNodes(DEMO_NODES);
const INITIAL_EDGES = cloneEdges(DEMO_EDGES);

function appendHistory(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  history: HistoryEntry[],
  historyIndex: number,
): { history: HistoryEntry[]; historyIndex: number } {
  const trimmed = history.slice(0, historyIndex + 1);
  const entry: HistoryEntry = {
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    timestamp: Date.now(),
  };
  const newHistory = [...trimmed, entry].slice(-50);
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  simulationStatus: SimulationStatus;
  simulationResult: SimulationResult | null;
  automations: AutomationAction[];
  isSandboxOpen: boolean;
  activeSimNodeId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
  nodeErrorsById: Record<string, string[]>;

  addNode: (node: WorkflowNode) => void;
  updateNodeData: (nodeId: string, patch: Partial<WorkflowNodeData>) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedNode: (id: string | null) => void;
  clearCanvas: () => void;
  loadDemoWorkflow: () => void;
  undo: () => void;
  redo: () => void;
  loadAutomations: () => Promise<void>;
  runSimulation: () => Promise<void>;
  toggleSandbox: () => void;
  exportWorkflow: () => void;
  importWorkflow: (json: string) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  selectedNodeId: null,
  simulationStatus: 'idle',
  simulationResult: null,
  automations: [],
  isSandboxOpen: false,
  activeSimNodeId: null,
  history: [
    {
      nodes: cloneNodes(INITIAL_NODES),
      edges: cloneEdges(INITIAL_EDGES),
      timestamp: Date.now(),
    },
  ],
  historyIndex: 0,
  nodeErrorsById: computeNodeErrors(INITIAL_NODES, INITIAL_EDGES),

  addNode: node =>
    set(state => {
      const nextNodes = [...state.nodes, node];
      const { history, historyIndex } = appendHistory(nextNodes, state.edges, state.history, state.historyIndex);
      return { nodes: nextNodes, history, historyIndex, nodeErrorsById: computeNodeErrors(nextNodes, state.edges) };
    }),

  updateNodeData: (nodeId, patch) =>
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...patch } as WorkflowNodeData } : n,
      ),
    })),

  updateNodePosition: (nodeId, position) =>
    set(state => ({
      nodes: state.nodes.map(n => (n.id === nodeId ? { ...n, position } : n)),
    })),

  deleteNode: nodeId =>
    set(state => {
      const nextNodes = state.nodes.filter(n => n.id !== nodeId);
      const nextEdges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
      const { history, historyIndex } = appendHistory(nextNodes, nextEdges, state.history, state.historyIndex);
      return {
        nodes: nextNodes,
        edges: nextEdges,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        history,
        historyIndex,
        nodeErrorsById: computeNodeErrors(nextNodes, nextEdges),
      };
    }),

  addEdge: edge =>
    set(state => {
      const exists = state.edges.some(e => e.source === edge.source && e.target === edge.target);
      if (exists) return state;
      const nextEdges = [...state.edges, edge];
      const { history, historyIndex } = appendHistory(state.nodes, nextEdges, state.history, state.historyIndex);
      return { edges: nextEdges, history, historyIndex, nodeErrorsById: computeNodeErrors(state.nodes, nextEdges) };
    }),

  deleteEdge: edgeId =>
    set(state => {
      if (!state.edges.some(e => e.id === edgeId)) return state;
      const nextEdges = state.edges.filter(e => e.id !== edgeId);
      const { history, historyIndex } = appendHistory(state.nodes, nextEdges, state.history, state.historyIndex);
      return { edges: nextEdges, history, historyIndex, nodeErrorsById: computeNodeErrors(state.nodes, nextEdges) };
    }),

  setSelectedNode: id => set({ selectedNodeId: id }),

  clearCanvas: () =>
    set(state => {
      const { history, historyIndex } = appendHistory([], [], state.history, state.historyIndex);
      return {
        nodes: [],
        edges: [],
        selectedNodeId: null,
        history,
        historyIndex,
        nodeErrorsById: {},
      };
    }),

  loadDemoWorkflow: () => {
    const nodes = cloneNodes(DEMO_NODES);
    const edges = cloneEdges(DEMO_EDGES);
    set({
      nodes,
      edges,
      selectedNodeId: null,
      history: [{ nodes: cloneNodes(nodes), edges: cloneEdges(edges), timestamp: Date.now() }],
      historyIndex: 0,
      simulationStatus: 'idle',
      simulationResult: null,
      activeSimNodeId: null,
      nodeErrorsById: computeNodeErrors(nodes, edges),
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      nodes: cloneNodes(prev.nodes),
      edges: cloneEdges(prev.edges),
      historyIndex: historyIndex - 1,
      selectedNodeId: null,
      nodeErrorsById: computeNodeErrors(prev.nodes, prev.edges),
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      nodes: cloneNodes(next.nodes),
      edges: cloneEdges(next.edges),
      historyIndex: historyIndex + 1,
      selectedNodeId: null,
      nodeErrorsById: computeNodeErrors(next.nodes, next.edges),
    });
  },

  loadAutomations: async () => {
    try {
      const res = await fetch('/api/automations', { method: 'GET' });
      if (!res.ok) throw new Error('bad status');
      const data = (await res.json()) as AutomationAction[];
      set({ automations: data });
    } catch {
      const automations = await getAutomations();
      set({ automations });
    }
  },

  runSimulation: async () => {
    const { nodes, edges } = get();
    set({
      simulationStatus: 'running',
      simulationResult: null,
      isSandboxOpen: true,
      activeSimNodeId: null,
    });

    let result: SimulationResult;
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!res.ok) throw new Error('bad status');
      result = (await res.json()) as SimulationResult;
    } catch {
      result = await simulateWorkflow(nodes, edges);
    }

    if (result.success && result.steps.length > 0) {
      for (const step of result.steps) {
        set({ activeSimNodeId: step.nodeId });
        await new Promise<void>(r => setTimeout(r, 700));
      }
    }

    set({
      simulationResult: result,
      simulationStatus: result.success ? 'complete' : 'error',
      activeSimNodeId: null,
    });
  },

  toggleSandbox: () => set(s => ({ isSandboxOpen: !s.isSandboxOpen })),

  exportWorkflow: () => {
    const { nodes, edges } = get();
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `workflow-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  },

  importWorkflow: (json: string) => {
    try {
      const parsed = JSON.parse(json) as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return;
      const nodes = cloneNodes(parsed.nodes);
      const edges = cloneEdges(parsed.edges);
      set({
        nodes,
        edges,
        selectedNodeId: null,
        history: [{ nodes: cloneNodes(nodes), edges: cloneEdges(edges), timestamp: Date.now() }],
        historyIndex: 0,
        simulationStatus: 'idle',
        simulationResult: null,
        activeSimNodeId: null,
        nodeErrorsById: computeNodeErrors(nodes, edges),
      });
    } catch {
      void 0;
    }
  },
}));

function computeNodeErrors(nodes: WorkflowNode[], edges: WorkflowEdge[]): Record<string, string[]> {
  const errorsById: Record<string, string[]> = Object.fromEntries(nodes.map(n => [n.id, [] as string[]]));

  const startNodes = nodes.filter(n => n.type === 'start');
  if (startNodes.length > 1) {
    startNodes.forEach(n => errorsById[n.id]?.push('Only one Start node allowed'));
  }

  const endNodes = nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    nodes.forEach(n => errorsById[n.id]?.push('Workflow needs at least one End node'));
  }

  nodes
    .filter(n => n.type !== 'start')
    .forEach(n => {
      const hasIncoming = edges.some(e => e.target === n.id);
      if (!hasIncoming) errorsById[n.id]?.push('Missing incoming connection');
    });

  nodes
    .filter(n => n.type !== 'end')
    .forEach(n => {
      const hasOutgoing = edges.some(e => e.source === n.id);
      if (!hasOutgoing) errorsById[n.id]?.push('Missing outgoing connection');
    });

  const validation = validateWorkflow(nodes, edges);
  if (!validation.valid) {
    // If cycle exists, mark all nodes (simple + clear for prototype).
    if (validation.errors.some(e => e.toLowerCase().includes('cycle'))) {
      nodes.forEach(n => errorsById[n.id]?.push('Cycle detected'));
    }
    if (validation.errors.some(e => e.toLowerCase().includes('exactly one start'))) {
      startNodes.forEach(n => errorsById[n.id]?.push('Start constraint violated'));
    }
  }

  return errorsById;
}

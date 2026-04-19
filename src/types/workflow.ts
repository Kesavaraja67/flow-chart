export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface MetadataField {
  id: string;
  key: string;
  value: string;
}

export interface StartNodeData {
  type: 'start';
  title: string;
  metadata: MetadataField[];
}

export interface TaskNodeData {
  type: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  customFields: MetadataField[];
}

export type ApproverRole = 'Manager' | 'HRBP' | 'Director' | 'VP';

export interface ApprovalNodeData {
  type: 'approval';
  title: string;
  approverRole: ApproverRole;
  autoApproveThreshold: number;
  requiresComment: boolean;
}

export interface AutomatedNodeData {
  type: 'automated';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
  retryOnFailure: boolean;
}

export interface EndNodeData {
  type: 'end';
  title: string;
  endMessage: string;
  generateSummary: boolean;
  notifyStakeholders: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export type SimulationStatus = 'idle' | 'running' | 'complete' | 'error';

export interface SimulationStep {
  stepNumber: number;
  nodeId: string;
  nodeType: NodeType;
  nodeTitle: string;
  status: 'success' | 'pending' | 'skipped' | 'error';
  message: string;
  timestamp: string;
  durationMs: number;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  summary: string;
  errors: string[];
  totalDurationMs: number;
}

export interface AutomationAction {
  id: string;
  label: string;
  description: string;
  params: string[];
  category: 'communication' | 'document' | 'integration' | 'notification';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  timestamp: number;
}

export function isStartData(d: WorkflowNodeData): d is StartNodeData {
  return d.type === 'start';
}

export function isTaskData(d: WorkflowNodeData): d is TaskNodeData {
  return d.type === 'task';
}

export function isApprovalData(d: WorkflowNodeData): d is ApprovalNodeData {
  return d.type === 'approval';
}

export function isAutomatedData(d: WorkflowNodeData): d is AutomatedNodeData {
  return d.type === 'automated';
}

export function isEndData(d: WorkflowNodeData): d is EndNodeData {
  return d.type === 'end';
}

export function getDefaultData(type: NodeType): WorkflowNodeData {
  switch (type) {
    case 'start':
      return { type: 'start', title: 'Start', metadata: [] };
    case 'task':
      return {
        type: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        customFields: [],
      };
    case 'approval':
      return {
        type: 'approval',
        title: 'Approval Required',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
        requiresComment: false,
      };
    case 'automated':
      return {
        type: 'automated',
        title: 'Automated Step',
        actionId: '',
        actionParams: {},
        retryOnFailure: false,
      };
    case 'end':
      return {
        type: 'end',
        title: 'End',
        endMessage: 'Workflow completed successfully.',
        generateSummary: true,
        notifyStakeholders: false,
      };
  }
}

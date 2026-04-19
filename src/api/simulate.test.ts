import { describe, expect, it } from 'vitest';
import { getExecutionOrder, simulateWorkflow, validateWorkflow } from './simulate';
import type { WorkflowEdge, WorkflowNode } from '../types/workflow';

function mkNode(id: string, type: WorkflowNode['type']): WorkflowNode {
  if (type === 'start') {
    return { id, type, position: { x: 0, y: 0 }, data: { type: 'start', title: 'Start', metadata: [] } };
  }
  if (type === 'task') {
    return {
      id,
      type,
      position: { x: 0, y: 0 },
      data: {
        type: 'task',
        title: 'Task',
        description: '',
        assignee: 'HR',
        dueDate: '',
        priority: 'medium',
        customFields: [],
      },
    };
  }
  if (type === 'approval') {
    return {
      id,
      type,
      position: { x: 0, y: 0 },
      data: { type: 'approval', title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0, requiresComment: false },
    };
  }
  if (type === 'automated') {
    return {
      id,
      type,
      position: { x: 0, y: 0 },
      data: { type: 'automated', title: 'Auto', actionId: 'send_email', actionParams: {}, retryOnFailure: false },
    };
  }
  return {
    id,
    type,
    position: { x: 0, y: 0 },
    data: {
      type: 'end',
      title: 'End',
      endMessage: 'done',
      generateSummary: true,
      notifyStakeholders: false,
    },
  };
}

describe('validateWorkflow', () => {
  it('fails when missing start or end', () => {
    const nodes: WorkflowNode[] = [mkNode('t1', 'task')];
    const edges: WorkflowEdge[] = [];
    const v = validateWorkflow(nodes, edges);
    expect(v.valid).toBe(false);
    expect(v.errors.join(' ')).toMatch(/Start/);
    expect(v.errors.join(' ')).toMatch(/End/);
  });

  it('detects cycles', () => {
    const a = mkNode('a', 'start');
    const b = mkNode('b', 'task');
    const nodes = [a, b, mkNode('e', 'end')];
    const edges: WorkflowEdge[] = [
      { id: '1', source: a.id, target: b.id },
      { id: '2', source: b.id, target: a.id },
    ];
    const v = validateWorkflow(nodes, edges);
    expect(v.valid).toBe(false);
    expect(v.errors.some(e => e.toLowerCase().includes('cycle'))).toBe(true);
  });
});

describe('getExecutionOrder', () => {
  it('starts traversal from start node', () => {
    const s = mkNode('s', 'start');
    const t = mkNode('t', 'task');
    const e = mkNode('e', 'end');
    const nodes = [t, e, s];
    const edges: WorkflowEdge[] = [
      { id: '1', source: s.id, target: t.id },
      { id: '2', source: t.id, target: e.id },
    ];
    const order = getExecutionOrder(nodes, edges);
    expect(order[0]?.id).toBe('s');
  });
});

describe('simulateWorkflow', () => {
  it('returns validation errors when invalid', async () => {
    const nodes: WorkflowNode[] = [mkNode('s', 'start')];
    const edges: WorkflowEdge[] = [];
    const r = await simulateWorkflow(nodes, edges);
    expect(r.success).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });
});


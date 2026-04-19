import type {
  WorkflowNode,
  WorkflowEdge,
  SimulationResult,
  SimulationStep,
  ValidationResult,
  NodeType,
} from '../types/workflow';

function str(data: WorkflowNode['data'], key: string): string {
  return String((data as unknown as Record<string, unknown>)[key] ?? '');
}

function num(data: WorkflowNode['data'], key: string): number {
  return Number((data as unknown as Record<string, unknown>)[key] ?? 0);
}

function bool(data: WorkflowNode['data'], key: string): boolean {
  return Boolean((data as unknown as Record<string, unknown>)[key]);
}

function arr(data: WorkflowNode['data'], key: string): unknown[] {
  const v = (data as unknown as Record<string, unknown>)[key];
  return Array.isArray(v) ? v : [];
}

export function validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult {
  const errors: string[] = [];

  const starts = nodes.filter(n => n.type === 'start');
  if (starts.length === 0) errors.push('Workflow must have exactly one Start node');
  else if (starts.length > 1)
    errors.push('Workflow must have exactly one Start node (found multiple)');

  const ends = nodes.filter(n => n.type === 'end');
  if (ends.length === 0) errors.push('Workflow must have at least one End node');

  nodes
    .filter(n => n.type !== 'start')
    .forEach(n => {
      if (!edges.some(e => e.target === n.id)) {
        errors.push(`"${str(n.data, 'title') || n.id}" has no incoming connection`);
      }
    });

  nodes
    .filter(n => n.type !== 'end')
    .forEach(n => {
      if (!edges.some(e => e.source === n.id)) {
        errors.push(`"${str(n.data, 'title') || n.id}" has no outgoing connection`);
      }
    });

  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => adj.get(e.source)?.push(e.target));

  const visited = new Set<string>();
  const stack = new Set<string>();
  let hasCycle = false;

  function dfs(id: string): void {
    if (stack.has(id)) {
      hasCycle = true;
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    for (const nb of adj.get(id) ?? []) dfs(nb);
    stack.delete(id);
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) dfs(n.id);
  });
  if (hasCycle) errors.push('Workflow contains a cycle — only linear flows are supported');

  return { valid: errors.length === 0, errors };
}

export function getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const map = new Map(nodes.map(n => [n.id, n]));
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => adj.get(e.source)?.push(e.target));

  const start = nodes.find(n => n.type === 'start');
  if (!start) return nodes;

  const visited = new Set<string>();
  const order: WorkflowNode[] = [];
  const queue = [start.id];

  while (queue.length) {
    const id = queue.shift();
    if (id === undefined) break;
    if (visited.has(id)) continue;
    visited.add(id);
    const n = map.get(id);
    if (n) order.push(n);
    queue.push(...(adj.get(id) ?? []));
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) order.push(n);
  });
  return order;
}

export async function simulateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): Promise<SimulationResult> {
  await new Promise<void>(r => setTimeout(r, 300));

  const validation = validateWorkflow(nodes, edges);
  if (!validation.valid) {
    return {
      success: false,
      steps: [],
      summary: 'Validation failed before execution.',
      errors: validation.errors,
      totalDurationMs: 0,
    };
  }

  const ordered = getExecutionOrder(nodes, edges);
  const steps: SimulationStep[] = [];
  const startTime = Date.now();

  for (const [index, node] of ordered.entries()) {
    await new Promise<void>(r => setTimeout(r, 80));
    const title = str(node.data, 'title') || node.id;
    let message = '';
    let status: SimulationStep['status'] = 'success';

    switch (node.type as NodeType) {
      case 'start': {
        const count = arr(node.data, 'metadata').length;
        message = `Workflow initiated: "${title}". ${count} metadata field${count !== 1 ? 's' : ''} loaded.`;
        break;
      }
      case 'task': {
        const assignee = str(node.data, 'assignee') || 'Unassigned';
        const due = str(node.data, 'dueDate') || 'No deadline';
        const priority = str(node.data, 'priority') || 'medium';
        message = `Task "${title}" assigned to ${assignee} [${priority} priority]. Due: ${due}.`;
        break;
      }
      case 'approval': {
        const role = str(node.data, 'approverRole') || 'Manager';
        const threshold = num(node.data, 'autoApproveThreshold');
        const needsComment = bool(node.data, 'requiresComment');
        if (threshold > 0) {
          message = `Approval auto-approved by ${role} (threshold: ${threshold}).${needsComment ? ' Comment required.' : ''}`;
          status = 'success';
        } else {
          message = `Approval request sent to ${role} for manual review.${needsComment ? ' Comment required.' : ''}`;
          status = 'pending';
        }
        break;
      }
      case 'automated': {
        const actionId = str(node.data, 'actionId');
        const retry = bool(node.data, 'retryOnFailure');
        const params = (node.data as unknown as Record<string, unknown>)['actionParams'];
        const paramCount =
          params && typeof params === 'object' ? Object.keys(params as Record<string, unknown>).length : 0;
        if (!actionId) {
          message = `Automated step "${title}" has no action configured — step skipped.`;
          status = 'skipped';
        } else {
          message = `Executing "${actionId}" with ${paramCount} param(s).${retry ? ' Retry on failure enabled.' : ''}`;
          status = 'success';
        }
        break;
      }
      case 'end': {
        const msg = str(node.data, 'endMessage') || 'Workflow complete';
        const summary = bool(node.data, 'generateSummary');
        const notify = bool(node.data, 'notifyStakeholders');
        message = `${msg}${summary ? ' Summary report generated.' : ''}${notify ? ' Stakeholders notified.' : ''}`;
        break;
      }
    }

    const durationMs = Math.round(Math.random() * 180 + 40);

    steps.push({
      stepNumber: index + 1,
      nodeId: node.id,
      nodeType: node.type,
      nodeTitle: title,
      status,
      message,
      timestamp: new Date().toISOString(),
      durationMs,
    });
  }

  const totalMs = Date.now() - startTime;
  const successCount = steps.filter(s => s.status === 'success').length;
  const pendingCount = steps.filter(s => s.status === 'pending').length;
  const skippedCount = steps.filter(s => s.status === 'skipped').length;

  return {
    success: true,
    steps,
    summary: `${steps.length} steps executed in ${totalMs}ms — ${successCount} succeeded, ${pendingCount} pending, ${skippedCount} skipped.`,
    errors: [],
    totalDurationMs: totalMs,
  };
}

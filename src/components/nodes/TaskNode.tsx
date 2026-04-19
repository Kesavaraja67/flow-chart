import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { TaskNodeData } from '../../types/workflow';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--color-error)',
  medium: 'var(--color-warning)',
  low: 'var(--color-success)',
};

export const TaskNode = memo(function TaskNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as TaskNodeData;
  const activeSimNodeId = useWorkflowStore(s => s.activeSimNodeId);
  const isSimActive = activeSimNodeId === id;
  const nodeErrors = useWorkflowStore(s => s.nodeErrorsById[id] ?? []);
  const isInvalid = nodeErrors.length > 0;

  const initials = d.assignee
    ? d.assignee
        .split(' ')
        .map((w: string) => w[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={[
        'wf-node type-task',
        selected ? 'selected' : '',
        isSimActive ? 'sim-active' : '',
        isInvalid ? 'invalid' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="wf-node-header">
        <div className="wf-node-header-row">
          <div className="wf-node-title-wrap">
            <span className="wf-node-icon">✓</span>
            <span className="wf-node-title">{d.title || 'Task'}</span>
          </div>
          {isInvalid ? (
            <span className="node-error-pill" title={nodeErrors.join('\n')}>
              ⚠ {nodeErrors.length}
            </span>
          ) : (
            <span
              className="wf-node-status-dot"
              style={{
                background: d.assignee ? 'var(--color-success)' : 'var(--color-error)',
                boxShadow: d.assignee
                  ? '0 0 9px rgba(34, 197, 94, 0.65)'
                  : '0 0 9px rgba(248, 113, 113, 0.65)',
              }}
            />
          )}
        </div>
        <span
          className="wf-node-tag"
          style={{
            color: 'var(--color-task)',
            background: 'rgba(56, 189, 248, 0.12)',
            borderColor: 'rgba(56, 189, 248, 0.35)',
          }}
        >
          Human Task
        </span>
      </div>
      <div className="wf-node-body">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: d.dueDate ? '6px' : '0',
          }}
        >
          <span
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 700,
              color: 'var(--color-text-1)',
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-2)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '148px',
            }}
          >
            {d.assignee || 'Unassigned'}
          </span>
          {d.priority ? (
            <span
              className="wf-node-chip"
              style={{
                marginLeft: 'auto',
                color: PRIORITY_COLORS[d.priority] ?? 'var(--color-text-3)',
                background: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'var(--color-border-2)',
                textTransform: 'capitalize',
              }}
            >
              ● {d.priority}
            </span>
          ) : null}
        </div>
        {d.dueDate ? (
          <p
            style={{
              fontSize: '11px',
              color: 'var(--color-text-3)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            📅 {d.dueDate}
          </p>
        ) : null}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

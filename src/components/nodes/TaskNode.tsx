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
      <div style={{ padding: '12px 14px 10px 18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>✓</span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-1)',
                maxWidth: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.title || 'Task'}
            </span>
          </div>
          {isInvalid ? (
            <span className="node-error-pill" title={nodeErrors.join('\n')}>
              ⚠ {nodeErrors.length}
            </span>
          ) : (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: d.assignee ? 'var(--color-success)' : 'var(--color-error)',
                boxShadow: d.assignee ? '0 0 6px var(--color-success)' : '0 0 6px var(--color-error)',
                display: 'block',
                flexShrink: 0,
              }}
            />
          )}
        </div>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--color-task)',
            background: 'rgba(59,130,246,0.12)',
            padding: '2px 7px',
            borderRadius: '4px',
          }}
        >
          Human Task
        </span>
      </div>
      <div style={{ padding: '8px 14px 12px 18px', borderTop: '1px solid var(--color-border-1)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            marginBottom: d.dueDate ? '4px' : '0',
          }}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--color-task)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 700,
              color: '#fff',
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
              maxWidth: '140px',
            }}
          >
            {d.assignee || 'Unassigned'}
          </span>
          {d.priority ? (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: PRIORITY_COLORS[d.priority] ?? 'var(--color-text-3)',
                marginLeft: 'auto',
                flexShrink: 0,
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
              marginTop: '2px',
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

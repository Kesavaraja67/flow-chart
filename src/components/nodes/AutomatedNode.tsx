import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { AutomatedNodeData } from '../../types/workflow';

export const AutomatedNode = memo(function AutomatedNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as AutomatedNodeData;
  const activeSimNodeId = useWorkflowStore(s => s.activeSimNodeId);
  const isSimActive = activeSimNodeId === id;
  const automations = useWorkflowStore(s => s.automations);
  const action = automations.find(a => a.id === d.actionId);
  const nodeErrors = useWorkflowStore(s => s.nodeErrorsById[id] ?? []);
  const isInvalid = nodeErrors.length > 0;

  return (
    <div
      className={[
        'wf-node type-automated',
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
            <span style={{ fontSize: '14px' }}>⚡</span>
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
              {d.title || 'Automated'}
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
                background: d.actionId ? 'var(--color-success)' : 'var(--color-error)',
                boxShadow: d.actionId ? '0 0 6px var(--color-success)' : '0 0 6px var(--color-error)',
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
            color: 'var(--color-automated)',
            background: 'rgba(139,92,246,0.12)',
            padding: '2px 7px',
            borderRadius: '4px',
          }}
        >
          Automation
        </span>
      </div>
      <div style={{ padding: '8px 14px 12px 18px', borderTop: '1px solid var(--color-border-1)' }}>
        <p
          style={{
            fontSize: '12px',
            color: d.actionId ? 'var(--color-automated)' : 'var(--color-text-3)',
            fontStyle: d.actionId ? 'normal' : 'italic',
          }}
        >
          {action ? action.label : d.actionId || 'No action configured'}
        </p>
        {d.retryOnFailure ? (
          <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '2px' }}>
            ↺ Retry on failure
          </p>
        ) : null}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

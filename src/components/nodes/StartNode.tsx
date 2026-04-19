import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { StartNodeData } from '../../types/workflow';

export const StartNode = memo(function StartNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as StartNodeData;
  const activeSimNodeId = useWorkflowStore(s => s.activeSimNodeId);
  const isSimActive = activeSimNodeId === id;
  const nodeErrors = useWorkflowStore(s => s.nodeErrorsById[id] ?? []);
  const isInvalid = nodeErrors.length > 0;

  return (
    <div
      className={[
        'wf-node type-start',
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
            <span style={{ fontSize: '14px' }}>▶</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)' }}>
              {d.title || 'Start'}
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
                background: 'var(--color-start)',
                boxShadow: '0 0 6px var(--color-start)',
                display: 'block',
                flexShrink: 0,
              }}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--color-start)',
              background: 'rgba(16,185,129,0.12)',
              padding: '2px 7px',
              borderRadius: '4px',
            }}
          >
            Trigger
          </span>
          {d.metadata && d.metadata.length > 0 ? (
            <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
              {d.metadata.length} field{d.metadata.length !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

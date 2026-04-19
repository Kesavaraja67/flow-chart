import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { ApprovalNodeData } from '../../types/workflow';

export const ApprovalNode = memo(function ApprovalNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as ApprovalNodeData;
  const activeSimNodeId = useWorkflowStore(s => s.activeSimNodeId);
  const isSimActive = activeSimNodeId === id;
  const nodeErrors = useWorkflowStore(s => s.nodeErrorsById[id] ?? []);
  const isInvalid = nodeErrors.length > 0;

  return (
    <div
      className={[
        'wf-node type-approval',
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
            <span style={{ fontSize: '14px' }}>◇</span>
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
              {d.title || 'Approval'}
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
                background: 'var(--color-approval)',
                boxShadow: '0 0 6px var(--color-approval)',
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
            color: 'var(--color-approval)',
            background: 'rgba(245,158,11,0.12)',
            padding: '2px 7px',
            borderRadius: '4px',
          }}
        >
          Approval Gate
        </span>
      </div>
      <div style={{ padding: '8px 14px 12px 18px', borderTop: '1px solid var(--color-border-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-approval)',
              background: 'rgba(245,158,11,0.12)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {d.approverRole}
          </span>
          {d.autoApproveThreshold > 0 ? (
            <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
              Auto ≥ {d.autoApproveThreshold}
            </span>
          ) : null}
          {d.requiresComment ? (
            <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>💬</span>
          ) : null}
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

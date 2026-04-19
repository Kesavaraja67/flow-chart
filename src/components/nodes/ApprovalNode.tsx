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
      <div className="wf-node-header">
        <div className="wf-node-header-row">
          <div className="wf-node-title-wrap">
            <span className="wf-node-icon">◇</span>
            <span className="wf-node-title">{d.title || 'Approval'}</span>
          </div>
          {isInvalid ? (
            <span className="node-error-pill" title={nodeErrors.join('\n')}>
              ⚠ {nodeErrors.length}
            </span>
          ) : (
            <span
              className="wf-node-status-dot"
              style={{
                background: 'var(--color-approval)',
                boxShadow: '0 0 9px rgba(245, 158, 11, 0.7)',
              }}
            />
          )}
        </div>
        <span
          className="wf-node-tag"
          style={{
            color: 'var(--color-approval)',
            background: 'rgba(245, 158, 11, 0.13)',
            borderColor: 'rgba(245, 158, 11, 0.35)',
          }}
        >
          Approval Gate
        </span>
      </div>
      <div className="wf-node-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            className="wf-node-chip"
            style={{
              color: 'var(--color-approval)',
              background: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'rgba(245, 158, 11, 0.28)',
            }}
          >
            {d.approverRole}
          </span>
          {d.autoApproveThreshold > 0 ? (
            <span className="wf-node-meta-text">Auto ≥ {d.autoApproveThreshold}</span>
          ) : null}
          {d.requiresComment ? (
            <span className="wf-node-meta-text" style={{ color: 'var(--color-text-2)' }}>
              💬
            </span>
          ) : null}
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

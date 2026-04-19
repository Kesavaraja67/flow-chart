import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { EndNodeData } from '../../types/workflow';

export const EndNode = memo(function EndNode({ id, data, selected }: NodeProps) {
  const d = data as unknown as EndNodeData;
  const activeSimNodeId = useWorkflowStore(s => s.activeSimNodeId);
  const isSimActive = activeSimNodeId === id;
  const nodeErrors = useWorkflowStore(s => s.nodeErrorsById[id] ?? []);
  const isInvalid = nodeErrors.length > 0;

  return (
    <div
      className={[
        'wf-node type-end',
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
            <span className="wf-node-icon">■</span>
            <span className="wf-node-title">{d.title || 'End'}</span>
          </div>
          {isInvalid ? (
            <span className="node-error-pill" title={nodeErrors.join('\n')}>
              ⚠ {nodeErrors.length}
            </span>
          ) : (
            <span
              className="wf-node-status-dot"
              style={{
                background: 'var(--color-end)',
                boxShadow: '0 0 9px rgba(248, 113, 113, 0.7)',
              }}
            />
          )}
        </div>
        <span
          className="wf-node-tag"
          style={{
            color: 'var(--color-end)',
            background: 'rgba(248, 113, 113, 0.12)',
            borderColor: 'rgba(248, 113, 113, 0.32)',
          }}
        >
          Terminal
        </span>
      </div>
      <div className="wf-node-body">
        {d.endMessage ? (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-2)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '208px',
              marginBottom: '6px',
            }}
          >
            {d.endMessage.slice(0, 35)}
            {d.endMessage.length > 35 ? '…' : ''}
          </p>
        ) : null}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <span
            className="wf-node-muted-pill"
            style={{
              color: d.generateSummary ? 'var(--color-success)' : 'var(--color-text-3)',
              background: d.generateSummary ? 'rgba(34, 197, 94, 0.11)' : 'rgba(255, 255, 255, 0.02)',
              borderColor: d.generateSummary ? 'rgba(34, 197, 94, 0.25)' : 'var(--color-border-1)',
            }}
          >
            {d.generateSummary ? '📋 Summary' : 'No summary'}
          </span>
          {d.notifyStakeholders ? (
            <span
              className="wf-node-muted-pill"
              style={{
                color: 'var(--color-info)',
                background: 'rgba(96, 165, 250, 0.12)',
                borderColor: 'rgba(96, 165, 250, 0.28)',
              }}
            >
              🔔 Notify
            </span>
          ) : null}
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
    </div>
  );
});

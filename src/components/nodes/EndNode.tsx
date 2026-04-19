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
            <span style={{ fontSize: '14px' }}>■</span>
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
              {d.title || 'End'}
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
                background: 'var(--color-end)',
                boxShadow: '0 0 6px var(--color-end)',
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
            color: 'var(--color-end)',
            background: 'rgba(239,68,68,0.12)',
            padding: '2px 7px',
            borderRadius: '4px',
          }}
        >
          Terminal
        </span>
      </div>
      <div style={{ padding: '8px 14px 12px 18px', borderTop: '1px solid var(--color-border-1)' }}>
        {d.endMessage ? (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-2)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '200px',
            }}
          >
            {d.endMessage.slice(0, 35)}
            {d.endMessage.length > 35 ? '…' : ''}
          </p>
        ) : null}
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '10px',
              color: d.generateSummary ? 'var(--color-success)' : 'var(--color-text-3)',
              background: d.generateSummary ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
              padding: '1px 6px',
              borderRadius: '3px',
            }}
          >
            {d.generateSummary ? '📋 Summary' : 'No summary'}
          </span>
          {d.notifyStakeholders ? (
            <span
              style={{
                fontSize: '10px',
                color: 'var(--color-info)',
                background: 'rgba(59,130,246,0.12)',
                padding: '1px 6px',
                borderRadius: '3px',
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

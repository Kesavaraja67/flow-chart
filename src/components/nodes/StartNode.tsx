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
      <div className="wf-node-header">
        <div className="wf-node-header-row">
          <div className="wf-node-title-wrap">
            <span className="wf-node-icon">▶</span>
            <span className="wf-node-title">{d.title || 'Start'}</span>
          </div>
          {isInvalid ? (
            <span className="node-error-pill" title={nodeErrors.join('\n')}>
              ⚠ {nodeErrors.length}
            </span>
          ) : (
            <span
              className="wf-node-status-dot"
              style={{
                background: 'var(--color-start)',
                boxShadow: '0 0 9px rgba(34, 197, 94, 0.75)',
              }}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="wf-node-tag"
            style={{
              color: 'var(--color-start)',
              background: 'rgba(34, 197, 94, 0.13)',
              borderColor: 'rgba(34, 197, 94, 0.35)',
            }}
          >
            Trigger
          </span>
          {d.metadata && d.metadata.length > 0 ? (
            <span className="wf-node-meta-text" style={{ color: 'var(--color-text-2)' }}>
              {d.metadata.length} field{d.metadata.length !== 1 ? 's' : ''}
            </span>
          ) : null}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

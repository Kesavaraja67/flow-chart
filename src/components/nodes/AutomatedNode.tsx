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
      <div className="wf-node-header">
        <div className="wf-node-header-row">
          <div className="wf-node-title-wrap">
            <span className="wf-node-icon">⚡</span>
            <span className="wf-node-title">{d.title || 'Automated'}</span>
          </div>
          {isInvalid ? (
            <span className="node-error-pill" title={nodeErrors.join('\n')}>
              ⚠ {nodeErrors.length}
            </span>
          ) : (
            <span
              className="wf-node-status-dot"
              style={{
                background: d.actionId ? 'var(--color-success)' : 'var(--color-error)',
                boxShadow: d.actionId
                  ? '0 0 9px rgba(34, 197, 94, 0.68)'
                  : '0 0 9px rgba(248, 113, 113, 0.65)',
              }}
            />
          )}
        </div>
        <span
          className="wf-node-tag"
          style={{
            color: 'var(--color-automated)',
            background: 'rgba(139, 92, 246, 0.16)',
            borderColor: 'rgba(139, 92, 246, 0.35)',
          }}
        >
          Automation
        </span>
      </div>
      <div className="wf-node-body">
        <p
          style={{
            fontSize: '12px',
            color: d.actionId ? 'var(--color-text-2)' : 'var(--color-text-3)',
            fontStyle: d.actionId ? 'normal' : 'italic',
          }}
        >
          {action ? action.label : d.actionId || 'No action configured'}
        </p>
        {d.retryOnFailure ? (
          <p style={{ fontSize: '11px', color: 'var(--color-automated)', marginTop: '5px' }}>
            ↺ Retry on failure
          </p>
        ) : null}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

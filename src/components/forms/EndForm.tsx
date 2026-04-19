import { useWorkflowStore } from '../../store/workflowStore';
import type { EndNodeData, WorkflowNode } from '../../types/workflow';

interface Props {
  node: WorkflowNode & { data: EndNodeData };
}

export function EndForm({ node }: Props) {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data;

  const update = (patch: Partial<EndNodeData>) => {
    updateNodeData(node.id, patch);
  };

  return (
    <div>
      <div className="wf-field">
        <label className="wf-label" htmlFor={`end-title-${node.id}`}>
          Title
        </label>
        <input
          id={`end-title-${node.id}`}
          type="text"
          value={data.title}
          onChange={e => update({ title: e.target.value })}
          className="wf-input"
        />
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`end-msg-${node.id}`}>
          Completion message
        </label>
        <textarea
          id={`end-msg-${node.id}`}
          rows={3}
          value={data.endMessage}
          onChange={e => update({ endMessage: e.target.value })}
          className="wf-input"
          style={{ resize: 'none' }}
        />
      </div>

      <div className="wf-field">
        <span className="wf-label">Generate summary</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => update({ generateSummary: true })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: data.generateSummary ? 'rgba(16,185,129,0.2)' : 'var(--color-bg-1)',
              color: data.generateSummary ? 'var(--color-success)' : 'var(--color-text-3)',
              border: `1px solid ${data.generateSummary ? 'var(--color-success)' : 'var(--color-border-1)'}`,
            }}
          >
            On
          </button>
          <button
            type="button"
            onClick={() => update({ generateSummary: false })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: !data.generateSummary ? 'var(--color-bg-4)' : 'var(--color-bg-1)',
              color: 'var(--color-text-2)',
              border: '1px solid var(--color-border-1)',
            }}
          >
            Off
          </button>
        </div>
      </div>

      <div className="wf-field">
        <span className="wf-label">Notify stakeholders</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => update({ notifyStakeholders: true })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: data.notifyStakeholders ? 'rgba(59,130,246,0.2)' : 'var(--color-bg-1)',
              color: data.notifyStakeholders ? 'var(--color-info)' : 'var(--color-text-3)',
              border: `1px solid ${data.notifyStakeholders ? 'var(--color-info)' : 'var(--color-border-1)'}`,
            }}
          >
            On
          </button>
          <button
            type="button"
            onClick={() => update({ notifyStakeholders: false })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: !data.notifyStakeholders ? 'var(--color-bg-4)' : 'var(--color-bg-1)',
              color: 'var(--color-text-2)',
              border: '1px solid var(--color-border-1)',
            }}
          >
            Off
          </button>
        </div>
      </div>
    </div>
  );
}

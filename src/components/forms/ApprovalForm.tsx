import { useWorkflowStore } from '../../store/workflowStore';
import type { ApprovalNodeData, ApproverRole, WorkflowNode } from '../../types/workflow';

interface Props {
  node: WorkflowNode & { data: ApprovalNodeData };
}

const ROLES: ApproverRole[] = ['Manager', 'HRBP', 'Director', 'VP'];

export function ApprovalForm({ node }: Props) {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data;

  const update = (patch: Partial<ApprovalNodeData>) => {
    updateNodeData(node.id, patch);
  };

  return (
    <div>
      <div className="wf-field">
        <label className="wf-label" htmlFor={`ap-title-${node.id}`}>
          Title
        </label>
        <input
          id={`ap-title-${node.id}`}
          type="text"
          value={data.title}
          onChange={e => update({ title: e.target.value })}
          className="wf-input"
        />
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`ap-role-${node.id}`}>
          Approver role
        </label>
        <select
          id={`ap-role-${node.id}`}
          value={data.approverRole}
          onChange={e => update({ approverRole: e.target.value as ApproverRole })}
          className="wf-input"
        >
          {ROLES.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`ap-threshold-${node.id}`}>
          Auto-approve threshold
        </label>
        <input
          id={`ap-threshold-${node.id}`}
          type="number"
          min={0}
          step={1}
          value={data.autoApproveThreshold}
          onChange={e => update({ autoApproveThreshold: Number(e.target.value) })}
          className="wf-input"
        />
        <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginTop: '6px' }}>
          Set to 0 for manual approval only
        </p>
      </div>

      <div className="wf-field">
        <span className="wf-label">Require comment</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => update({ requiresComment: true })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: data.requiresComment ? 'rgba(245,158,11,0.2)' : 'var(--color-bg-1)',
              color: data.requiresComment ? 'var(--color-approval)' : 'var(--color-text-3)',
              border: `1px solid ${data.requiresComment ? 'var(--color-approval)' : 'var(--color-border-1)'}`,
            }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => update({ requiresComment: false })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: !data.requiresComment ? 'var(--color-bg-4)' : 'var(--color-bg-1)',
              color: 'var(--color-text-2)',
              border: '1px solid var(--color-border-1)',
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

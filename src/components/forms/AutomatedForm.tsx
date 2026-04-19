import { useMemo } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { AutomatedNodeData, WorkflowNode } from '../../types/workflow';

interface Props {
  node: WorkflowNode & { data: AutomatedNodeData };
}

const CATEGORY_LABEL: Record<string, string> = {
  communication: 'Communication',
  document: 'Document',
  integration: 'Integration',
  notification: 'Notification',
};

export function AutomatedForm({ node }: Props) {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const automations = useWorkflowStore(s => s.automations);
  const data = node.data;

  const update = (patch: Partial<AutomatedNodeData>) => {
    updateNodeData(node.id, patch);
  };

  const selectedAction = automations.find(a => a.id === data.actionId);

  const byCategory = useMemo(() => {
    const map = new Map<string, typeof automations>();
    automations.forEach(a => {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    });
    return map;
  }, [automations]);

  const handleActionChange = (actionId: string) => {
    update({ actionId, actionParams: {} });
  };

  const handleParamChange = (param: string, value: string) => {
    update({
      actionParams: { ...data.actionParams, [param]: value },
    });
  };

  return (
    <div>
      <div className="wf-field">
        <label className="wf-label" htmlFor={`auto-title-${node.id}`}>
          Step title
        </label>
        <input
          id={`auto-title-${node.id}`}
          type="text"
          value={data.title}
          onChange={e => update({ title: e.target.value })}
          className="wf-input"
        />
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`auto-action-${node.id}`}>
          Action
        </label>
        <select
          id={`auto-action-${node.id}`}
          value={data.actionId}
          onChange={e => handleActionChange(e.target.value)}
          className="wf-input"
        >
          <option value="">Select an action…</option>
          {Array.from(byCategory.entries()).map(([cat, actions]) => (
            <optgroup key={cat} label={CATEGORY_LABEL[cat] ?? cat}>
              {actions.map(a => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {selectedAction
        ? selectedAction.params.map(param => (
            <div key={param} className="wf-field">
              <label className="wf-label" htmlFor={`auto-${node.id}-${param}`}>
                {param.charAt(0).toUpperCase() + param.slice(1)}
              </label>
              <input
                id={`auto-${node.id}-${param}`}
                type="text"
                value={data.actionParams[param] ?? ''}
                onChange={e => handleParamChange(param, e.target.value)}
                className="wf-input"
              />
            </div>
          ))
        : null}

      <div className="wf-field">
        <span className="wf-label">Retry on failure</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => update({ retryOnFailure: true })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: data.retryOnFailure ? 'rgba(139,92,246,0.2)' : 'var(--color-bg-1)',
              color: data.retryOnFailure ? 'var(--color-automated)' : 'var(--color-text-3)',
              border: `1px solid ${data.retryOnFailure ? 'var(--color-automated)' : 'var(--color-border-1)'}`,
            }}
          >
            Enabled
          </button>
          <button
            type="button"
            onClick={() => update({ retryOnFailure: false })}
            className="btn"
            style={{
              flex: 1,
              height: '36px',
              background: !data.retryOnFailure ? 'var(--color-bg-4)' : 'var(--color-bg-1)',
              color: 'var(--color-text-2)',
              border: '1px solid var(--color-border-1)',
            }}
          >
            Disabled
          </button>
        </div>
      </div>
    </div>
  );
}

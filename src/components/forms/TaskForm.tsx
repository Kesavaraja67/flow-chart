import { useWorkflowStore } from '../../store/workflowStore';
import type { MetadataField, TaskNodeData, WorkflowNode } from '../../types/workflow';

interface Props {
  node: WorkflowNode & { data: TaskNodeData };
}

export function TaskForm({ node }: Props) {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data;

  const update = (patch: Partial<TaskNodeData>) => {
    updateNodeData(node.id, patch);
  };

  const addCustomField = () => {
    const newField: MetadataField = { id: crypto.randomUUID(), key: '', value: '' };
    update({ customFields: [...data.customFields, newField] });
  };

  const updateCustomField = (id: string, field: 'key' | 'value', value: string) => {
    update({
      customFields: data.customFields.map(f => (f.id === id ? { ...f, [field]: value } : f)),
    });
  };

  const removeCustomField = (id: string) => {
    update({ customFields: data.customFields.filter(f => f.id !== id) });
  };

  return (
    <div>
      <div className="wf-field">
        <label className="wf-label" htmlFor={`task-title-${node.id}`}>
          Title
        </label>
        <input
          id={`task-title-${node.id}`}
          type="text"
          value={data.title}
          onChange={e => update({ title: e.target.value })}
          className="wf-input"
        />
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`task-desc-${node.id}`}>
          Description
        </label>
        <textarea
          id={`task-desc-${node.id}`}
          rows={3}
          value={data.description}
          onChange={e => update({ description: e.target.value })}
          className="wf-input"
          style={{ resize: 'none' }}
        />
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`task-assignee-${node.id}`}>
          Assignee
        </label>
        <input
          id={`task-assignee-${node.id}`}
          type="text"
          value={data.assignee}
          onChange={e => update({ assignee: e.target.value })}
          className="wf-input"
        />
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`task-due-${node.id}`}>
          Due date
        </label>
        <input
          id={`task-due-${node.id}`}
          type="date"
          value={data.dueDate}
          onChange={e => update({ dueDate: e.target.value })}
          className="wf-input"
        />
      </div>

      <div className="wf-field">
        <label className="wf-label" htmlFor={`task-priority-${node.id}`}>
          Priority
        </label>
        <select
          id={`task-priority-${node.id}`}
          value={data.priority}
          onChange={e => update({ priority: e.target.value as TaskNodeData['priority'] })}
          className="wf-input"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="wf-field">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="wf-label" style={{ marginBottom: 0 }}>
            Custom fields
          </span>
          <button type="button" onClick={addCustomField} className="btn btn-ghost" style={{ height: '28px', fontSize: '12px' }}>
            + Add field
          </button>
        </div>
        {data.customFields.map(field => (
          <div key={field.id} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Key"
              value={field.key}
              onChange={e => updateCustomField(field.id, 'key', e.target.value)}
              className="wf-input"
              style={{ flex: 1, fontSize: '12px', padding: '5px 8px' }}
            />
            <input
              type="text"
              placeholder="Value"
              value={field.value}
              onChange={e => updateCustomField(field.id, 'value', e.target.value)}
              className="wf-input"
              style={{ flex: 1, fontSize: '12px', padding: '5px 8px' }}
            />
            <button
              type="button"
              onClick={() => removeCustomField(field.id)}
              className="btn btn-danger"
              style={{ height: '28px', padding: '0 8px' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

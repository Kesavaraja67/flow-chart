import { useWorkflowStore } from '../../store/workflowStore';
import type { MetadataField, StartNodeData, WorkflowNode } from '../../types/workflow';

interface Props {
  node: WorkflowNode & { data: StartNodeData };
}

export function StartForm({ node }: Props) {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data;

  const update = (patch: Partial<StartNodeData>) => {
    updateNodeData(node.id, patch);
  };

  const addMetadata = () => {
    const newField: MetadataField = { id: crypto.randomUUID(), key: '', value: '' };
    update({ metadata: [...data.metadata, newField] });
  };

  const updateMetadata = (id: string, field: 'key' | 'value', value: string) => {
    update({
      metadata: data.metadata.map(m => (m.id === id ? { ...m, [field]: value } : m)),
    });
  };

  const removeMetadata = (id: string) => {
    update({ metadata: data.metadata.filter(m => m.id !== id) });
  };

  return (
    <div>
      <div className="wf-field">
        <label className="wf-label" htmlFor={`start-title-${node.id}`}>
          Workflow title
        </label>
        <input
          id={`start-title-${node.id}`}
          type="text"
          value={data.title}
          onChange={e => update({ title: e.target.value })}
          className="wf-input"
        />
      </div>

      <div className="wf-field">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="wf-label" style={{ marginBottom: 0 }}>
            Metadata
          </span>
          <button
            type="button"
            onClick={addMetadata}
            className="btn btn-ghost"
            style={{ height: '28px', fontSize: '12px', color: 'var(--color-start)', borderColor: 'rgba(16,185,129,0.35)' }}
          >
            + Add field
          </button>
        </div>
        {data.metadata.map(field => (
          <div key={field.id} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Key"
              value={field.key}
              onChange={e => updateMetadata(field.id, 'key', e.target.value)}
              className="wf-input"
              style={{ flex: 1, fontSize: '12px', padding: '5px 8px' }}
            />
            <input
              type="text"
              placeholder="Value"
              value={field.value}
              onChange={e => updateMetadata(field.id, 'value', e.target.value)}
              className="wf-input"
              style={{ flex: 1, fontSize: '12px', padding: '5px 8px' }}
            />
            <button
              type="button"
              onClick={() => removeMetadata(field.id)}
              className="btn btn-danger"
              style={{ height: '28px', padding: '0 8px' }}
            >
              ×
            </button>
          </div>
        ))}
        {data.metadata.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-3)', fontStyle: 'italic' }}>No metadata fields</p>
        ) : null}
      </div>
    </div>
  );
}

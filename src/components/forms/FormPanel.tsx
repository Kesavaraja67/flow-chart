import { useWorkflowStore } from '../../store/workflowStore';
import {
  isApprovalData,
  isAutomatedData,
  isEndData,
  isStartData,
  isTaskData,
} from '../../types/workflow';
import type { WorkflowNode } from '../../types/workflow';
import { ApprovalForm } from './ApprovalForm';
import { AutomatedForm } from './AutomatedForm';
import { EndForm } from './EndForm';
import { StartForm } from './StartForm';
import { TaskForm } from './TaskForm';

const TYPE_LABEL: Record<string, string> = {
  start: 'Start',
  task: 'Task',
  approval: 'Approval',
  automated: 'Automation',
  end: 'End',
};

const TYPE_COLOR: Record<string, string> = {
  start: 'var(--color-start)',
  task: 'var(--color-task)',
  approval: 'var(--color-approval)',
  automated: 'var(--color-automated)',
  end: 'var(--color-end)',
};

function headline(node: WorkflowNode): string {
  const d = node.data;
  if (isEndData(d) || isStartData(d) || isTaskData(d) || isApprovalData(d) || isAutomatedData(d)) {
    return 'title' in d ? d.title : node.id;
  }
  return node.id;
}

export function FormPanel() {
  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);
  const nodes = useWorkflowStore(s => s.nodes);
  const deleteNode = useWorkflowStore(s => s.deleteNode);
  const node = nodes.find(n => n.id === selectedNodeId);

  if (!node) {
    return (
      <aside
        className="anim-slide-in"
        style={{
          width: '280px',
          flexShrink: 0,
          background: 'var(--color-bg-2)',
          borderLeft: '1px solid var(--color-border-1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'var(--color-bg-3)',
            border: '1px solid var(--color-border-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            fontSize: '24px',
            color: 'var(--color-text-3)',
          }}
        >
          ←
        </div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: '8px' }}>
          Select a node
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-3)', lineHeight: 1.5 }}>
          Click any step on the canvas to configure fields, approvals, and automations.
        </p>
      </aside>
    );
  }

  const renderForm = () => {
    const { data } = node;
    if (isStartData(data)) return <StartForm node={{ ...node, data }} />;
    if (isTaskData(data)) return <TaskForm node={{ ...node, data }} />;
    if (isApprovalData(data)) return <ApprovalForm node={{ ...node, data }} />;
    if (isAutomatedData(data)) return <AutomatedForm node={{ ...node, data }} />;
    if (isEndData(data)) return <EndForm node={{ ...node, data }} />;
    return null;
  };

  const accent = TYPE_COLOR[node.type] ?? 'var(--color-brand)';

  return (
    <aside
      className="anim-slide-in"
      style={{
        width: '280px',
        flexShrink: 0,
        background: 'var(--color-bg-2)',
        borderLeft: '1px solid var(--color-border-1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border-1)',
          background: 'var(--color-bg-0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: accent,
                background: `${accent}18`,
                padding: '3px 8px',
                borderRadius: '4px',
                marginBottom: '8px',
              }}
            >
              {TYPE_LABEL[node.type] ?? node.type}
            </span>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-1)',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              {headline(node)}
            </p>
            <p
              style={{
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--color-text-4)',
                marginTop: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {node.id}
            </p>
          </div>
          <button
            type="button"
            title="Delete node"
            onClick={() => {
              if (window.confirm('Delete this node and its connections?')) {
                deleteNode(node.id);
              }
            }}
            className="btn btn-danger"
            style={{ height: '32px', padding: '0 10px', flexShrink: 0 }}
          >
            🗑
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>{renderForm()}</div>
    </aside>
  );
}

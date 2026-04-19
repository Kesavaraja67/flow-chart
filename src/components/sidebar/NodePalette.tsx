import type { DragEvent } from 'react';
import type { NodeType } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

interface PaletteItem {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  desc: string;
}

const ITEMS: PaletteItem[] = [
  {
    type: 'start',
    icon: '▶',
    label: 'Start',
    color: 'var(--color-start)',
    bgColor: 'rgba(34,197,94,0.12)',
    desc: 'Workflow entry point',
  },
  {
    type: 'task',
    icon: '✓',
    label: 'Task',
    color: 'var(--color-task)',
    bgColor: 'rgba(56,189,248,0.12)',
    desc: 'Human task or action',
  },
  {
    type: 'approval',
    icon: '◇',
    label: 'Approval',
    color: 'var(--color-approval)',
    bgColor: 'rgba(245,158,11,0.12)',
    desc: 'Approval gate',
  },
  {
    type: 'automated',
    icon: '⚡',
    label: 'Automation',
    color: 'var(--color-automated)',
    bgColor: 'rgba(139,92,246,0.14)',
    desc: 'System action',
  },
  {
    type: 'end',
    icon: '■',
    label: 'End',
    color: 'var(--color-end)',
    bgColor: 'rgba(248,113,113,0.12)',
    desc: 'Workflow terminal',
  },
];

export function NodePalette() {
  const nodes = useWorkflowStore(s => s.nodes);
  const edges = useWorkflowStore(s => s.edges);
  const loadDemoWorkflow = useWorkflowStore(s => s.loadDemoWorkflow);

  const onDragStart = (e: DragEvent<HTMLDivElement>, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className="wf-sidebar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '16px' }}>◇</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)' }}>FlowCraft</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginLeft: '24px' }}>
          Workflow Studio
        </p>
      </div>

      <div style={{ padding: '12px 10px 8px', flex: 1, overflowY: 'auto' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-4)',
            marginBottom: '8px',
            paddingLeft: '4px',
          }}
        >
          Node Types
        </p>

        {ITEMS.map(item => (
          <div
            key={item.type}
            className="wf-palette-item"
            draggable
            onDragStart={e => onDragStart(e, item.type)}
            style={{
              borderColor: `${item.color}3b`,
              background: `linear-gradient(135deg, ${item.bgColor} 0%, rgba(22,27,34,0.85) 100%)`,
            }}
          >
            <span
              className="wf-palette-icon"
              style={{
                color: item.color,
                background: `${item.color}1e`,
                border: `1px solid ${item.color}45`,
              }}
            >
              {item.icon}
            </span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-1)', lineHeight: 1.2 }}>
                {item.label}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--color-text-3)', lineHeight: 1.2, marginTop: '2px' }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}

        <p style={{ fontSize: '10px', color: 'var(--color-text-4)', textAlign: 'center', marginTop: '8px' }}>
          Drag onto canvas
        </p>
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--color-border-1)' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-4)',
            marginBottom: '8px',
            paddingLeft: '2px',
          }}
        >
          Quick Actions
        </p>
        <button type="button" onClick={() => loadDemoWorkflow()} className="btn btn-ghost" style={{ width: '100%', marginBottom: '10px' }}>
          ⟳ Load Demo
        </button>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <span>⬡ {nodes.length} nodes</span>
          <span>⟶ {edges.length} edges</span>
        </div>
      </div>
    </aside>
  );
}

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
    bgColor: 'rgba(16,185,129,0.1)',
    desc: 'Workflow entry point',
  },
  {
    type: 'task',
    icon: '✓',
    label: 'Task',
    color: 'var(--color-task)',
    bgColor: 'rgba(59,130,246,0.1)',
    desc: 'Human task or action',
  },
  {
    type: 'approval',
    icon: '◇',
    label: 'Approval',
    color: 'var(--color-approval)',
    bgColor: 'rgba(245,158,11,0.1)',
    desc: 'Approval gate',
  },
  {
    type: 'automated',
    icon: '⚡',
    label: 'Automation',
    color: 'var(--color-automated)',
    bgColor: 'rgba(139,92,246,0.1)',
    desc: 'System action',
  },
  {
    type: 'end',
    icon: '■',
    label: 'End',
    color: 'var(--color-end)',
    bgColor: 'rgba(239,68,68,0.1)',
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
      style={{
        width: '200px',
        background: 'var(--color-bg-2)',
        borderRight: '1px solid var(--color-border-1)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '16px' }}>🔷</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-brand)' }}>FlowCraft</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-text-3)', marginLeft: '24px' }}>
          HR Workflow Designer
        </p>
      </div>

      <div style={{ padding: '12px 10px 8px', flex: 1, overflowY: 'auto' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 500,
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
            draggable
            onDragStart={e => onDragStart(e, item.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 10px',
              borderRadius: '8px',
              border: `1px solid ${item.color}30`,
              borderLeft: `3px solid ${item.color}`,
              background: item.bgColor,
              cursor: 'grab',
              marginBottom: '6px',
              transition: 'transform 0.12s, box-shadow 0.12s',
              userSelect: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
            }}
          >
            <span style={{ fontSize: '13px', flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: item.color, lineHeight: 1.2 }}>
                {item.label}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--color-text-3)', lineHeight: 1.2, marginTop: '1px' }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}

        <p style={{ fontSize: '10px', color: 'var(--color-text-4)', textAlign: 'center', marginTop: '8px' }}>
          Drag onto canvas
        </p>
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid var(--color-border-1)' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-4)',
            marginBottom: '8px',
            paddingLeft: '2px',
          }}
        >
          Quick Actions
        </p>
        <button
          type="button"
          onClick={() => loadDemoWorkflow()}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '6px',
            background: 'var(--color-bg-4)',
            border: '1px solid var(--color-border-2)',
            color: 'var(--color-text-2)',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            marginBottom: '10px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-5)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-4)')}
        >
          🔄 Load Demo
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

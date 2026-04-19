import { useWorkflowStore } from '../../store/workflowStore';
import { isStartData } from '../../types/workflow';

interface Props {
  onImportClick: () => void;
}

export function Header({ onImportClick }: Props) {
  const undo = useWorkflowStore(s => s.undo);
  const redo = useWorkflowStore(s => s.redo);
  const historyIndex = useWorkflowStore(s => s.historyIndex);
  const history = useWorkflowStore(s => s.history);
  const exportWorkflow = useWorkflowStore(s => s.exportWorkflow);
  const clearCanvas = useWorkflowStore(s => s.clearCanvas);
  const runSimulation = useWorkflowStore(s => s.runSimulation);
  const nodes = useWorkflowStore(s => s.nodes);

  const startNode = nodes.find(n => n.type === 'start');
  const workflowTitle =
    startNode && isStartData(startNode.data) ? startNode.data.title : 'Untitled';

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleClear = () => {
    if (window.confirm('Clear canvas? This removes all nodes.')) {
      clearCanvas();
    }
  };

  return (
    <header
      style={{
        height: '48px',
        background: 'var(--color-bg-2)',
        borderBottom: '1px solid var(--color-border-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <span style={{ fontSize: '18px' }}>🔷</span>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-brand)' }}>FlowCraft</span>
        <span style={{ color: 'var(--color-border-2)', margin: '0 4px' }}>|</span>
        <span style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>HR Workflow Designer</span>
        <>
          <span style={{ color: 'var(--color-border-2)' }}>›</span>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--color-text-1)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '240px',
            }}
          >
            {workflowTitle}
          </span>
        </>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button type="button" className="btn btn-ghost" onClick={() => undo()} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{ padding: '0 10px' }}>
          ↩
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => redo()} disabled={!canRedo} title="Redo (Ctrl+Y)" style={{ padding: '0 10px', marginRight: '4px' }}>
          ↪
        </button>

        <span style={{ width: '1px', height: '20px', background: 'var(--color-border-1)', margin: '0 4px' }} />

        <button type="button" className="btn btn-ghost" onClick={onImportClick} style={{ fontSize: '12px' }}>
          📂 Import
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => exportWorkflow()} style={{ fontSize: '12px' }}>
          ⬇ Export
        </button>

        <span style={{ width: '1px', height: '20px', background: 'var(--color-border-1)', margin: '0 4px' }} />

        <button type="button" className="btn btn-ghost" onClick={handleClear} style={{ fontSize: '12px' }}>
          🗑 Clear
        </button>
        <button type="button" className="btn btn-primary" onClick={() => void runSimulation()} style={{ fontSize: '12px', fontWeight: 600 }}>
          ▶ Run Simulation
        </button>
      </div>
    </header>
  );
}

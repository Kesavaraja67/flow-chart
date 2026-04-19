import { useMemo } from 'react';
import { validateWorkflow } from '../../api/simulate';
import { useWorkflowStore } from '../../store/workflowStore';

export function StatusBar() {
  const nodes = useWorkflowStore(s => s.nodes);
  const edges = useWorkflowStore(s => s.edges);
  const historyIndex = useWorkflowStore(s => s.historyIndex);
  const history = useWorkflowStore(s => s.history);

  const validation = useMemo(() => validateWorkflow(nodes, edges), [nodes, edges]);

  return (
    <div
      style={{
        height: '28px',
        background: 'var(--color-bg-0)',
        borderTop: '1px solid var(--color-border-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '11px',
        color: 'var(--color-text-3)',
        fontFamily: 'JetBrains Mono, monospace',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: 0, flexWrap: 'wrap' }}>
        <span>⬡ {nodes.length} nodes</span>
        <span>⟶ {edges.length} edges</span>
        <span style={{ color: validation.valid ? 'var(--color-success)' : 'var(--color-error)' }}>
          {validation.valid ? '✓ Valid' : `⚠ ${validation.errors.length} error${validation.errors.length !== 1 ? 's' : ''}`}
        </span>
        <span style={{ color: 'var(--color-text-4)' }}>
          history {historyIndex + 1}/{history.length}
        </span>
      </div>
      <div
        className="hidden md:flex"
        style={{ gap: '16px', color: 'var(--color-text-4)', alignItems: 'center' }}
      >
        <span>Ctrl+Z undo</span>
        <span>Del remove</span>
        <span>Drag to connect</span>
      </div>
    </div>
  );
}

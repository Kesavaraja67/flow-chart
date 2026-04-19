import { useEffect, useRef, type ChangeEvent } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { FormPanel } from './components/forms/FormPanel';
import { NodePalette } from './components/sidebar/NodePalette';
import { SandboxPanel } from './components/sandbox/SandboxPanel';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { Header } from './components/ui/Header';
import { StatusBar } from './components/ui/StatusBar';
import { useWorkflowStore } from './store/workflowStore';

export default function App() {
  const loadAutomations = useWorkflowStore(s => s.loadAutomations);
  const importWorkflow = useWorkflowStore(s => s.importWorkflow);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadAutomations();
  }, [loadAutomations]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (typeof ev.target?.result === 'string') {
        importWorkflow(ev.target.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--color-bg-0)',
      }}
    >
      <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFileChange} />

      <Header onImportClick={() => fileInputRef.current?.click()} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, minWidth: 0 }}>
        <NodePalette />
        <ReactFlowProvider>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0, minWidth: 0 }}>
            <WorkflowCanvas />
          </div>
        </ReactFlowProvider>
        <FormPanel />
      </div>

      <SandboxPanel />
      <StatusBar />
    </div>
  );
}

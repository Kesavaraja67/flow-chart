import { useWorkflowStore } from '../store/workflowStore';

export function useSimulation() {
  return {
    runSimulation: useWorkflowStore(s => s.runSimulation),
    status: useWorkflowStore(s => s.simulationStatus),
    result: useWorkflowStore(s => s.simulationResult),
    isOpen: useWorkflowStore(s => s.isSandboxOpen),
    toggle: useWorkflowStore(s => s.toggleSandbox),
  };
}

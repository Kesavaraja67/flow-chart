# FlowCraft — HR Workflow Designer | Tredence Case Study

## Overview

FlowCraft is a visual workflow designer for HR operations. Teams build linear onboarding and approval flows on an infinite canvas, configure each step with typed forms, validate graph structure, and run a full simulation with per-step timing—using mock async APIs only, so the same UI patterns port cleanly to a real backend later.

## Architecture

```
src/
├── types/workflow.ts       # Discriminated node data, guards, getDefaultData()
├── api/
│   ├── automations.ts      # Mock catalog (grouped by category)
│   └── simulate.ts         # Validation, execution order, simulation engine
├── store/workflowStore.ts  # Zustand: nodes/edges, history, simulation
├── hooks/
│   ├── useWorkflow.ts      # React Flow events + application/reactflow drop
│   └── useSimulation.ts    # Simulation UI selectors
└── components/
    ├── nodes/              # Memoized custom nodes (active sim highlight)
    ├── canvas/WorkflowCanvas.tsx  # Local RF state synced from Zustand
    ├── sidebar/NodePalette.tsx
    ├── forms/
    ├── sandbox/
    └── ui/                 # Header, StatusBar
```

React Flow v12 (`@xyflow/react`) renders the graph. `ReactFlowProvider` wraps only the canvas subtree so `useReactFlow()` runs inside `WorkflowCanvas`. Nodes passed to `<ReactFlow>` use `data` cast to `Record<string, unknown>` as required by the library.

## Design decisions

1. **Zustand** — One store for workflow geometry, selection, undo history, automations, and simulation output; no Redux boilerplate for this scope.
2. **Mock APIs** — `getAutomations` and `simulateWorkflow` are async functions with delays; swap implementations without changing UI code.
3. **React Flow** — Pan/zoom, minimap, connections, and deletion are delegated; custom nodes stay presentational with data from props + store for simulation pulse.
4. **TypeScript strict** — Discriminated `WorkflowNodeData` with `type` field and guards keeps forms and serialization correct without `any`.
5. **Split RF state** — Local `rfNodes` / `rfEdges` mirror Zustand so `applyNodeChanges` / `applyEdgeChanges` work; positions sync to the store when a drag ends; edge removes update the store so the graph stays consistent.

## Data flow

1. Palette sets `application/reactflow` on drag; drop uses `screenToFlowPosition` and `getDefaultData()` → `addNode` appends history + node.
2. Connecting handles → `onConnect` → `addEdge` with duplicate check.
3. Node drag → `onNodesChange` → local `applyNodeChanges` + position sync when `dragging === false`.
4. Edge delete → `onEdgesChange` (remove) or `onEdgesDelete` → `deleteEdge` (idempotent).
5. Click node → `setSelectedNode` → `FormPanel` picks form via type guards → `updateNodeData` merges patches (history not recorded per keystroke).
6. Run simulation → `simulateWorkflow` → optional step highlight loop → `SimulationLog` shows timeline.

## How to run

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Features implemented

- [x] Enterprise dark UI (CSS variables + Inter / JetBrains Mono)
- [x] Demo Employee Onboarding graph on load
- [x] Drag palette → canvas (`application/reactflow`)
- [x] Local React Flow state + Zustand sync for drag and deletes
- [x] Typed forms (priority, approval comment, automation categories, end toggles)
- [x] Undo/redo with bounded history
- [x] Import/export JSON
- [x] Validation + simulation with durations and timeline UI
- [x] Keyboard: Ctrl+Z / Ctrl+Y (or Cmd), Delete

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z / Cmd+Z | Undo |
| Ctrl+Y or Ctrl+Shift+Z | Redo |
| Delete | Remove selected nodes/edges |
| Shift | Multi-select (React Flow) |

## What I’d add with more time

- Conditional branching and a non-linear simulator
- Persistence (IndexedDB or API)
- Automated layout (dagre) and snap-to-grid
- Unit tests for `simulate.ts` and store history
- A11y pass on custom nodes and forms

## Trade-offs

- **History** caps at 50 entries and does not record every position tick—only final positions after drag—to keep memory and undo predictable.
- **Linear-only** validation rejects cycles; productized branching would need a new execution model.
- **No E2E tests** in this deliverable—manual verification of drag/connect/simulate is expected.

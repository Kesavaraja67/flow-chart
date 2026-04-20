<div align="center">

<br />

# Flow Chart

### *Design · Validate · Simulate — HR Workflows on an Infinite Canvas*

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-flow--chart--delta.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://flow-chart-delta.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-orange?style=flat-square)](https://zustand-demo.pmnd.rs)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

<br />

<img src="./app-interface.png" width="780" alt="FlowCraft interface showing the workflow canvas with nodes and sidebar" />

<br />

**FlowCraft** is a zero-dependency, browser-native visual workflow engine built for HR teams. Design onboarding flows, leave approvals, and document pipelines on a drag-and-drop infinite canvas — then simulate them step-by-step with a real-time execution log.

<br />

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Data Model & Type System](#data-model--type-system)
- [Mock API Layer](#mock-api-layer)
- [Workflow Simulation Engine](#workflow-simulation-engine)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Assumptions & Tradeoffs](#assumptions--tradeoffs)
- [What I'd Add With More Time](#what-id-add-with-more-time)

---

## Overview

FlowCraft was built as a case study for the Tredence AI Agentic Platforms internship. The goal: demonstrate full-stack frontend engineering depth — React architecture, complex form handling, graph state management, and simulation logic — within a tight scope.

The result is a complete, shippable prototype: a visual workflow designer where an HR admin can drag nodes onto a canvas, configure each step with typed forms, validate the graph in real time, and watch a simulated execution walk through every step.

---

## Features

### Canvas & Builder

| Feature | Detail |
|---|---|
| **Infinite drag-and-drop canvas** | Powered by `@xyflow/react` v12 with bezier edge routing |
| **5 custom node types** | Start, Task, Approval, Automation, End — each with its own visual identity |
| **Sidebar palette** | Drag any node type from the palette onto the canvas at drop position |
| **Connect & delete** | Draw edges between handles; delete nodes/edges with the `Del` key |
| **Minimap** | Color-coded node minimap, pannable and zoomable |
| **Zoom controls** | Scroll to zoom, fit-view on load, keyboard pan |

### Node Configuration

| Node | Configurable Fields |
|---|---|
| **Start** | Title, dynamic key-value metadata pairs |
| **Task** | Title, description, assignee, date picker, priority (low/medium/high), custom key-value fields |
| **Approval** | Title, approver role (Manager/HRBP/Director/VP), auto-approve threshold, requires-comment toggle |
| **Automation** | Title, action selector (grouped by category), dynamic params per action, retry-on-failure toggle |
| **End** | End message, generate summary flag, notify stakeholders flag |

All forms are **fully controlled React components** bound directly to the Zustand store — zero uncontrolled inputs.

### Validation & History

- **Real-time validation** — the status bar shows `✓ Valid` or error count live as you edit
- **Structural checks** — exactly one Start node, at least one End node, no disconnected nodes, no cycles (DFS)
- **Per-node error badges** — invalid nodes show an `⚠ N` pill with a tooltip listing each error
- **50-step undo/redo** — `Ctrl+Z` / `Ctrl+Y` (also `Ctrl+Shift+Z`) with history stored in the Zustand slice

### Simulation

- Serialises the full graph (nodes + edges) and runs it through a local simulation engine
- Validates structure before executing — returns early with errors if invalid
- BFS-ordered step execution with per-node status: `success`, `pending`, `skipped`, `error`
- Each active node is **highlighted on the canvas** during its execution step (700ms walk)
- Results render as a timestamped timeline log with duration per step and a summary line
- Fullscreen mode for the simulation panel (cross-browser: standard + webkit + ms APIs)

### Export / Import

- **Export** — serialises `{ nodes, edges }` to a timestamped `.json` download
- **Import** — file picker accepting `.json`; validates array shape before applying

---

## Architecture

```
src/
├── types/
│   └── workflow.ts          # Single source of truth for all types + type guards + default factory
├── api/
│   ├── automations.ts       # Mock GET /automations — returns 8 actions across 3 categories
│   ├── simulate.ts          # validateWorkflow, getExecutionOrder, simulateWorkflow
│   └── simulate.test.ts     # Vitest unit tests
├── store/
│   └── workflowStore.ts     # Zustand store — all state + actions in one slice
├── hooks/
│   ├── useWorkflow.ts       # React Flow event handlers (connect, drop, delete, position sync)
│   └── useSimulation.ts     # Thin selector hook over the simulation slice
├── components/
│   ├── nodes/               # 5 custom React Flow node components
│   ├── forms/               # FormPanel dispatcher + 5 node-specific form components
│   ├── canvas/              # WorkflowCanvas — bridges React Flow ↔ Zustand
│   ├── sandbox/             # SandboxPanel + SimulationLog
│   ├── sidebar/             # NodePalette (drag source)
│   └── ui/                  # Header, StatusBar
└── App.tsx                  # Layout shell + file input for JSON import
```

### Layer boundaries

```
UI (nodes, forms, sidebar)
        ↓
  Custom Hooks  ← useWorkflow, useSimulation
        ↓
  Zustand Store ← single reactive state tree
        ↓
   API / Logic  ← automations.ts, simulate.ts (pure functions, no React)
        ↓
  Types / Utils ← workflow.ts (zero runtime deps)
```

Each layer only imports downward. The API layer has no React imports. The store has no React Flow imports. This makes every layer independently testable.

---

## Data Model & Type System

The entire workflow state is typed via a **discriminated union** on `WorkflowNodeData`:

```ts
export type WorkflowNodeData =
  | StartNodeData    // { type: 'start'; title: string; metadata: MetadataField[] }
  | TaskNodeData     // { type: 'task'; title; description; assignee; dueDate; priority; customFields }
  | ApprovalNodeData // { type: 'approval'; title; approverRole; autoApproveThreshold; requiresComment }
  | AutomatedNodeData// { type: 'automated'; title; actionId; actionParams; retryOnFailure }
  | EndNodeData;     // { type: 'end'; title; endMessage; generateSummary; notifyStakeholders }
```

TypeScript narrows automatically via the `type` discriminant. Five type guard functions (`isStartData`, `isTaskData`, etc.) and a `getDefaultData(type)` factory are co-located in `types/workflow.ts` — a single import gives any component everything it needs.

This design means **adding a new node type is a single diff**: add a type to the union, add a case to `getDefaultData`, add a form component, add a node component. No other files change.

---

## Mock API Layer

Two mock endpoints are implemented as async functions that simulate network latency:

### `GET /automations` — `src/api/automations.ts`

Returns 8 automation actions grouped into three categories:

```ts
[
  { id: 'send_email',      label: 'Send Email',           category: 'communication', params: ['to', 'subject', 'body'] },
  { id: 'send_slack',      label: 'Send Slack Message',   category: 'communication', params: ['channel', 'message'] },
  { id: 'generate_pdf',    label: 'Generate PDF',         category: 'document',      params: ['template', 'recipient', 'outputPath'] },
  { id: 'generate_offer',  label: 'Generate Offer Letter',category: 'document',      params: ['candidateName', 'role', 'salary'] },
  { id: 'create_ticket',   label: 'Create JIRA Ticket',   category: 'integration',   params: ['title', 'priority', 'assignee'] },
  { id: 'update_hris',     label: 'Update HRIS Record',   category: 'integration',   params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting',label: 'Schedule Meeting',     category: 'integration',   params: ['attendees', 'title', 'duration'] },
  { id: 'webhook',         label: 'Trigger Webhook',      category: 'integration',   params: ['url', 'method', 'payload'] },
]
```

When a user selects an action in the Automation node form, the `params` array drives **dynamic field rendering** — the form re-renders with exactly the input fields that action requires, and clears stale params on action change.

### `POST /simulate` — `src/api/simulate.ts`

Accepts `{ nodes, edges }` and returns a `SimulationResult` with per-step execution logs.

### API fallback pattern

The store always tries a real `fetch('/api/...')` first. If that fails (e.g. in the Vercel static deployment where no server exists), it falls back to the local mock:

```ts
try {
  const res = await fetch('/api/automations');
  if (!res.ok) throw new Error();
  set({ automations: await res.json() });
} catch {
  set({ automations: await getAutomations() }); // local fallback
}
```

This means the same codebase works in both a fully static deployment and a Node.js backend without any environment flags.

---

## Workflow Simulation Engine

The simulation engine (`src/api/simulate.ts`) is a set of pure functions with no React or Zustand dependencies.

### Validation (`validateWorkflow`)

Before any execution, the graph is checked for:

1. Exactly one Start node
2. At least one End node
3. Every non-Start node has an incoming edge
4. Every non-End node has an outgoing edge
5. **No cycles** — detected via iterative DFS with a `visited` set and an active `stack` set

### Execution order (`getExecutionOrder`)

BFS traversal starting from the Start node — builds a deterministic execution order regardless of the visual position of nodes on the canvas.

### Step execution (`simulateWorkflow`)

Each node type produces a contextual log message using its configured data:

- **Start** — reports metadata field count
- **Task** — reports assignee, priority, due date
- **Approval** — auto-approves if `autoApproveThreshold > 0`, otherwise returns `pending`
- **Automation** — reports action ID and param count; `skipped` if no action is configured
- **End** — confirms completion with summary/notify flags

Steps are returned with `stepNumber`, `status`, `message`, `timestamp`, and `durationMs` for rendering in the timeline log.

---

## Quick Start

**Prerequisites:** Node.js 18+, npm 9+

```bash
# Clone the repository
git clone https://github.com/Kesavaraja67/flow-chart.git
cd flow-chart

# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5173

# Type-check
npm run tsc

# Run unit tests
npm test

# Build for production
npm run build
```

> **Try it instantly:** [https://flow-chart-delta.vercel.app](https://flow-chart-delta.vercel.app) — no install needed.

---

## Project Structure

```
flow-chart/
├── src/
│   ├── api/                 # Mock API + simulation engine (pure TS, no React)
│   ├── components/
│   │   ├── canvas/          # WorkflowCanvas — React Flow ↔ Zustand bridge
│   │   ├── forms/           # FormPanel dispatcher + per-node form components
│   │   ├── nodes/           # 5 custom React Flow node components
│   │   ├── sandbox/         # SandboxPanel + SimulationLog
│   │   ├── sidebar/         # NodePalette drag source
│   │   └── ui/              # Header, StatusBar
│   ├── hooks/               # useWorkflow, useSimulation
│   ├── store/               # workflowStore.ts (Zustand)
│   ├── types/               # workflow.ts — all types, guards, defaults
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Design Decisions

### Why Zustand over Context + useReducer?

React Context re-renders every consumer on every state change. With a canvas that can have many nodes, each with live form edits triggering re-renders, that's a performance problem. Zustand's granular selector subscriptions (`useWorkflowStore(s => s.selectedNodeId)`) mean a node component only re-renders when its own slice of state changes. The store also co-locates all actions and async logic in one place, which made it easier to implement undo/redo without prop-drilling or complex context nesting.

### Why a discriminated union for node data instead of a flat object?

Each node type has a completely different shape. A flat `data: Record<string, unknown>` would require runtime `typeof` checks everywhere and lose TypeScript's exhaustiveness checking. The discriminated union (`data.type === 'task'`) lets the compiler narrow to the exact type inside each `if`/`switch` branch. The form components can accept `node: WorkflowNode & { data: TaskNodeData }` and get full autocomplete with zero casting.

### Why local mock functions instead of MSW or json-server?

MSW requires a service worker (adds build complexity and doesn't work in all deployment contexts). json-server requires a running Node process (incompatible with a purely static Vercel deployment). The local async functions simulate the exact same contract — same response shape, same latency — with zero runtime dependencies. The store's fetch-with-fallback pattern means this can be swapped for a real backend by simply making the `/api` routes return the same JSON.

### Why a separate `useWorkflow` hook instead of inline handlers?

`WorkflowCanvas` renders on every React Flow tick. Extracting the event handlers into `useWorkflow` — each wrapped in `useCallback` with stable dependencies — prevents new function references on every render, keeping React Flow's internal `useMemo` optimisations intact. It also makes the canvas component a pure layout concern and keeps the business logic testable independently.

### Undo/redo: why store full snapshots instead of deltas?

For a prototype with at most a few dozen nodes, deep-copying the full state on every action is negligible — a JSON round-trip of ~5 nodes takes under 1ms. Delta-based undo (patch/invert) is significantly more complex to implement correctly, especially for edge deletions and multi-step operations. Full snapshots keep the implementation simple and bug-free. The history is capped at 50 entries to bound memory usage.

---

## Assumptions & Tradeoffs

| Decision | Rationale |
|---|---|
| No backend / no persistence | The spec explicitly says no auth or backend persistence is required |
| Local mock functions (not MSW/json-server) | Simpler deployment; same contract; swap-in ready via fetch-with-fallback |
| Single `workflowStore.ts` file | For a prototype scope, one cohesive slice is easier to navigate than multiple slices; would split by domain at scale |
| Cycle detection rejects all cycles | The spec says "validate cycles"; some workflows legitimately loop, but for HR onboarding flows a DAG constraint is appropriate and simplifies the simulation engine |
| History stores 50 snapshots | Balances undo depth vs. memory; configurable via a constant |
| Simulation runs client-side only | Sufficient for a prototype; a real implementation would `POST` to a server and stream results via SSE |

---

## What I'd Add With More Time

**Higher priority**

- [ ] **MSW mock server** — replace local functions with proper intercepted HTTP routes so the network tab shows real API calls; easier to demo the API layer to reviewers
- [ ] **Streaming simulation via SSE** — `POST /simulate` opens a Server-Sent Events stream; steps arrive in real time instead of a batch; the canvas node highlights follow the stream
- [ ] **Conditional edges** — edges labelled `approved / rejected` on Approval nodes; simulation follows the right branch based on threshold
- [ ] **Node templates** — save a configured sub-flow (e.g. "3-step document verification") as a reusable template that can be dragged from the palette

**Medium priority**

- [ ] **Auto-layout** — `dagre` or `elkjs` for one-click graph tidying
- [ ] **Node version history** — per-node audit log of field changes stored in the history stack
- [ ] **Zoom-to-fit on import** — after importing a JSON workflow, call `fitView()` so the full graph is visible
- [ ] **Keyboard shortcuts panel** — `?` key shows a modal listing all shortcuts

**Nice to have**

- [ ] **Dark/light theme toggle** — CSS variables already support it; just needs a class toggle on `<html>`
- [ ] **Multi-select + bulk delete** — Shift+click to select multiple nodes, then Del to remove the group
- [ ] **Workflow diff view** — compare two exported JSON files visually, showing added/removed/changed nodes

---

<div align="center">

Built for the **Tredence Studio — AI Agents Engineering** internship case study.

<br />

*React · TypeScript · Vite · @xyflow/react · Zustand · Tailwind · Vitest*

</div>

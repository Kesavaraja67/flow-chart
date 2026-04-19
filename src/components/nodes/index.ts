import type { NodeTypes } from '@xyflow/react';
import { ApprovalNode } from './ApprovalNode';
import { AutomatedNode } from './AutomatedNode';
import { EndNode } from './EndNode';
import { StartNode } from './StartNode';
import { TaskNode } from './TaskNode';

export const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

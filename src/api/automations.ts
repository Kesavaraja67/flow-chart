import type { AutomationAction } from '../types/workflow';

const MOCK_ACTIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    description: 'Send an email notification',
    category: 'communication',
    params: ['to', 'subject', 'body'],
  },
  {
    id: 'send_slack',
    label: 'Send Slack Message',
    description: 'Post to a Slack channel',
    category: 'communication',
    params: ['channel', 'message'],
  },
  {
    id: 'generate_pdf',
    label: 'Generate PDF',
    description: 'Generate a PDF document',
    category: 'document',
    params: ['template', 'recipient', 'outputPath'],
  },
  {
    id: 'generate_offer',
    label: 'Generate Offer Letter',
    description: 'Create offer letter',
    category: 'document',
    params: ['candidateName', 'role', 'salary'],
  },
  {
    id: 'create_ticket',
    label: 'Create JIRA Ticket',
    description: 'Open a support ticket',
    category: 'integration',
    params: ['title', 'priority', 'assignee'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    description: 'Update employee record',
    category: 'integration',
    params: ['employeeId', 'field', 'value'],
  },
  {
    id: 'schedule_meeting',
    label: 'Schedule Meeting',
    description: 'Book a calendar event',
    category: 'integration',
    params: ['attendees', 'title', 'duration'],
  },
  {
    id: 'webhook',
    label: 'Trigger Webhook',
    description: 'Call an external webhook',
    category: 'integration',
    params: ['url', 'method', 'payload'],
  },
];

export async function getAutomations(): Promise<AutomationAction[]> {
  await new Promise<void>(r => setTimeout(r, 250));
  return [...MOCK_ACTIONS];
}

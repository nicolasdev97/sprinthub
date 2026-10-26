import type { Metadata } from 'next';

import { GlobalTasksView } from '@/features/tasks';

export const metadata: Metadata = {
  title: 'Tasks Hub | SprintHub',
  description: 'View and filter all tasks across your workspaces and projects.',
};

export default function TasksPage() {
  return <GlobalTasksView />;
}

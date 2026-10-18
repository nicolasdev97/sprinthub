import { use } from 'react';
import type { Metadata } from 'next';

import { WorkspaceDashboardView } from '@/features/dashboard';

export const metadata: Metadata = {
  title: 'Workspace Dashboard | SprintHub',
  description:
    'Monitor workspace KPIs, task workflow distribution, priority breakdown, and upcoming deadlines.',
};

interface WorkspaceDashboardPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default function WorkspaceDashboardPage({
  params,
}: WorkspaceDashboardPageProps) {
  const { workspaceId } = use(params);

  return <WorkspaceDashboardView workspaceId={workspaceId} />;
}


import type { Metadata } from 'next';

import { ProjectTasksView } from '@/features/tasks';

export const metadata: Metadata = {
  title: 'Project Tasks | SprintHub',
  description: 'Manage project tasks across Kanban Board and List views.',
};

interface ProjectTasksPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectTasksPage({
  params,
}: ProjectTasksPageProps) {
  const { workspaceId, projectId } = await params;

  return <ProjectTasksView workspaceId={workspaceId} projectId={projectId} />;
}


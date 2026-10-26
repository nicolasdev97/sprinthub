import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ProjectTasksView } from '@/features/tasks';

export const metadata: Metadata = {
  title: 'Project Tasks | SprintHub',
  description: 'Manage project tasks across Kanban Board and List views.',
};

interface ProjectTasksPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
  searchParams: Promise<{ taskId?: string }>;
}

export default async function ProjectTasksPage({
  params,
  searchParams,
}: ProjectTasksPageProps) {
  const { workspaceId, projectId } = await params;
  const { taskId } = await searchParams;

  return (
    <Suspense>
      <ProjectTasksView
        workspaceId={workspaceId}
        projectId={projectId}
        initialTaskId={taskId}
      />
    </Suspense>
  );
}

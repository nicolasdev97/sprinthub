import type { Metadata } from 'next';

import { ProjectsListView } from '@/features/projects';

export const metadata: Metadata = {
  title: 'Projects | SprintHub',
  description: 'Manage projects, status, and task progress within your workspace.',
};

interface WorkspaceProjectsPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceProjectsPage({
  params,
}: WorkspaceProjectsPageProps) {
  const { workspaceId } = await params;

  return <ProjectsListView workspaceId={workspaceId} />;
}


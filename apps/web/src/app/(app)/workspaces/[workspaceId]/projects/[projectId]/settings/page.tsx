import type { Metadata } from 'next';

import { ProjectSettingsView } from '@/features/projects';

export const metadata: Metadata = {
  title: 'Project Settings | SprintHub',
  description: 'Configure project details, lifecycle state, and deletion.',
};

interface ProjectSettingsPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { workspaceId, projectId } = await params;

  return <ProjectSettingsView workspaceId={workspaceId} projectId={projectId} />;
}


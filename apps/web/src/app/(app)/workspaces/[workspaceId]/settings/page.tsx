import type { Metadata } from 'next';

import { WorkspaceSettingsView } from '@/features/workspaces';

export const metadata: Metadata = {
  title: 'Workspace Settings | SprintHub',
  description: 'Manage workspace details, members, roles, and permissions.',
};

interface WorkspaceSettingsPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceSettingsPage({ params }: WorkspaceSettingsPageProps) {
  const { workspaceId } = await params;

  return <WorkspaceSettingsView workspaceId={workspaceId} />;
}

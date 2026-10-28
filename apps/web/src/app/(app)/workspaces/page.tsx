import type { Metadata } from 'next';

import { WorkspacesListView } from '@/features/workspaces';

export const metadata: Metadata = {
  title: 'Workspaces | SprintHub',
  description: 'View, create, and manage your SprintHub workspaces.',
};

interface WorkspacesPageProps {
  searchParams: Promise<{ create?: string }>;
}

export default async function WorkspacesPage({ searchParams }: WorkspacesPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialCreateOpen = resolvedSearchParams.create === 'true';

  return <WorkspacesListView initialCreateOpen={initialCreateOpen} />;
}

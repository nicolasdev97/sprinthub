import { redirect } from 'next/navigation';

interface WorkspaceDashboardPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceDashboardPage({
  params,
}: WorkspaceDashboardPageProps) {
  const { workspaceId } = await params;
  redirect(`/workspaces/${workspaceId}/projects`);
}

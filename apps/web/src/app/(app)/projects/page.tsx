import type { Metadata } from 'next';

import { GlobalProjectsView } from '@/features/projects';

export const metadata: Metadata = {
  title: 'Projects Hub | SprintHub',
  description: 'View and manage all projects across your workspaces.',
};

export default function ProjectsPage() {
  return <GlobalProjectsView />;
}

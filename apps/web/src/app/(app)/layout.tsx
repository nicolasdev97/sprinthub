import { ReactNode } from 'react';

import { AppShell } from '@/components/layout';
import { WorkspaceProvider } from '@/features/workspaces';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}


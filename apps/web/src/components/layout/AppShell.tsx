'use client';

import { ReactNode, useState } from 'react';

import { useAuth } from '@/features/auth';

import { AppNavbar } from './AppNavbar';
import { AppShellSkeleton } from './AppShellSkeleton';
import { AppSidebar } from './AppSidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isInitializing } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (isInitializing) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Collapsible Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Main Viewport Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppNavbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}


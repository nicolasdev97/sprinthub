'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth';

import { AppNavbar } from './AppNavbar';
import { AppShellSkeleton } from './AppShellSkeleton';
import { AppSidebar } from './AppSidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      let shouldRedirectHome = false;
      try {
        shouldRedirectHome = window.sessionStorage.getItem('sprinthub:logout-redirect') === '1';
        if (shouldRedirectHome) {
          window.sessionStorage.removeItem('sprinthub:logout-redirect');
        }
      } catch {
        // Ignore storage read errors
      }

      router.replace(shouldRedirectHome ? '/' : '/login');
    }
  }, [isInitializing, isAuthenticated, router]);

  if (isInitializing || !isAuthenticated) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Collapsible Sidebar + Border-Centered Toggle Button */}
      <div className="relative z-40 hidden md:flex md:shrink-0">
        <AppSidebar isCollapsed={isSidebarCollapsed} />

        <div className="absolute top-8 right-0 z-50 translate-x-1/2 -translate-y-1/2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="size-7 rounded-full border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground active:translate-y-0!"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="size-3.5" />
            ) : (
              <PanelLeftClose className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Viewport Column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Plus } from 'lucide-react';

import { Button, Skeleton } from '@/components/ui';
import {
  DashboardDistributionChartsSkeleton,
  DashboardKpiGridSkeleton,
  DashboardUpcomingTasksSkeleton,
} from '@/features/dashboard';
import { useWorkspaceContext } from '@/features/workspaces';

export default function DashboardIndexRedirectPage() {
  const router = useRouter();
  const { activeWorkspaceId, isLoading } = useWorkspaceContext();

  useEffect(() => {
    if (!isLoading && activeWorkspaceId) {
      router.replace(`/workspaces/${activeWorkspaceId}/dashboard`);
    }
  }, [activeWorkspaceId, isLoading, router]);

  if (isLoading || activeWorkspaceId) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Loading workspace dashboard"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
        <DashboardKpiGridSkeleton />
        <DashboardDistributionChartsSkeleton />
        <DashboardUpcomingTasksSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LayoutDashboard className="size-6" />
      </div>
      <div className="max-w-md space-y-1">
        <h1 className="text-base font-semibold text-foreground">
          Welcome to SprintHub
        </h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t belong to any workspace yet. Create your first workspace to view analytics, manage projects, and collaborate on tasks.
        </p>
      </div>
      <Button
        nativeButton={false}
        render={<Link href="/workspaces?create=true" />}
      >
        <Plus className="size-4" />
        <span>Create or Select Workspace</span>
      </Button>
    </div>
  );
}


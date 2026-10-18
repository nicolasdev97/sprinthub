'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Plus } from 'lucide-react';

import { Button, Skeleton } from '@/components/ui';
import { useWorkspaceContext } from '@/features/workspaces';

export default function ProjectsIndexRedirectPage() {
  const router = useRouter();
  const { activeWorkspaceId, isLoading } = useWorkspaceContext();

  useEffect(() => {
    if (!isLoading && activeWorkspaceId) {
      router.replace(`/workspaces/${activeWorkspaceId}/projects`);
    }
  }, [activeWorkspaceId, isLoading, router]);

  if (isLoading || activeWorkspaceId) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading workspace projects">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-60 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Briefcase className="size-6" />
      </div>
      <div className="max-w-md space-y-1">
        <h1 className="text-base font-semibold text-foreground">
          No active workspace selected
        </h1>
        <p className="text-sm text-muted-foreground">
          Projects belong to a workspace. Select or create a workspace first to view and manage its projects.
        </p>
      </div>
      <Link href="/workspaces?create=true">
        <Button>
          <Plus className="size-4" />
          <span>Create or Select Workspace</span>
        </Button>
      </Link>
    </div>
  );
}


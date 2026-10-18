'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, FolderKanban, Plus } from 'lucide-react';

import { Button, Skeleton } from '@/components/ui';
import { useProjects } from '@/features/projects';
import { useWorkspaceContext } from '@/features/workspaces';

export default function TasksIndexRedirectPage() {
  const router = useRouter();
  const { activeWorkspaceId, isLoading: isWorkspaceLoading } = useWorkspaceContext();

  const { data: projects, isLoading: isProjectsLoading } = useProjects(
    activeWorkspaceId ?? ''
  );

  const firstProjectId = projects?.[0]?.id;

  useEffect(() => {
    if (isWorkspaceLoading || isProjectsLoading) return;

    if (activeWorkspaceId && firstProjectId) {
      router.replace(
        `/workspaces/${activeWorkspaceId}/projects/${firstProjectId}/tasks`
      );
    }
  }, [activeWorkspaceId, firstProjectId, isWorkspaceLoading, isProjectsLoading, router]);

  if (
    isWorkspaceLoading ||
    (activeWorkspaceId && isProjectsLoading) ||
    (activeWorkspaceId && firstProjectId)
  ) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading project tasks">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!activeWorkspaceId) {
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
            Select or create a workspace first to access your projects and tasks.
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

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FolderKanban className="size-6" />
      </div>
      <div className="max-w-md space-y-1">
        <h1 className="text-base font-semibold text-foreground">
          No projects available for tasks
        </h1>
        <p className="text-sm text-muted-foreground">
          Tasks belong to a project. Create a project in your active workspace to start managing tasks on the Kanban board.
        </p>
      </div>
      <Link href={`/workspaces/${activeWorkspaceId}/projects`}>
        <Button>
          <Plus className="size-4" />
          <span>Go to Workspace Projects</span>
        </Button>
      </Link>
    </div>
  );
}


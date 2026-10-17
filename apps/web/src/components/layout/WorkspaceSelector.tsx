'use client';

import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Briefcase,
  Check,
  ChevronsUpDown,
  FolderOpen,
  Plus,
  RefreshCw,
} from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@/components/ui';
import { useWorkspaceContext } from '@/features/workspaces';
import { cn } from '@/shared/utils';

export function WorkspaceSelector() {
  const router = useRouter();
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    isLoading,
    isError,
    refetchWorkspaces,
  } = useWorkspaceContext();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex items-center gap-2" aria-label="Loading workspaces">
        <Skeleton className="size-8 rounded-lg" />
        <div className="hidden sm:flex sm:flex-col sm:gap-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          void refetchWorkspaces();
        }}
        className="border-destructive/40 text-destructive hover:bg-destructive/10"
        title="Retry loading workspaces"
      >
        <AlertCircle className="size-3.5" />
        <span className="hidden sm:inline">Workspaces unavailable</span>
        <RefreshCw className="size-3" />
      </Button>
    );
  }

  // 3 & 4. Empty State & Success State inside Dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-9 max-w-56 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground shadow-2xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'
        )}
        aria-label="Select workspace"
      >
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground uppercase">
          {activeWorkspace ? activeWorkspace.name.slice(0, 1) : <Briefcase className="size-3" />}
        </div>
        <span className="truncate">
          {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
        </span>
        <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Workspaces</DropdownMenuGroupLabel>

          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderOpen className="size-4" />
              </div>
              <p className="text-xs font-medium text-foreground">No workspaces yet</p>
              <p className="text-[11px] text-muted-foreground">
                Create your first workspace to organize projects and tasks.
              </p>
            </div>
          ) : (
            workspaces.map((workspace) => {
              const isSelected = activeWorkspace?.id === workspace.id;

              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => setActiveWorkspaceId(workspace.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-[11px] font-semibold text-foreground uppercase">
                      {workspace.name.slice(0, 1)}
                    </div>
                    <span className="truncate font-medium">{workspace.name}</span>
                  </div>
                  {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/workspaces')}>
            <Briefcase className="size-4 text-muted-foreground" />
            <span>All Workspaces</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/workspaces?create=true')}>
            <Plus className="size-4 text-muted-foreground" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


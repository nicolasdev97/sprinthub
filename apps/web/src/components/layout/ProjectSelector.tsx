'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ChevronDown, FolderKanban, FolderOpen, Plus, Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Skeleton,
} from '@/components/ui';
import { CreateProjectDialog, useProjects } from '@/features/projects';
import { useWorkspaceContext } from '@/features/workspaces';
import { cn, deletedEntities } from '@/shared/utils';

export function ProjectSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { activeWorkspace } = useWorkspaceContext();

  const segments = pathname.split('/').filter(Boolean);
  const isWorkspacesRoute = segments[0] === 'workspaces';
  const workspaceIdFromUrl =
    isWorkspacesRoute && segments[1] && segments[1] !== 'settings' ? segments[1] : undefined;

  const currentWorkspaceId = workspaceIdFromUrl ?? activeWorkspace?.id;
  const projectIdFromUrl =
    isWorkspacesRoute && segments[2] === 'projects' && segments[3] ? segments[3] : undefined;

  const { data: projects = [], isLoading } = useProjects(currentWorkspaceId ?? '', undefined, {
    enabled: Boolean(currentWorkspaceId) && !deletedEntities.isDeleted(currentWorkspaceId),
  });

  const currentProject = useMemo(() => {
    if (!projectIdFromUrl) return null;
    return projects.find((p) => p.id === projectIdFromUrl) ?? null;
  }, [projects, projectIdFromUrl]);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(trimmed) || p.description?.toLowerCase().includes(trimmed)
    );
  }, [projects, searchQuery]);

  // If no workspace is selected or available, don't show the project selector
  if (!currentWorkspaceId || pathname === '/workspaces' || pathname === '/workspaces/') {
    return null;
  }

  const handleSelectProject = (projectId: string) => {
    setIsOpen(false);
    setSearchQuery('');
    router.push(`/workspaces/${currentWorkspaceId}/projects/${projectId}/tasks`);
  };

  if (isLoading) {
    return <Skeleton className="h-7 w-24 rounded-md" />;
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          className={cn(
            'group inline-flex h-8 max-w-32 sm:max-w-44 items-center gap-1 rounded-md px-2 py-1 text-xs sm:text-sm font-semibold transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer',
            currentProject
              ? 'text-foreground/90 hover:text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Select project"
        >
          <span className="truncate">
            {currentProject ? currentProject.name : 'Select Project'}
          </span>

          <ChevronDown className="size-3 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64 p-1.5">
          {/* Real-time Project Search Bar */}
          <div className="relative mb-1.5 px-1 pt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search projects..."
              className="h-8 pl-8 pr-2 text-xs"
              autoFocus
            />
          </div>

          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Projects</DropdownMenuGroupLabel>

            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FolderOpen className="size-4" />
                </div>
                <p className="text-xs font-medium text-foreground">No projects found</p>
                <p className="text-[11px] text-muted-foreground">
                  {searchQuery ? 'Try a different keyword' : 'Create a project in this workspace'}
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isSelected = currentProject?.id === project.id;

                return (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="truncate font-medium">{project.name}</span>
                    {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(false);
                router.push(`/workspaces/${currentWorkspaceId}/projects`);
              }}
              className="cursor-pointer"
            >
              <FolderKanban className="size-4 text-muted-foreground" />
              <span>All Workspace Projects</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(false);
                setIsCreateProjectOpen(true);
              }}
              className="cursor-pointer"
            >
              <Plus className="size-4 text-muted-foreground" />
              <span>Create Project</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentWorkspaceId && (
        <CreateProjectDialog
          workspaceId={currentWorkspaceId}
          open={isCreateProjectOpen}
          onOpenChange={setIsCreateProjectOpen}
          showTrigger={false}
        />
      )}
    </>
  );
}

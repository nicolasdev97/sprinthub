'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertCircle,
  Briefcase,
  Check,
  ChevronDown,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
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
  Input,
  Skeleton,
} from '@/components/ui';
import { useWorkspaceContext } from '@/features/workspaces';
import { cn } from '@/shared/utils';

export function WorkspaceSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    isLoading,
    isError,
    refetchWorkspaces,
  } = useWorkspaceContext();

  const segments = pathname.split('/').filter(Boolean);
  const isWorkspacesListPage = pathname === '/workspaces' || pathname === '/workspaces/';
  const workspaceIdFromUrl =
    segments[0] === 'workspaces' && segments[1] && segments[1] !== 'settings'
      ? segments[1]
      : undefined;

  // If on the workspaces list page, show "Select Workspace". Otherwise, use URL workspace or active workspace.
  const currentWorkspace = isWorkspacesListPage
    ? null
    : workspaceIdFromUrl
      ? (workspaces.find((w) => w.id === workspaceIdFromUrl) ?? activeWorkspace)
      : activeWorkspace;

  // Filter workspaces based on search query
  const filteredWorkspaces = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return workspaces;
    return workspaces.filter(
      (w) =>
        w.name.toLowerCase().includes(trimmed) ||
        w.description?.toLowerCase().includes(trimmed)
    );
  }, [workspaces, searchQuery]);

  const handleSelectWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setIsOpen(false);
    setSearchQuery('');
    router.push(`/workspaces/${workspaceId}/projects`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5" aria-label="Loading workspace selector">
        <Skeleton className="h-7 w-28 rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void refetchWorkspaces()}
        className="h-8 gap-1.5 px-2 text-xs text-destructive hover:bg-destructive/10"
        title="Retry loading workspaces"
      >
        <AlertCircle className="size-3.5" />
        <span className="hidden sm:inline">Retry</span>
        <RefreshCw className="size-3" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          'group inline-flex h-8 max-w-32 sm:max-w-44 items-center gap-1 rounded-md px-2 py-1 text-xs sm:text-sm font-semibold text-foreground/90 transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer'
        )}
        aria-label="Select workspace"
      >
        <span className="truncate">
          {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
        </span>

        <ChevronDown className="size-3 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64 p-1.5">
        {/* Real-time Workspace Search Bar */}
        <div className="relative mb-1.5 px-1 pt-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search workspaces..."
            className="h-8 pl-8 pr-2 text-xs"
            autoFocus
          />
        </div>

        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Workspaces</DropdownMenuGroupLabel>

          {filteredWorkspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderOpen className="size-4" />
              </div>
              <p className="text-xs font-medium text-foreground">No workspaces found</p>
              <p className="text-[11px] text-muted-foreground">
                {searchQuery ? 'Try a different keyword' : 'Create a workspace to get started'}
              </p>
            </div>
          ) : (
            filteredWorkspaces.map((workspace) => {
              const isSelected = currentWorkspace?.id === workspace.id;

              return (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace.id)}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="truncate font-medium">{workspace.name}</span>
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
              router.push('/workspaces');
            }}
            className="cursor-pointer"
          >
            <Briefcase className="size-4 text-muted-foreground" />
            <span>All Workspaces</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false);
              router.push('/workspaces?create=true');
            }}
            className="cursor-pointer"
          >
            <Plus className="size-4 text-muted-foreground" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

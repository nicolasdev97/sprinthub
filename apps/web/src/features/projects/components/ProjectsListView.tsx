'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Select,
  SelectOption,
  Skeleton,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  useWorkspace,
  useWorkspaceContext,
  useWorkspaceMembers,
} from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';

import { useProjects } from '../hook';
import { ProjectQueryParams, ProjectStatus } from '../types';
import { CreateProjectDialog } from './CreateProjectDialog';
import { ProjectCard } from './ProjectCard';

interface ProjectsListViewProps {
  workspaceId: string;
}

type ArchiveFilterValue = 'ALL' | 'ACTIVE' | 'ARCHIVED';
type StatusFilterValue = 'ALL' | ProjectStatus;

export function ProjectsListView({ workspaceId }: ProjectsListViewProps) {
  const { user } = useAuth();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilterValue>('ACTIVE');
  const [sortBy, setSortBy] = useState<NonNullable<ProjectQueryParams['sortBy']>>('createdAt');
  const [sortOrder, setSortOrder] = useState<NonNullable<ProjectQueryParams['sortOrder']>>('desc');

  useEffect(() => {
    if (workspaceId && activeWorkspaceId !== workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [workspaceId, activeWorkspaceId, setActiveWorkspaceId]);

  const currentMember = members?.find((m) => m.userId === user?.id);
  const canManage =
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN' ||
    workspace?.ownerId === user?.id;

  const queryParams: ProjectQueryParams = {
    ...(searchInput.trim() ? { search: searchInput.trim() } : {}),
    ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    ...(archiveFilter === 'ACTIVE'
      ? { archived: false }
      : archiveFilter === 'ARCHIVED'
        ? { archived: true }
        : {}),
    sortBy,
    sortOrder,
  };

  const {
    data: projects,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjects(workspaceId, queryParams);

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== 'ALL' ||
    archiveFilter !== 'ACTIVE';

  const handleResetFilters = () => {
    setSearchInput('');
    setStatusFilter('ALL');
    setArchiveFilter('ACTIVE');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {workspace ? `${workspace.name} — Projects` : 'Projects'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track project milestones, manage deliverables, and monitor task completion across your workspace.
          </p>
        </div>

        {canManage && (
          <CreateProjectDialog
            workspaceId={workspaceId}
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        )}
      </div>

      {/* Filters & Sorting Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
            aria-label="Search projects"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status, Archive & Sort Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="size-3.5" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilterValue)}
            className="w-36"
            aria-label="Filter by project status"
          >
            <SelectOption value="ALL">All Statuses</SelectOption>
            <SelectOption value="PLANNING">Planning</SelectOption>
            <SelectOption value="ACTIVE">Active</SelectOption>
            <SelectOption value="COMPLETED">Completed</SelectOption>
          </Select>

          <Select
            value={archiveFilter}
            onValueChange={(val) => setArchiveFilter(val as ArchiveFilterValue)}
            className="w-36"
            aria-label="Filter by archive status"
          >
            <SelectOption value="ACTIVE">Active Only</SelectOption>
            <SelectOption value="ARCHIVED">Archived Only</SelectOption>
            <SelectOption value="ALL">All Projects</SelectOption>
          </Select>

          <div className="ml-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ArrowUpDown className="size-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>

          <Select
            value={sortBy}
            onValueChange={(val) =>
              setSortBy(val as NonNullable<ProjectQueryParams['sortBy']>)
            }
            className="w-36"
            aria-label="Sort projects by field"
          >
            <SelectOption value="createdAt">Date Created</SelectOption>
            <SelectOption value="name">Name</SelectOption>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(val) =>
              setSortOrder(val as NonNullable<ProjectQueryParams['sortOrder']>)
            }
            className="w-28"
            aria-label="Sort order"
          >
            <SelectOption value="desc">Newest / Z-A</SelectOption>
            <SelectOption value="asc">Oldest / A-Z</SelectOption>
          </Select>
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading projects"
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                  <Skeleton className="size-7 rounded-md" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Error State */}
      {isError && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load projects</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{normalizeApiError(error).message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void refetch();
              }}
            >
              <RefreshCw className="size-3.5" />
              <span>Retry</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && (!projects || projects.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FolderKanban className="size-6" />
          </div>

          {hasActiveFilters ? (
            <>
              <div className="max-w-md space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  No matching projects found
                </h2>
                <p className="text-sm text-muted-foreground">
                  No projects match your current search or filter criteria. Try adjusting or resetting the filters.
                </p>
              </div>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </>
          ) : (
            <>
              <div className="max-w-md space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  No projects in this workspace yet
                </h2>
                <p className="text-sm text-muted-foreground">
                  {canManage
                    ? 'Create your first project to organize tasks, assign team members, and track sprint execution.'
                    : 'No active projects have been created in this workspace yet. Ask a workspace admin or owner to create one.'}
                </p>
              </div>
              {canManage && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="size-4" />
                  <span>Create My First Project</span>
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* 4. Success State */}
      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canManage={Boolean(canManage)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


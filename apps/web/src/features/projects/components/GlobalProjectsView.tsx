'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import {
  AlertCircle,
  Archive,
  ArrowUpDown,
  Briefcase,
  CheckCircle2,
  CircleDot,
  Clock,
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
  Card,
  Input,
  Select,
  SelectOption,
  Skeleton,
} from '@/components/ui';
import { useWorkspaceContext } from '@/features/workspaces';

import { projectService } from '../service';
import { Project, ProjectStatus } from '../types';
import { CreateProjectDialog } from './CreateProjectDialog';
import { ProjectCard } from './ProjectCard';

type ArchiveFilterValue = 'ALL' | 'ACTIVE' | 'ARCHIVED';
type StatusFilterValue = 'ALL' | ProjectStatus;
type SortByValue = 'createdAt' | 'name';
type SortOrderValue = 'asc' | 'desc';

interface GlobalProjectWithMeta extends Project {
  workspaceName: string;
}

export function GlobalProjectsView() {
  const {
    workspaces,
    isLoading: isWorkspacesLoading,
    isError: isWorkspacesError,
    activeWorkspaceId,
    setActiveWorkspaceId,
    refetchWorkspaces,
  } = useWorkspaceContext();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilterValue>('ACTIVE');
  const [sortBy, setSortBy] = useState<SortByValue>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrderValue>('desc');

  // Query projects for all user workspaces in parallel
  const workspaceProjectConfigs = useMemo(
    () =>
      workspaces.map((ws) => ({
        queryKey: ['projects', ws.id],
        queryFn: () => projectService.getProjects(ws.id),
        enabled: Boolean(ws.id),
      })),
    [workspaces]
  );

  const projectQueries = useQueries({
    queries: workspaceProjectConfigs,
  });

  const isProjectsLoading = projectQueries.some((q) => q.isLoading);
  const isAnyError = projectQueries.some((q) => q.isError);

  const projectsDataFingerprint = projectQueries.map((q) => `${q.dataUpdatedAt}-${q.status}`).join(':');

  // Combine projects across all workspaces
  const allProjects = useMemo<GlobalProjectWithMeta[]>(() => {
    return workspaces.flatMap((ws, index) => {
      const query = projectQueries[index];
      const projects = query?.data ?? [];
      return projects.map((project) => ({
        ...project,
        workspaceName: ws.name,
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, projectsDataFingerprint]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...allProjects];

    // Search filter
    if (searchInput.trim()) {
      const term = searchInput.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.workspaceName.toLowerCase().includes(term)
      );
    }

    // Workspace filter
    if (workspaceFilter !== 'ALL') {
      result = result.filter((p) => p.workspaceId === workspaceFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Archive filter
    if (archiveFilter === 'ACTIVE') {
      result = result.filter((p) => !p.archived);
    } else if (archiveFilter === 'ARCHIVED') {
      result = result.filter((p) => p.archived);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        const comp = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comp : -comp;
      }
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [allProjects, searchInput, workspaceFilter, statusFilter, archiveFilter, sortBy, sortOrder]);

  // Overall metrics
  const activeCount = allProjects.filter((p) => p.status === 'ACTIVE' && !p.archived).length;
  const planningCount = allProjects.filter((p) => p.status === 'PLANNING' && !p.archived).length;
  const completedCount = allProjects.filter((p) => p.status === 'COMPLETED').length;

  const isCustomSort = sortBy !== 'createdAt' || sortOrder !== 'desc';
  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    workspaceFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    archiveFilter !== 'ACTIVE' ||
    isCustomSort;

  const clearFilters = () => {
    setSearchInput('');
    setWorkspaceFilter('ALL');
    setStatusFilter('ALL');
    setArchiveFilter('ACTIVE');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const currentSortValue = `${sortBy}-${sortOrder}`;
  const handleSortChange = (val: string) => {
    const [field, order] = val.split('-') as [SortByValue, SortOrderValue];
    setSortBy(field);
    setSortOrder(order);
  };

  const effectiveWorkspaceIdForCreate =
    workspaceFilter !== 'ALL' ? workspaceFilter : activeWorkspaceId || (workspaces[0]?.id ?? '');

  if (isWorkspacesLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading projects hub">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isWorkspacesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Failed to load workspaces</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-3">
          <p>Could not retrieve workspaces. Please check your connection and try again.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetchWorkspaces()}
            className="w-fit gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>Retry</span>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Briefcase className="size-7" />
        </div>
        <div className="max-w-md space-y-1">
          <h2 className="text-lg font-semibold text-foreground">No workspaces found</h2>
          <p className="text-sm text-muted-foreground">
            Projects belong to a workspace. Create your first workspace to start organizing and
            managing team projects.
          </p>
        </div>
        <Link href="/workspaces?create=true">
          <Button className="gap-2">
            <Plus className="size-4" />
            <span>Create Workspace</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All projects across your workspaces in one centralized, real-time hub.
          </p>
        </div>

        {effectiveWorkspaceIdForCreate && (
          <CreateProjectDialog
            workspaceId={effectiveWorkspaceIdForCreate}
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <FolderKanban className="size-4 text-primary" />
            <span>Total Projects</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isProjectsLoading ? <Skeleton className="h-7 w-12" /> : allProjects.length}
          </div>
        </Card>

        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Active</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isProjectsLoading ? <Skeleton className="h-7 w-12" /> : activeCount}
          </div>
        </Card>

        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Clock className="size-4 text-amber-500" />
            <span>In Planning</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isProjectsLoading ? <Skeleton className="h-7 w-12" /> : planningCount}
          </div>
        </Card>

        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <CheckCircle2 className="size-4 text-violet-500" />
            <span>Completed</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isProjectsLoading ? <Skeleton className="h-7 w-12" /> : completedCount}
          </div>
        </Card>
      </div>

      {/* Toolbar: Search, Filters & Sort */}
      <div className="flex flex-col xl:flex-row xl:items-start gap-2.5 rounded-xl border border-border bg-card p-4">
        {/* Search Input */}
        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
            aria-label="Search all projects"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-col xl:flex-row xl:flex-1 xl:flex-wrap items-stretch xl:items-center gap-2">
          {/* Workspace Filter */}
          <Select
            icon={Briefcase}
            value={workspaceFilter}
            onValueChange={setWorkspaceFilter}
            className="w-full xl:w-44"
            aria-label="Filter by workspace"
          >
            <SelectOption value="ALL">All Workspaces</SelectOption>
            {workspaces.map((ws) => (
              <SelectOption key={ws.id} value={ws.id}>
                {ws.name}
              </SelectOption>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            icon={CircleDot}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilterValue)}
            className="w-full xl:w-40"
            aria-label="Filter by status"
          >
            <SelectOption value="ALL">All Statuses</SelectOption>
            <SelectOption value="PLANNING">Planning</SelectOption>
            <SelectOption value="ACTIVE">Active</SelectOption>
            <SelectOption value="PAUSED">Paused</SelectOption>
            <SelectOption value="COMPLETED">Completed</SelectOption>
          </Select>

          {/* Archive Filter */}
          <Select
            icon={Archive}
            value={archiveFilter}
            onValueChange={(val) => setArchiveFilter(val as ArchiveFilterValue)}
            className="w-full xl:w-44"
            aria-label="Filter by archived state"
          >
            <SelectOption value="ACTIVE">Active Projects</SelectOption>
            <SelectOption value="ARCHIVED">Archived Projects</SelectOption>
            <SelectOption value="ALL">All (Active & Archived)</SelectOption>
          </Select>

          {/* Sort Dropdown */}
          <Select
            icon={ArrowUpDown}
            value={currentSortValue}
            onValueChange={handleSortChange}
            className="w-full xl:w-44"
            aria-label="Sort projects"
          >
            <SelectOption value="createdAt-desc">Newest First</SelectOption>
            <SelectOption value="createdAt-asc">Oldest First</SelectOption>
            <SelectOption value="name-asc">Name (A - Z)</SelectOption>
            <SelectOption value="name-desc">Name (Z - A)</SelectOption>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full xl:w-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Query Error Notice */}
      {isAnyError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Some workspace projects could not be loaded</AlertTitle>
          <AlertDescription>
            One or more workspaces had trouble returning project data. Showing results from
            available workspaces.
          </AlertDescription>
        </Alert>
      )}

      {/* Projects Grid */}
      {isProjectsLoading && allProjects.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/40 px-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Filter className="size-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {hasActiveFilters ? 'No matching projects found' : 'No projects available'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? 'Try adjusting your search query, workspace filter, or status criteria.'
                : 'Create your first project inside a workspace to start collaborating and tracking sprints.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5">
              <X className="size-3.5" />
              <span>Clear Filters</span>
            </Button>
          ) : (
            effectiveWorkspaceIdForCreate && (
              <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5">
                <Plus className="size-4" />
                <span>Create First Project</span>
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                if (activeWorkspaceId !== project.workspaceId) {
                  setActiveWorkspaceId(project.workspaceId);
                }
              }}
            >
              <ProjectCard
                project={project}
                canManage={true}
                workspaceName={project.workspaceName}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

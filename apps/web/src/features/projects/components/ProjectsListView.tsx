'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  CircleDot,
  Clock,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  Settings,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  NotFoundState,
  Select,
  SelectOption,
  Skeleton,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useWorkspaceDashboard } from '@/features/dashboard';
import {
  InviteMemberDialog,
  useWorkspace,
  useWorkspaceContext,
  useWorkspaceMembers,
  WorkspaceStatusBadge,
} from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { deletedEntities } from '@/shared/utils';

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
  const router = useRouter();
  const { user } = useAuth();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useWorkspace(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  const isFromDashboard = fromParam === 'dashboard';
  const isFromTasksHub = fromParam === 'tasks' || fromParam === 'tasks-hub';
  const isFromProjectsHub = fromParam === 'projects' || fromParam === 'projects-hub';

  const backHref = isFromDashboard
    ? '/dashboard'
    : isFromTasksHub
      ? '/tasks'
      : isFromProjectsHub
        ? '/projects'
        : '/workspaces';

  const backLabel = isFromDashboard
    ? 'Back to Dashboard'
    : isFromTasksHub
      ? 'Back to Tasks Hub'
      : isFromProjectsHub
        ? 'Back to Projects Hub'
        : 'Back to Workspaces Hub';

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilterValue>('ACTIVE');
  const [sortBy, setSortBy] = useState<NonNullable<ProjectQueryParams['sortBy']>>('createdAt');
  const [sortOrder, setSortOrder] = useState<NonNullable<ProjectQueryParams['sortOrder']>>('desc');

  useEffect(() => {
    if (
      workspaceId &&
      workspace &&
      !deletedEntities.isDeleted(workspaceId) &&
      activeWorkspaceId !== workspaceId
    ) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [workspaceId, workspace, activeWorkspaceId, setActiveWorkspaceId]);

  const { data: wsMetrics, isLoading: isMetricsLoading } = useWorkspaceDashboard(workspaceId);
  const totalWorkspaceTasks = (wsMetrics?.pendingTasks ?? 0) + (wsMetrics?.completedTasks ?? 0);
  const wsCompletionRate =
    totalWorkspaceTasks > 0
      ? Math.round(((wsMetrics?.completedTasks ?? 0) / totalWorkspaceTasks) * 100)
      : 0;

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

  const isCustomSort = sortBy !== 'createdAt' || sortOrder !== 'desc';

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== 'ALL' ||
    archiveFilter !== 'ACTIVE' ||
    isCustomSort;

  const currentSortValue = `${sortBy}-${sortOrder}`;
  const handleSortChange = (val: string) => {
    const [field, order] = val.split('-') as [
      NonNullable<ProjectQueryParams['sortBy']>,
      NonNullable<ProjectQueryParams['sortOrder']>,
    ];
    setSortBy(field);
    setSortOrder(order);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setStatusFilter('ALL');
    setArchiveFilter('ACTIVE');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  if (isWorkspaceError || (!isWorkspaceLoading && !workspace)) {
    const apiError = workspaceError ? normalizeApiError(workspaceError) : null;
    const isNotFound =
      !apiError ||
      apiError.statusCode === 404 ||
      apiError.statusCode === 403 ||
      apiError.message.toLowerCase().includes('not found') ||
      apiError.message.toLowerCase().includes('forbidden') ||
      apiError.message.toLowerCase().includes('not a member');

    if (isNotFound) {
      return (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Details</h1>
            <p className="text-sm text-muted-foreground">
              This workspace has been deleted or cannot be found.
            </p>
          </div>

          <NotFoundState
            title="Workspace not found or deleted"
            description="This workspace may have been removed or you no longer have access to it."
            actionText="Go to Workspaces"
            actionIcon={<ArrowLeft className="mr-2 size-4" />}
            actionHref="/workspaces"
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href={backHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>{backLabel}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {workspace ? `${workspace.name} — Projects` : 'Projects'}
            </h1>
            {workspace && <WorkspaceStatusBadge isActive={activeWorkspaceId === workspace.id} />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track project milestones, manage deliverables, and monitor task completion across your
            workspace.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/workspaces/${workspaceId}/settings?from=workspace${fromParam ? `&source=${fromParam}` : ''}`}
            >
              <Button variant="outline">
                <Settings className="size-4" />
                <span>Workspace Settings</span>
              </Button>
            </Link>
            <InviteMemberDialog
              workspaceId={workspaceId}
              workspaceName={workspace?.name ?? 'Workspace'}
              trigger={
                <Button variant="outline">
                  <UserPlus className="size-4" />
                  <span>Invite Member</span>
                </Button>
              }
            />
            <CreateProjectDialog
              workspaceId={workspaceId}
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
            />
          </div>
        )}
      </div>

      {/* Workspace Progress & Summary Overview Banner */}
      {!isMetricsLoading && wsMetrics && (
        <div className="flex flex-col gap-3.5 rounded-xl border border-border/70 bg-card/60 p-3.5 lg:flex-row lg:items-center lg:justify-between shadow-2xs">
          {/* Progress bar + Completion Percentage */}
          <div className="flex items-center gap-3.5 min-w-0 w-full lg:w-auto lg:min-w-80">
            <div className="flex flex-col gap-1.5 min-w-0 flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Workspace Progress</span>
                </span>
                <span className="font-semibold text-foreground">{wsCompletionRate}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${wsCompletionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick metrics pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
              <FolderKanban className="size-3 text-sky-500" />
              <span>
                {wsMetrics.totalProjects ?? wsMetrics.activeProjects}{' '}
                {(wsMetrics.totalProjects ?? wsMetrics.activeProjects) === 1
                  ? 'project'
                  : 'projects'}
                {wsMetrics.totalProjects > 0 &&
                  wsMetrics.activeProjects !== wsMetrics.totalProjects && (
                    <span className="ml-1 text-[11px] opacity-75">
                      ({wsMetrics.activeProjects} active)
                    </span>
                  )}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>
                {wsMetrics.completedTasks}{' '}
                {wsMetrics.completedTasks === 1 ? 'task done' : 'tasks done'}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
              <Clock className="size-3 text-blue-500" />
              <span>
                {wsMetrics.pendingTasks}{' '}
                {wsMetrics.pendingTasks === 1 ? 'task pending' : 'tasks pending'}
              </span>
            </span>
            {wsMetrics.overdueTasks > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="size-3" />
                <span>
                  {wsMetrics.overdueTasks}{' '}
                  {wsMetrics.overdueTasks === 1 ? 'task overdue' : 'tasks overdue'}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
                <Users className="size-3 text-purple-500" />
                <span>
                  {members?.length ?? 1} {(members?.length ?? 1) === 1 ? 'member' : 'members'}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters & Sorting Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-start gap-2.5 rounded-xl border border-border bg-card p-4">
        {/* Search Input */}
        <div className="relative w-full xl:w-72 shrink-0">
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
        <div className="flex flex-col xl:flex-row xl:flex-1 xl:flex-wrap items-stretch xl:items-center gap-2">
          <Select
            icon={CircleDot}
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilterValue)}
            className="w-full xl:w-40"
            aria-label="Filter by project status"
          >
            <SelectOption value="ALL">All Statuses</SelectOption>
            <SelectOption value="PLANNING">Planning</SelectOption>
            <SelectOption value="ACTIVE">Active</SelectOption>
            <SelectOption value="COMPLETED">Completed</SelectOption>
          </Select>

          <Select
            icon={Archive}
            value={archiveFilter}
            onValueChange={(val) => setArchiveFilter(val as ArchiveFilterValue)}
            className="w-full xl:w-40"
            aria-label="Filter by archive status"
          >
            <SelectOption value="ACTIVE">Active Only</SelectOption>
            <SelectOption value="ARCHIVED">Archived Only</SelectOption>
            <SelectOption value="ALL">All Projects</SelectOption>
          </Select>

          <Select
            icon={ArrowUpDown}
            value={currentSortValue}
            onValueChange={handleSortChange}
            className="w-full xl:w-44"
            aria-label="Sort projects"
          >
            <SelectOption value="createdAt-desc">Newest First</SelectOption>
            <SelectOption value="createdAt-asc">Oldest First</SelectOption>
            <SelectOption value="name-asc">Name (A-Z)</SelectOption>
            <SelectOption value="name-desc">Name (Z-A)</SelectOption>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="w-full xl:w-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
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
      {isError &&
        !isLoading &&
        (normalizeApiError(error).statusCode === 404 ||
        normalizeApiError(error).statusCode === 403 ||
        normalizeApiError(error).message.toLowerCase().includes('not found') ||
        normalizeApiError(error).message.toLowerCase().includes('forbidden') ||
        normalizeApiError(error).message.toLowerCase().includes('not a member') ? (
          <NotFoundState
            title="Workspace not found or deleted"
            description="This workspace may have been removed or you no longer have access to it."
            actionText="Go to Workspaces"
            actionIcon={<ArrowLeft className="mr-2 size-4" />}
            onAction={() => router.push('/workspaces')}
          />
        ) : (
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
        ))}

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
                  No projects match your current search or filter criteria. Try adjusting or
                  resetting the filters.
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
              workspaceName={workspace?.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

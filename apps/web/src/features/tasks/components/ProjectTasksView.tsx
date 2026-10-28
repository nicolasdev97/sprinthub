'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  CheckSquare,
  CircleDot,
  Flame,
  Kanban,
  List,
  Plus,
  RefreshCw,
  Search,
  Settings,
  X,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Input,
  NotFoundState,
  Select,
  SelectOption,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { ProjectStatusBadge, useProject } from '@/features/projects';
import { useWorkspace, useWorkspaceContext, useWorkspaceMembers } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { deletedEntities } from '@/shared/utils';

import { useTasks } from '../hook';
import { TaskPriority, TaskQueryParams, TaskStatus } from '../types';
import { AssigneeFilterSelect } from './AssigneeFilterSelect';
import { CreateTaskDialog } from './CreateTaskDialog';
import { DueDateFilterSelect } from './DueDateFilterSelect';
import { TaskDetailSheet } from './TaskDetailSheet';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { TaskListTable } from './TaskListTable';

interface ProjectTasksViewProps {
  workspaceId: string;
  projectId: string;
  initialTaskId?: string;
}

type StatusFilterValue = 'ALL' | TaskStatus;
type PriorityFilterValue = 'ALL' | TaskPriority;

export function ProjectTasksView({ workspaceId, projectId, initialTaskId }: ProjectTasksViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user } = useAuth();
  const currentUserId = user?.id;
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useWorkspace(workspaceId);
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useProject(projectId);
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

  const [activeView, setActiveView] = useState<'board' | 'list'>('board');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('TODO');

  const urlTaskId = searchParams.get('taskId') || initialTaskId || null;
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [closedTaskId, setClosedTaskId] = useState<string | null>(null);

  const selectedTaskId =
    activeTaskId || (urlTaskId && urlTaskId !== closedTaskId ? urlTaskId : null);

  const handleSelectTask = (id: string) => {
    setActiveTaskId(id);
    setClosedTaskId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set('taskId', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setActiveTaskId(null);
      if (urlTaskId) {
        setClosedTaskId(urlTaskId);
      }
      if (searchParams.get('taskId')) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('taskId');
        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
      }
    }
  };

  // Filters & Debounced Search
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilterValue>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [dueDateFilter, setDueDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<NonNullable<TaskQueryParams['sortBy']>>('createdAt');
  const [sortOrder, setSortOrder] = useState<NonNullable<TaskQueryParams['sortOrder']>>('desc');

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  const resolvedAssigneeId =
    assigneeFilter === 'ASSIGNED_TO_ME'
      ? currentUserId
      : assigneeFilter === 'ALL' ||
          assigneeFilter === 'UNASSIGNED' ||
          assigneeFilter === 'CREATED_BY_ME'
        ? undefined
        : assigneeFilter;

  const queryParams: TaskQueryParams = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    ...(priorityFilter !== 'ALL' ? { priority: priorityFilter } : {}),
    ...(resolvedAssigneeId ? { assigneeId: resolvedAssigneeId } : {}),
    ...(dueDateFilter ? { dueDate: dueDateFilter } : {}),
    sortBy,
    sortOrder,
  };

  const {
    data: rawTasks,
    isLoading: isTasksLoading,
    isError,
    error,
    refetch,
  } = useTasks(projectId, queryParams);

  const tasks = useMemo(() => {
    if (!rawTasks) return [];
    if (assigneeFilter === 'UNASSIGNED') {
      return rawTasks.filter((t) => !t.assigneeId);
    }
    if (assigneeFilter === 'CREATED_BY_ME' && currentUserId) {
      return rawTasks.filter((t) => t.createdById === currentUserId);
    }
    return rawTasks;
  }, [rawTasks, assigneeFilter, currentUserId]);

  const currentMember = members.find((m) => m.userId === user?.id);
  const canManageProject = Boolean(
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN' ||
    workspace?.ownerId === user?.id
  );
  const isProjectArchived = Boolean(project?.archived);
  const isCustomSort = sortBy !== 'createdAt' || sortOrder !== 'desc';

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    assigneeFilter !== 'ALL' ||
    Boolean(dueDateFilter) ||
    isCustomSort;

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setAssigneeFilter('ALL');
    setDueDateFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const handleOpenCreateInStatus = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setIsCreateOpen(true);
  };

  const fromParam = searchParams.get('from');
  const isFromProjectsHub = fromParam === 'projects' || fromParam === 'projects-hub';
  const isFromTasksHub = fromParam === 'tasks' || fromParam === 'tasks-hub';
  const isFromDashboard = fromParam === 'dashboard';

  const backHref = isFromProjectsHub
    ? '/projects'
    : isFromTasksHub
      ? '/tasks'
      : isFromDashboard
        ? '/dashboard'
        : `/workspaces/${workspaceId}/projects`;

  const backLabel = isFromProjectsHub
    ? 'Back to Projects Hub'
    : isFromTasksHub
      ? 'Back to Tasks Hub'
      : isFromDashboard
        ? 'Back to Dashboard'
        : workspace
          ? `Back to ${workspace.name}`
          : 'Back to Workspace';

  const settingsHref = `/workspaces/${workspaceId}/projects/${projectId}/settings?from=project${
    fromParam ? `&source=${fromParam}` : ''
  }`;

  const totalTasksCount = tasks?.length ?? 0;
  const completedTasksCount = tasks?.filter((t) => t.status === 'DONE').length ?? 0;
  const inProgressTasksCount = tasks?.filter((t) => t.status === 'IN_PROGRESS').length ?? 0;
  const todoTasksCount =
    tasks?.filter((t) => t.status === 'TODO' || t.status === 'BACKLOG').length ?? 0;
  const criticalTasksCount =
    tasks?.filter((t) => t.priority === 'CRITICAL' && t.status !== 'DONE').length ?? 0;
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

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

  if (isProjectError || (!isProjectLoading && !project)) {
    const apiError = projectError ? normalizeApiError(projectError) : null;
    const isForbidden =
      apiError?.statusCode === 403 ||
      apiError?.message.toLowerCase().includes('forbidden') ||
      apiError?.message.toLowerCase().includes('not a member');
    const isNotFound =
      !apiError ||
      isForbidden ||
      apiError.statusCode === 404 ||
      apiError.message.toLowerCase().includes('not found');

    if (isNotFound) {
      return (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Details</h1>
            <p className="text-sm text-muted-foreground">
              This project has been deleted or cannot be found.
            </p>
          </div>

          <NotFoundState
            title="Project not found or deleted"
            description="This project may have been removed or you no longer have access to it."
            actionText={isForbidden ? 'Go to Workspaces' : 'Go to Workspace Projects'}
            actionIcon={<ArrowLeft className="mr-2 size-4" />}
            actionHref={isForbidden ? '/workspaces' : `/workspaces/${workspaceId}/projects`}
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href={backHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>{backLabel}</span>
          </Link>

          {isProjectLoading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {project ? `${project.name} — Tasks` : 'Project Tasks'}
                </h1>
                {project && <ProjectStatusBadge status={project.status} />}
                {isProjectArchived && (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <Archive className="size-3" />
                    <span>Archived</span>
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {project?.description ||
                  'Manage sprint tasks, track progress across columns, and collaborate with your team.'}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canManageProject && (
            <Link href={settingsHref}>
              <Button variant="outline" size="sm">
                <Settings className="size-4" />
                <span>Project Settings</span>
              </Button>
            </Link>
          )}

          <CreateTaskDialog
            projectId={projectId}
            members={members}
            defaultStatus={createDefaultStatus}
            open={isCreateOpen}
            onOpenChange={(nextOpen) => {
              setIsCreateOpen(nextOpen);
              if (!nextOpen) {
                setCreateDefaultStatus('TODO');
              }
            }}
            disabled={isProjectArchived}
          />
        </div>
      </div>

      {isProjectArchived && (
        <Alert>
          <Archive className="size-4" />
          <AlertTitle>This project is archived</AlertTitle>
          <AlertDescription>
            Tasks are in read-only mode. Unarchive the project in Project Settings to create or
            modify tasks.
          </AlertDescription>
        </Alert>
      )}

      {/* Linear-style Project Health & Progress Summary Bar */}
      {!isTasksLoading && tasks && tasks.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
          {/* Progress bar + Completion Percentage */}
          <div className="flex flex-1 items-center gap-3.5 min-w-0">
            <div className="flex flex-col gap-1 min-w-0 flex-1 max-w-sm sm:max-w-md">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Project Progress</span>
                </span>
                <span className="font-semibold text-foreground">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick status breakdown pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>{completedTasksCount} done</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-blue-500" />
              <span>{inProgressTasksCount} in progress</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-slate-400" />
              <span>{todoTasksCount} to do</span>
            </span>
            {criticalTasksCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 font-medium text-red-600 dark:text-red-400">
                <Flame className="size-3" />
                <span>{criticalTasksCount} critical</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dual View Tabs & Filter Bar */}
      <Tabs value={activeView} onValueChange={(val) => setActiveView(val as 'board' | 'list')}>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input with Debounce */}
            <div className="relative w-full sm:max-w-xs md:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-8"
                aria-label="Search tasks"
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

            {/* View Switcher (Board / List) */}
            <div className="flex items-center justify-end shrink-0 w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
                <TabsTrigger value="board" className="justify-center">
                  <Kanban className="size-3.5" />
                  <span>Kanban Board</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="justify-center">
                  <List className="size-3.5" />
                  <span>List View</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col xl:flex-row xl:flex-wrap items-stretch xl:items-center gap-2 border-t border-border/60 pt-3">
            <AssigneeFilterSelect
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              members={members}
              allowCreatedByMe
              allLabel="All Tasks"
              membersTitle="Project Members"
              className="w-full xl:w-44"
            />

            <Select
              icon={CircleDot}
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as StatusFilterValue)}
              className="w-full xl:w-40"
              aria-label="Filter by status"
            >
              <SelectOption value="ALL">All Statuses</SelectOption>
              <SelectOption value="BACKLOG">Backlog</SelectOption>
              <SelectOption value="TODO">To Do</SelectOption>
              <SelectOption value="IN_PROGRESS">In Progress</SelectOption>
              <SelectOption value="REVIEW">In Review</SelectOption>
              <SelectOption value="DONE">Done</SelectOption>
            </Select>

            <Select
              icon={Flame}
              value={priorityFilter}
              onValueChange={(val) => setPriorityFilter(val as PriorityFilterValue)}
              className="w-full xl:w-40"
              aria-label="Filter by priority"
            >
              <SelectOption value="ALL">All Priorities</SelectOption>
              <SelectOption value="CRITICAL">Critical</SelectOption>
              <SelectOption value="HIGH">High</SelectOption>
              <SelectOption value="MEDIUM">Medium</SelectOption>
              <SelectOption value="LOW">Low</SelectOption>
            </Select>

            <DueDateFilterSelect
              value={dueDateFilter}
              onChange={setDueDateFilter}
              className="w-full xl:w-40"
            />

            <Select
              icon={ArrowUpDown}
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(val) => {
                const [newSortBy, newSortOrder] = val.split('-') as [
                  NonNullable<TaskQueryParams['sortBy']>,
                  NonNullable<TaskQueryParams['sortOrder']>,
                ];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="w-full xl:w-44"
              aria-label="Sort tasks"
            >
              <SelectOption value="createdAt-desc">Newest First</SelectOption>
              <SelectOption value="createdAt-asc">Oldest First</SelectOption>
              <SelectOption value="title-asc">Name (A-Z)</SelectOption>
              <SelectOption value="title-desc">Name (Z-A)</SelectOption>
              <SelectOption value="dueDate-asc">Due Date</SelectOption>
              <SelectOption value="priority-desc">Highest Priority</SelectOption>
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

        {/* 1. Loading State (Adapted to Active View) */}
        {isTasksLoading && (
          <div aria-busy="true" aria-label="Loading tasks">
            {activeView === 'board' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="flex min-h-40 xl:min-h-96 flex-col gap-3 rounded-xl border border-border bg-muted/25 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="size-5 rounded-md" />
                    </div>
                    {Array.from({ length: 2 }).map((__, cardIdx) => (
                      <div
                        key={cardIdx}
                        className="space-y-3 rounded-xl border border-border bg-card p-3.5"
                      >
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="size-6 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 rounded-xl border border-border bg-card p-4">
                {Array.from({ length: 5 }).map((_, rowIdx) => (
                  <Skeleton key={rowIdx} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Error State */}
        {isError &&
          !isTasksLoading &&
          (normalizeApiError(error).statusCode === 404 ||
          normalizeApiError(error).statusCode === 403 ||
          normalizeApiError(error).message.toLowerCase().includes('not found') ||
          normalizeApiError(error).message.toLowerCase().includes('forbidden') ||
          normalizeApiError(error).message.toLowerCase().includes('not a member') ? (
            <NotFoundState
              title="Project not found or deleted"
              description="This project may have been removed or you no longer have access to it."
              actionText="Go to Workspaces"
              actionIcon={<ArrowLeft className="mr-2 size-4" />}
              onAction={() => router.push('/workspaces')}
            />
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Unable to load tasks</AlertTitle>
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
        {!isTasksLoading && !isError && (!tasks || tasks.length === 0) && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckSquare className="size-6" />
            </div>

            {hasActiveFilters ? (
              <>
                <div className="max-w-md space-y-1">
                  <h2 className="text-base font-semibold text-foreground">
                    No tasks match your filters
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search query, status, priority, or assignee filter.
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
                    No tasks in this project yet
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Break down your project deliverables into actionable tasks and assign them to
                    team members.
                  </p>
                </div>
                {!isProjectArchived && (
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="size-4" />
                    <span>Create First Task</span>
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* 4. Success State (Dual View Panels) */}
        {!isTasksLoading && !isError && tasks && tasks.length > 0 && (
          <>
            <TabsContent value="board">
              <TaskKanbanBoard
                projectId={projectId}
                tasks={tasks}
                members={members}
                isProjectArchived={isProjectArchived}
                onSelectTask={handleSelectTask}
                onCreateTaskInStatus={handleOpenCreateInStatus}
              />
            </TabsContent>

            <TabsContent value="list">
              <TaskListTable
                projectId={projectId}
                tasks={tasks}
                members={members}
                canManageProject={canManageProject}
                isProjectArchived={isProjectArchived}
                onSelectTask={handleSelectTask}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Task Detail Side Sheet / Drawer */}
      <TaskDetailSheet
        projectId={projectId}
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onOpenChange={handleSheetOpenChange}
        members={members}
        canManageProject={canManageProject}
        isProjectArchived={isProjectArchived}
      />
    </div>
  );
}

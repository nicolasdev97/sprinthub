'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowUpDown,
  CheckSquare,
  Filter,
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
  Select,
  SelectOption,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  deriveProjectKey,
  formatProjectStatusLabel,
  getProjectStatusBadgeVariant,
  useProject,
} from '@/features/projects';
import {
  useWorkspace,
  useWorkspaceContext,
  useWorkspaceMembers,
} from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';

import { useTasks } from '../hook';
import { TaskPriority, TaskQueryParams, TaskStatus } from '../types';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskDetailSheet } from './TaskDetailSheet';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { TaskListTable } from './TaskListTable';

interface ProjectTasksViewProps {
  workspaceId: string;
  projectId: string;
}

type StatusFilterValue = 'ALL' | TaskStatus;
type PriorityFilterValue = 'ALL' | TaskPriority;

export function ProjectTasksView({
  workspaceId,
  projectId,
}: ProjectTasksViewProps) {
  const { user } = useAuth();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: members = [] } = useWorkspaceMembers(workspaceId);

  const [activeView, setActiveView] = useState<'board' | 'list'>('board');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('TODO');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Filters & Debounced Search
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilterValue>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<NonNullable<TaskQueryParams['sortBy']>>('createdAt');
  const [sortOrder, setSortOrder] = useState<NonNullable<TaskQueryParams['sortOrder']>>('desc');

  useEffect(() => {
    if (workspaceId && activeWorkspaceId !== workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [workspaceId, activeWorkspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  const queryParams: TaskQueryParams = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    ...(priorityFilter !== 'ALL' ? { priority: priorityFilter } : {}),
    ...(assigneeFilter !== 'ALL' ? { assigneeId: assigneeFilter } : {}),
    sortBy,
    sortOrder,
  };

  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError,
    error,
    refetch,
  } = useTasks(projectId, queryParams);

  const currentMember = members.find((m) => m.userId === user?.id);
  const canManageProject = Boolean(
    currentMember?.role === 'OWNER' ||
      currentMember?.role === 'ADMIN' ||
      workspace?.ownerId === user?.id
  );
  const isProjectArchived = Boolean(project?.archived);

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    assigneeFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setAssigneeFilter('ALL');
  };

  const handleOpenCreateInStatus = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href={`/workspaces/${workspaceId}/projects`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Projects</span>
          </Link>

          {isProjectLoading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                {project && (
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                    {deriveProjectKey(project)}
                  </span>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {project ? `${project.name} — Tasks` : 'Project Tasks'}
                </h1>
                {project && (
                  <Badge variant={getProjectStatusBadgeVariant(project.status)}>
                    {formatProjectStatusLabel(project.status)}
                  </Badge>
                )}
                {isProjectArchived && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Archived
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
          <Link href={`/workspaces/${workspaceId}/projects/${projectId}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="size-4" />
              <span>Project Settings</span>
            </Button>
          </Link>

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
            Tasks are in read-only mode. Unarchive the project in Project Settings to create or modify tasks.
          </AlertDescription>
        </Alert>
      )}

      {/* Dual View Tabs & Filter Bar */}
      <Tabs
        value={activeView}
        onValueChange={(val) => setActiveView(val as 'board' | 'list')}
      >
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            {/* Search Input with Debounce */}
            <div className="relative flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks by title..."
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
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  <X className="size-3.5" />
                  <span>Clear Filters</span>
                </Button>
              )}

              <TabsList>
                <TabsTrigger value="board">
                  <Kanban className="size-3.5" />
                  <span>Kanban Board</span>
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="size-3.5" />
                  <span>List View</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Filter className="size-3.5" />
              <span>Filter:</span>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as StatusFilterValue)}
              className="h-8 w-36 text-xs"
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
              value={priorityFilter}
              onValueChange={(val) => setPriorityFilter(val as PriorityFilterValue)}
              className="h-8 w-36 text-xs"
              aria-label="Filter by priority"
            >
              <SelectOption value="ALL">All Priorities</SelectOption>
              <SelectOption value="LOW">Low</SelectOption>
              <SelectOption value="MEDIUM">Medium</SelectOption>
              <SelectOption value="HIGH">High</SelectOption>
              <SelectOption value="CRITICAL">Critical</SelectOption>
            </Select>

            <Select
              value={assigneeFilter}
              onValueChange={(val) => setAssigneeFilter(val)}
              className="h-8 w-44 text-xs"
              aria-label="Filter by assignee"
            >
              <SelectOption value="ALL">All Assignees</SelectOption>
              {members.map((member) => {
                const label = member.user
                  ? `${member.user.firstName} ${member.user.lastName}`
                  : member.userId;
                return (
                  <SelectOption key={member.userId} value={member.userId}>
                    {label}
                  </SelectOption>
                );
              })}
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ArrowUpDown className="size-3.5" />
                <span className="hidden sm:inline">Sort:</span>
              </div>

              <Select
                value={sortBy}
                onValueChange={(val) =>
                  setSortBy(val as NonNullable<TaskQueryParams['sortBy']>)
                }
                className="h-8 w-32 text-xs"
                aria-label="Sort tasks by field"
              >
                <SelectOption value="createdAt">Created Date</SelectOption>
                <SelectOption value="dueDate">Due Date</SelectOption>
                <SelectOption value="priority">Priority</SelectOption>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(val) =>
                  setSortOrder(val as NonNullable<TaskQueryParams['sortOrder']>)
                }
                className="h-8 w-28 text-xs"
                aria-label="Sort order"
              >
                <SelectOption value="desc">Descending</SelectOption>
                <SelectOption value="asc">Ascending</SelectOption>
              </Select>
            </div>
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
                    className="flex min-h-96 flex-col gap-3 rounded-xl border border-border bg-muted/25 p-3"
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
        {isError && !isTasksLoading && (
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
        )}

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
                    Break down your project deliverables into actionable tasks and assign them to team members.
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
                onSelectTask={(id) => setSelectedTaskId(id)}
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
                onSelectTask={(id) => setSelectedTaskId(id)}
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
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        members={members}
        canManageProject={canManageProject}
        isProjectArchived={isProjectArchived}
      />
    </div>
  );
}


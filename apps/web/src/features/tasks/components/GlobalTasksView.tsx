'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowUpDown,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Filter,
  Flame,
  FolderKanban,
  ListTodo,
  Plus,
  RefreshCw,
  Search,
  User as UserIcon,
  X,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Button,
  Card,
  Input,
  Select,
  SelectOption,
  Skeleton,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { projectService } from '@/features/projects';
import { useWorkspaceContext } from '@/features/workspaces';
import { cn } from '@/shared/utils';

import { taskService } from '../service';
import { Task, TaskPriority, TaskStatus } from '../types';
import { AssigneeFilterSelect } from './AssigneeFilterSelect';
import { CreateTaskDialog } from './CreateTaskDialog';
import { DueDateFilterSelect } from './DueDateFilterSelect';
import { TaskDueDateBadge, TaskPriorityBadge, TaskStatusBadge } from './TaskBadges';

interface GlobalTaskWithMeta extends Task {
  workspaceId: string;
  workspaceName: string;
  projectName: string;
}

type StatusFilterValue = 'ALL' | TaskStatus;
type PriorityFilterValue = 'ALL' | TaskPriority;
type UserScopeFilter = 'ALL' | 'ASSIGNED_TO_ME' | 'CREATED_BY_ME' | 'UNASSIGNED' | string;
type SortByValue = 'createdAt' | 'dueDate' | 'priority' | 'title';
type SortOrderValue = 'asc' | 'desc';

export function GlobalTasksView() {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const {
    workspaces,
    isLoading: isWorkspacesLoading,
    isError: isWorkspacesError,
    activeWorkspaceId,
    setActiveWorkspaceId,
    refetchWorkspaces,
  } = useWorkspaceContext();

  const [searchInput, setSearchInput] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState<string>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilterValue>('ALL');
  const [userScope, setUserScope] = useState<UserScopeFilter>('ASSIGNED_TO_ME');
  const [dueDateFilter, setDueDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortByValue>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrderValue>('desc');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Step 1: Query projects for all user workspaces in parallel
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

  const projectsDataFingerprint = projectQueries
    .map((q) => `${q.dataUpdatedAt}-${q.status}`)
    .join(':');

  // Combine all projects
  const allProjects = useMemo(() => {
    return workspaces.flatMap((ws, index) => {
      const query = projectQueries[index];
      const projects = query?.data ?? [];
      return projects.map((p) => ({
        ...p,
        workspaceName: ws.name,
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, projectsDataFingerprint]);

  // Step 2: Query tasks for all projects in parallel
  const taskQueryConfigs = useMemo(
    () =>
      allProjects.map((project) => ({
        queryKey: ['tasks', project.id],
        queryFn: () => taskService.getTasks(project.id),
        enabled: Boolean(project.id),
      })),
    [allProjects]
  );

  const taskQueries = useQueries({
    queries: taskQueryConfigs,
  });

  const isTasksLoading = taskQueries.some((q) => q.isLoading);

  const tasksDataFingerprint = taskQueries.map((q) => `${q.dataUpdatedAt}-${q.status}`).join(':');

  // Combine all tasks with metadata
  const allTasks = useMemo<GlobalTaskWithMeta[]>(() => {
    return allProjects.flatMap((project, index) => {
      const query = taskQueries[index];
      const tasks = query?.data ?? [];
      return tasks.map((task) => ({
        ...task,
        workspaceId: project.workspaceId,
        workspaceName: project.workspaceName,
        projectName: project.name,
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProjects, tasksDataFingerprint]);

  // Projects available for filter dropdown (optionally filtered by selected workspace)
  const availableProjectsForFilter = useMemo(() => {
    if (workspaceFilter === 'ALL') return allProjects;
    return allProjects.filter((p) => p.workspaceId === workspaceFilter);
  }, [allProjects, workspaceFilter]);

  // Extract unique team members across tasks for assignee filter
  const allMembers = useMemo(() => {
    const map = new Map<string, { id: string; firstName: string; lastName: string; email?: string }>();
    allTasks.forEach((t) => {
      if (t.assignee) {
        map.set(t.assignee.id, {
          id: t.assignee.id,
          firstName: t.assignee.firstName,
          lastName: t.assignee.lastName,
          email: t.assignee.email,
        });
      }
    });
    return Array.from(map.values());
  }, [allTasks]);

  // Apply filters and sorting
  const filteredTasks = useMemo(() => {
    let result = [...allTasks];

    // Search query
    if (searchInput.trim()) {
      const term = searchInput.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term) ||
          t.projectName.toLowerCase().includes(term) ||
          t.workspaceName.toLowerCase().includes(term)
      );
    }

    // Workspace filter
    if (workspaceFilter !== 'ALL') {
      result = result.filter((t) => t.workspaceId === workspaceFilter);
    }

    // Project filter
    if (projectFilter !== 'ALL') {
      result = result.filter((t) => t.projectId === projectFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Due Date filter
    if (dueDateFilter) {
      result = result.filter((t) => t.dueDate?.slice(0, 10) === dueDateFilter);
    }

    // User Scope or specific assignee filter
    if (userScope === 'ASSIGNED_TO_ME' && currentUserId) {
      result = result.filter((t) => t.assigneeId === currentUserId);
    } else if (userScope === 'CREATED_BY_ME' && currentUserId) {
      result = result.filter((t) => t.createdById === currentUserId);
    } else if (userScope === 'UNASSIGNED') {
      result = result.filter((t) => !t.assigneeId);
    } else if (userScope !== 'ALL') {
      result = result.filter((t) => t.assigneeId === userScope);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityRank: Record<TaskPriority, number> = {
          CRITICAL: 4,
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };
        const rankDiff = priorityRank[b.priority] - priorityRank[a.priority];
        return sortOrder === 'asc' ? -rankDiff : rankDiff;
      }

      if (sortBy === 'title') {
        const comp = a.title.localeCompare(b.title);
        return sortOrder === 'asc' ? comp : -comp;
      }

      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }

      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [
    allTasks,
    searchInput,
    workspaceFilter,
    projectFilter,
    statusFilter,
    priorityFilter,
    dueDateFilter,
    userScope,
    currentUserId,
    sortBy,
    sortOrder,
  ]);

  // Context-aware metrics: react to active scope (userScope, workspace, project, search)
  const scopedTasks = useMemo(() => {
    let result = [...allTasks];

    if (userScope === 'ASSIGNED_TO_ME' && currentUserId) {
      result = result.filter((t) => t.assigneeId === currentUserId);
    } else if (userScope === 'CREATED_BY_ME' && currentUserId) {
      result = result.filter((t) => t.createdById === currentUserId);
    } else if (userScope === 'UNASSIGNED') {
      result = result.filter((t) => !t.assigneeId);
    } else if (userScope !== 'ALL') {
      result = result.filter((t) => t.assigneeId === userScope);
    }

    if (workspaceFilter !== 'ALL') {
      result = result.filter((t) => t.workspaceId === workspaceFilter);
    }

    if (projectFilter !== 'ALL') {
      result = result.filter((t) => t.projectId === projectFilter);
    }

    if (dueDateFilter) {
      result = result.filter((t) => t.dueDate?.slice(0, 10) === dueDateFilter);
    }

    if (searchInput.trim()) {
      const q = searchInput.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allTasks, userScope, currentUserId, workspaceFilter, projectFilter, dueDateFilter, searchInput]);

  const totalScopedTasks = scopedTasks.length;
  const inProgressCount = scopedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const criticalCount = scopedTasks.filter(
    (t) => t.priority === 'CRITICAL' || t.priority === 'HIGH'
  ).length;
  const completedCount = scopedTasks.filter((t) => t.status === 'DONE').length;

  const isCustomSort = sortBy !== 'createdAt' || sortOrder !== 'desc';
  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    workspaceFilter !== 'ALL' ||
    projectFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    userScope !== 'ASSIGNED_TO_ME' ||
    Boolean(dueDateFilter) ||
    isCustomSort;

  const clearFilters = () => {
    setSearchInput('');
    setWorkspaceFilter('ALL');
    setProjectFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setUserScope('ASSIGNED_TO_ME');
    setDueDateFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleDueDateChange = (val: string) => {
    setDueDateFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setCurrentPage(1);
  };

  const handleWorkspaceChange = (val: string) => {
    setWorkspaceFilter(val);
    setProjectFilter('ALL');
    setCurrentPage(1);
  };

  const handleProjectChange = (val: string) => {
    setProjectFilter(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: StatusFilterValue) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handlePriorityChange = (val: PriorityFilterValue) => {
    setPriorityFilter(val);
    setCurrentPage(1);
  };

  const handleUserScopeChange = (val: UserScopeFilter) => {
    setUserScope(val);
    setCurrentPage(1);
  };

  const currentSortValue = `${sortBy}-${sortOrder}`;
  const handleSortChange = (val: string) => {
    const [field, order] = val.split('-') as [SortByValue, SortOrderValue];
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Pagination computations
  const totalTasks = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTasks = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, safePage]);

  const startIndex = totalTasks === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(safePage * ITEMS_PER_PAGE, totalTasks);

  const isLoadingOverall = isWorkspacesLoading || isProjectsLoading || isTasksLoading;

  if (isWorkspacesLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading tasks hub">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-xl" />
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
          <p>Could not retrieve workspaces to show tasks.</p>
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
            Tasks belong to projects within workspaces. Create a workspace to start managing
            projects and sprints.
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Centralized hub tracking all tasks across your workspaces and projects.
          </p>
        </div>

        <CreateTaskDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          triggerLabel="New Task"
        />
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <ListTodo className="size-4 text-primary" />
            <span>Total Tasks</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allTasks.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              totalScopedTasks
            )}
          </div>
        </Card>

        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Clock className="size-4 text-amber-500" />
            <span>In Progress</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allTasks.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              inProgressCount
            )}
          </div>
        </Card>

        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Flame className="size-4 text-red-500" />
            <span>High & Critical</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allTasks.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              criticalCount
            )}
          </div>
        </Card>

        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allTasks.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              completedCount
            )}
          </div>
        </Card>
      </div>

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="flex flex-col xl:flex-row xl:items-start gap-2.5 rounded-xl border border-border bg-card p-4">
        {/* Search Bar */}
        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-8"
            aria-label="Search all tasks"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filters & Sorting (full-width stacked in compact view; wrapped under 'Assigned to me' in desktop view) */}
        <div className="flex flex-col xl:flex-row xl:flex-1 xl:flex-wrap items-stretch xl:items-center gap-2">
          {/* Task Scope & Assignee Filter */}
          <AssigneeFilterSelect
            value={userScope}
            onChange={handleUserScopeChange}
            members={allMembers}
            allowCreatedByMe
            allLabel="All Tasks"
            membersTitle="Team Members"
            className="w-full xl:w-44"
          />

          {/* Workspace Filter */}
          <Select
            icon={Briefcase}
            value={workspaceFilter}
            onValueChange={handleWorkspaceChange}
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

          {/* Project Filter */}
          <Select
            icon={FolderKanban}
            value={projectFilter}
            onValueChange={handleProjectChange}
            className="w-full xl:w-40"
            aria-label="Filter by project"
          >
            <SelectOption value="ALL">All Projects</SelectOption>
            {availableProjectsForFilter.map((p) => (
              <SelectOption key={p.id} value={p.id}>
                {`${p.workspaceName}: ${p.name}`}
              </SelectOption>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            icon={CircleDot}
            value={statusFilter}
            onValueChange={(val) => handleStatusChange(val as StatusFilterValue)}
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

          {/* Priority Filter */}
          <Select
            icon={Flame}
            value={priorityFilter}
            onValueChange={(val) => handlePriorityChange(val as PriorityFilterValue)}
            className="w-full xl:w-40"
            aria-label="Filter by priority"
          >
            <SelectOption value="ALL">All Priorities</SelectOption>
            <SelectOption value="CRITICAL">Critical</SelectOption>
            <SelectOption value="HIGH">High</SelectOption>
            <SelectOption value="MEDIUM">Medium</SelectOption>
            <SelectOption value="LOW">Low</SelectOption>
          </Select>

          {/* Due Date Filter */}
          <DueDateFilterSelect
            value={dueDateFilter}
            onChange={handleDueDateChange}
            className="w-full xl:w-40"
          />

          {/* Sort Dropdown */}
          <Select
            icon={ArrowUpDown}
            value={currentSortValue}
            onValueChange={handleSortChange}
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
              onClick={clearFilters}
              className="w-full xl:w-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      {isLoadingOverall && allTasks.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/40 px-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Filter className="size-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {userScope === 'ASSIGNED_TO_ME' && !hasActiveFilters && allTasks.length > 0
                ? 'No tasks assigned to you'
                : hasActiveFilters
                  ? 'No matching tasks found'
                  : 'No tasks created yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {userScope === 'ASSIGNED_TO_ME' && !hasActiveFilters && allTasks.length > 0
                ? 'You currently have no tasks assigned to you in your workspaces. Switch to "All Tasks" to view team tasks.'
                : hasActiveFilters
                  ? 'Try adjusting your search query, status, priority, or workspace filters.'
                  : 'Tasks created in any project board will appear here for centralized tracking.'}
            </p>
          </div>
          {userScope === 'ASSIGNED_TO_ME' && !hasActiveFilters && allTasks.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUserScopeChange('ALL')}
              className="gap-1.5"
            >
              <span>View All Tasks</span>
            </Button>
          ) : hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5">
              <X className="size-3.5" />
              <span>Clear Filters</span>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {paginatedTasks.map((task) => {
            const assigneeInitials = task.assignee
              ? `${task.assignee.firstName[0] || ''}${task.assignee.lastName[0] || ''}`.toUpperCase()
              : null;
            const assigneeName = task.assignee
              ? `${task.assignee.firstName} ${task.assignee.lastName}`
              : 'Unassigned';

            const taskDetailHref = `/workspaces/${task.workspaceId}/projects/${task.projectId}/tasks?taskId=${task.id}&from=tasks`;
            const projectBoardHref = `/workspaces/${task.workspaceId}/projects/${task.projectId}/tasks?from=tasks`;
            const workspaceProjectsHref = `/workspaces/${task.workspaceId}/projects?from=tasks`;

            return (
              <div
                key={task.id}
                className="group flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-2xs sm:flex-row sm:items-center"
              >
                {/* Left Side: Status, Title, Description, Hierarchy trail */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <TaskStatusBadge status={task.status} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={taskDetailHref}
                        onClick={() => {
                          if (activeWorkspaceId !== task.workspaceId) {
                            setActiveWorkspaceId(task.workspaceId);
                          }
                        }}
                        className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {task.title}
                      </Link>
                      <TaskPriorityBadge priority={task.priority} />
                    </div>

                    {task.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}

                    {/* Workspace & Project Breadcrumb Tag */}
                    <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
                      <Link
                        href={workspaceProjectsHref}
                        onClick={() => {
                          if (activeWorkspaceId !== task.workspaceId) {
                            setActiveWorkspaceId(task.workspaceId);
                          }
                        }}
                        className="inline-flex items-center gap-1 font-medium text-foreground/80 hover:text-primary hover:underline"
                      >
                        <Briefcase className="size-3 text-muted-foreground" />
                        <span>{task.workspaceName}</span>
                      </Link>
                      <span>/</span>
                      <Link
                        href={projectBoardHref}
                        onClick={() => {
                          if (activeWorkspaceId !== task.workspaceId) {
                            setActiveWorkspaceId(task.workspaceId);
                          }
                        }}
                        className="inline-flex items-center gap-1 font-medium text-foreground/80 hover:text-primary hover:underline"
                      >
                        <FolderKanban className="size-3 text-muted-foreground" />
                        <span>{task.projectName}</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right Side: Due Date, Assignee, Open Board CTA */}
                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <TaskDueDateBadge task={task} />

                  <div
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    title={`Assigned to: ${assigneeName}`}
                  >
                    <Avatar className="size-6 text-[10px]">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {assigneeInitials || <UserIcon className="size-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline max-w-28 truncate">{assigneeName}</span>
                  </div>

                  <Link
                    href={projectBoardHref}
                    onClick={() => {
                      if (activeWorkspaceId !== task.workspaceId) {
                        setActiveWorkspaceId(task.workspaceId);
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs text-muted-foreground group-hover:text-foreground"
                    >
                      <span>Open Board</span>
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalTasks > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{startIndex}</span> to{' '}
            <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
            <span className="font-semibold text-foreground">{totalTasks}</span> tasks
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="gap-1 text-xs"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isCurrent = page === safePage;
                  const isNearCurrent = Math.abs(page - safePage) <= 1;
                  const isEdge = page === 1 || page === totalPages;

                  if (!isNearCurrent && !isEdge) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <span key={page} className="px-1 text-xs text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={isCurrent ? 'default' : 'ghost'}
                      size="icon-xs"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'size-7 text-xs',
                        isCurrent && 'pointer-events-none font-bold'
                      )}
                      aria-label={`Page ${page}`}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="gap-1 text-xs"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

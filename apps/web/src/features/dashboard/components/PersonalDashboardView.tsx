'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  FolderKanban,
  Inbox,
  ListTodo,
  Plus,
  Sparkles,
} from 'lucide-react';

import { Badge, Button, Card, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { projectService, ProjectStatusBadge } from '@/features/projects';
import {
  isTaskOverdue,
  Task,
  TaskDueDateBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
  taskService,
} from '@/features/tasks';
import { useWorkspaceContext } from '@/features/workspaces';
import { deletedEntities } from '@/shared/utils';

interface DashboardTaskWithMeta extends Task {
  workspaceId: string;
  workspaceName: string;
  projectName: string;
}

export function PersonalDashboardView() {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const {
    workspaces,
    isLoading: isWorkspacesLoading,
    activeWorkspaceId,
    setActiveWorkspaceId,
  } = useWorkspaceContext();

  // 1. Query projects for all workspaces in parallel
  const projectQueries = useQueries({
    queries: workspaces.map((ws) => ({
      queryKey: ['projects', ws.id],
      queryFn: () => projectService.getProjects(ws.id),
      enabled: Boolean(ws.id) && !deletedEntities.isDeleted(ws.id),
      retry: false,
    })),
  });

  const isProjectsLoading = projectQueries.some((q) => q.isLoading);

  // Combine projects
  const allProjects = useMemo(() => {
    return workspaces.flatMap((ws, index) => {
      const projects = projectQueries[index]?.data ?? [];
      return projects.map((p) => ({
        ...p,
        workspaceName: ws.name,
      }));
    });
  }, [workspaces, projectQueries]);

  // 2. Query tasks across all projects in parallel
  const taskQueries = useQueries({
    queries: allProjects.map((project) => ({
      queryKey: ['tasks', project.id],
      queryFn: () => taskService.getTasks(project.id),
      enabled:
        Boolean(project.id) &&
        !deletedEntities.isDeleted(project.id) &&
        !deletedEntities.isDeleted(project.workspaceId),
      retry: false,
    })),
  });

  const isTasksLoading = taskQueries.some((q) => q.isLoading);

  // Combine tasks
  const allTasks = useMemo<DashboardTaskWithMeta[]>(() => {
    return allProjects.flatMap((project, index) => {
      const tasks = taskQueries[index]?.data ?? [];
      return tasks.map((t) => ({
        ...t,
        workspaceId: project.workspaceId,
        workspaceName: project.workspaceName,
        projectName: project.name,
      }));
    });
  }, [allProjects, taskQueries]);

  // Derived datasets
  const myAssignedTasks = useMemo(() => {
    if (!currentUserId) return [];
    return allTasks
      .filter((t) => t.assigneeId === currentUserId && t.status !== 'DONE')
      .sort((a, b) => {
        // Sort by overdue first, then by priority, then by creation
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allTasks, currentUserId]);

  const urgentTasksCount = useMemo(() => {
    return allTasks.filter((t) => {
      if (t.status === 'DONE') return false;
      return t.priority === 'CRITICAL' || isTaskOverdue(t);
    }).length;
  }, [allTasks]);

  const completedTasksCount = useMemo(
    () => allTasks.filter((t) => t.status === 'DONE').length,
    [allTasks]
  );

  const totalTasksCount = allTasks.length;
  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Active / Recent Projects (first 4 active projects)
  const recentProjects = useMemo(() => {
    return allProjects.filter((p) => !p.archived).slice(0, 4);
  }, [allProjects]);

  // Project status counts (strict status matching)
  const activeProjectsCount = useMemo(() => {
    return allProjects.filter((p) => p.status === 'ACTIVE' && !p.archived).length;
  }, [allProjects]);

  const planningProjectsCount = useMemo(() => {
    return allProjects.filter((p) => p.status === 'PLANNING' && !p.archived).length;
  }, [allProjects]);

  // Meaningful sprint metrics
  const criticalCount = useMemo(
    () => allTasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'DONE').length,
    [allTasks]
  );
  const highCount = useMemo(
    () => allTasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE').length,
    [allTasks]
  );
  const overdueCount = useMemo(() => allTasks.filter((t) => isTaskOverdue(t)).length, [allTasks]);

  // Proactive upcoming deadlines (today and within next 7 days)
  const { dueThisWeekCount, dueTodayCount } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
    const endOfWeek = startOfToday + 7 * 24 * 60 * 60 * 1000;

    let dueThisWeek = 0;
    let dueToday = 0;

    for (const task of allTasks) {
      if (task.status === 'DONE' || !task.dueDate) continue;
      const dueTime = new Date(task.dueDate).getTime();
      if (dueTime >= startOfToday && dueTime < endOfToday) {
        dueToday++;
      }
      if (dueTime >= startOfToday && dueTime <= endOfWeek) {
        dueThisWeek++;
      }
    }

    return { dueThisWeekCount: dueThisWeek, dueTodayCount: dueToday };
  }, [allTasks]);

  // Greeting and date memoized to preserve component purity
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }, []);

  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const isLoadingOverall = isWorkspacesLoading || isProjectsLoading || isTasksLoading;

  return (
    <div className="space-y-8">
      {/* Personalized Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {greeting}, {user?.firstName || 'there'}!
            </h1>
            <Sparkles className="size-5 text-amber-500 shrink-0" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is what needs your attention today across your workspaces and projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>{formattedToday}</span>
          </Badge>
        </div>
      </div>

      {/* Top Actionable KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Card 1: My Assigned Tasks */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            <span>Assigned to You</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allTasks.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              myAssignedTasks.length
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {myAssignedTasks.length === 1
              ? '1 pending task'
              : `${myAssignedTasks.length} pending tasks`}
          </p>
        </Card>

        {/* Card 2: Needs Attention */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Flame className="size-4 text-red-500" />
            <span>Needs Attention</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allTasks.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              urgentTasksCount
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {overdueCount > 0 ? `${overdueCount} overdue · ` : ''}
            {criticalCount} critical
          </p>
        </Card>

        {/* Card 3: Due This Week */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="size-4 text-amber-500" />
            <span>Due This Week</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allTasks.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              dueThisWeekCount
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {dueTodayCount > 0
              ? `${dueTodayCount} due today`
              : dueThisWeekCount > 0
                ? `${dueThisWeekCount} upcoming in 7d`
                : 'All deadlines on track'}
          </p>
        </Card>

        {/* Card 4: Active Projects */}
        <Card className="p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FolderKanban className="size-4 text-sky-500" />
            <span>Active Projects</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {isLoadingOverall && allProjects.length === 0 ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              activeProjectsCount
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {planningProjectsCount > 0
              ? `${planningProjectsCount} in planning · ${workspaces.length} ${workspaces.length === 1 ? 'workspace' : 'workspaces'}`
              : `Across ${workspaces.length} ${workspaces.length === 1 ? 'workspace' : 'workspaces'}`}
          </p>
        </Card>
      </div>

      {/* Main Grid: My Tasks (Left) + Meaningful Analytics (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans): Assigned to Me */}
        <div className="flex flex-col space-y-4 lg:col-span-2">
          <div className="flex h-7 items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">Assigned to You</h2>
              <Badge variant="secondary" className="text-xs">
                {myAssignedTasks.length}
              </Badge>
            </div>
            {myAssignedTasks.length > 0 && (
              <Link
                href="/tasks"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>View all tasks</span>
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>

          <div className="flex flex-col lg:h-[340px]">
            {isLoadingOverall && allTasks.length === 0 ? (
              <div className="h-full space-y-2.5">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : myAssignedTasks.length === 0 ? (
              // Clean Empty State for Assigned Tasks - Matches Workload & Health height
              <div className="flex min-h-[200px] lg:h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Inbox className="size-6" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    No tasks assigned to you right now
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    You are all caught up! When team members assign tasks to you across any
                    workspace or project, they will appear right here.
                  </p>
                </div>
                <Link href="/tasks">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ListTodo className="size-3.5" />
                    <span>Browse All Tasks</span>
                  </Button>
                </Link>
              </div>
            ) : (
              // Scrollable List of Assigned Tasks
              <div className="overflow-y-auto pr-1.5 space-y-2.5 max-h-[340px] lg:h-full">
                {myAssignedTasks.map((task) => {
                  const taskDetailHref = `/workspaces/${task.workspaceId}/projects/${task.projectId}/tasks?taskId=${task.id}&from=dashboard`;
                  const projectBoardHref = `/workspaces/${task.workspaceId}/projects/${task.projectId}/tasks?from=dashboard`;
                  const workspaceProjectsHref = `/workspaces/${task.workspaceId}/projects?from=dashboard`;

                  return (
                    <div
                      key={task.id}
                      className="group flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-2xs sm:flex-row sm:items-center"
                    >
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

                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
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

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                        <TaskDueDateBadge task={task} />

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
          </div>
        </div>

        {/* Right Column (1 span): Meaningful Sprint Health Analytics */}
        <div className="flex flex-col space-y-4">
          <div className="flex h-7 items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Workload & Health</h2>
          </div>

          <Card className="p-4 shadow-2xs flex flex-col justify-between lg:h-[340px]">
            {/* Metric 1: Sprint Progress */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Completion Velocity</span>
                <span className="font-bold text-foreground">{completionRate}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>{completedTasksCount} done</span>
                <span>{totalTasksCount - completedTasksCount} remaining</span>
              </div>
            </div>

            {/* Metric 2: Deadline Status */}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {overdueCount > 0 ? (
                    <AlertTriangle className="size-4 text-destructive" />
                  ) : (
                    <Clock className="size-4 text-amber-500" />
                  )}
                  <span className="text-xs font-semibold text-foreground">
                    {overdueCount > 0 ? 'Overdue Tasks' : 'Deadlines Status'}
                  </span>
                </div>
                <Badge
                  variant={overdueCount > 0 ? 'destructive' : 'secondary'}
                  className="text-[11px]"
                >
                  {overdueCount > 0 ? `${overdueCount} overdue` : 'On track'}
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {overdueCount > 0
                  ? 'Items require immediate team attention to unblock sprint goals.'
                  : 'All assigned tasks with deadlines are currently progressing on time.'}
              </p>
            </div>

            {/* Metric 3: High Priority Focus */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-muted-foreground">
                High Priority Focus (Active)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border/50 bg-card p-2">
                  <span className="text-[11px] text-muted-foreground">Critical</span>
                  <p className="text-lg font-bold text-red-500">{criticalCount}</p>
                </div>
                <div className="rounded-md border border-border/50 bg-card p-2">
                  <span className="text-[11px] text-muted-foreground">High</span>
                  <p className="text-lg font-bold text-amber-500">{highCount}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 2: Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Recent Projects</h2>
            <Badge variant="secondary" className="text-xs">
              {recentProjects.length}
            </Badge>
          </div>
          {allProjects.length > 0 && (
            <Link
              href="/projects"
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Explore all projects</span>
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>

        {isLoadingOverall && allProjects.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          // Clean Empty State for Projects
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FolderKanban className="size-6" />
            </div>
            <div className="max-w-sm space-y-1">
              <h3 className="text-sm font-semibold text-foreground">No recent projects found</h3>
              <p className="text-xs text-muted-foreground">
                You do not have any active projects yet. Join or create a project inside your
                workspaces to start collaborating.
              </p>
            </div>
            <Link href="/projects">
              <Button size="sm" className="gap-1.5 text-xs">
                <Plus className="size-3.5" />
                <span>Go to Projects Hub</span>
              </Button>
            </Link>
          </div>
        ) : (
          // Grid of Projects
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="group flex flex-col justify-between p-4 transition-all hover:border-primary/40 hover:shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/workspaces/${project.workspaceId}/projects?from=dashboard`}
                      onClick={() => {
                        if (activeWorkspaceId !== project.workspaceId) {
                          setActiveWorkspaceId(project.workspaceId);
                        }
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Badge
                        variant="outline"
                        className="gap-1 text-[10px] font-normal border-border/80 cursor-pointer"
                      >
                        <Briefcase className="size-2.5 text-muted-foreground" />
                        <span className="truncate max-w-24">{project.workspaceName}</span>
                      </Badge>
                    </Link>
                    <ProjectStatusBadge
                      status={project.status}
                      className="text-[10px] px-2 py-0.5 h-5"
                    />
                  </div>

                  <Link
                    href={`/workspaces/${project.workspaceId}/projects/${project.id}/tasks?from=dashboard`}
                    onClick={() => {
                      if (activeWorkspaceId !== project.workspaceId) {
                        setActiveWorkspaceId(project.workspaceId);
                      }
                    }}
                    className="block truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {project.name}
                  </Link>

                  {project.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border/60 mt-4">
                  <Link
                    href={`/workspaces/${project.workspaceId}/projects/${project.id}/tasks?from=dashboard`}
                    onClick={() => {
                      if (activeWorkspaceId !== project.workspaceId) {
                        setActiveWorkspaceId(project.workspaceId);
                      }
                    }}
                    className="block w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      <span>Open Tasks</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

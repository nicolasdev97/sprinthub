import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';

import { useProjects } from '@/features/projects';
import { TaskPriority, TaskStatus, taskService } from '@/features/tasks';

import { dashboardService } from '../service';
import { DashboardTaskItem, WorkspaceTasksBreakdown } from '../types';

export const useWorkspaceDashboard = (workspaceId: string) => {
  return useQuery({
    queryKey: ['dashboard', workspaceId],
    queryFn: () => dashboardService.getWorkspaceDashboard(workspaceId),
    enabled: Boolean(workspaceId),
  });
};

export const useWorkspaceMetrics = useWorkspaceDashboard;

export const useWorkspaceTasksBreakdown = (
  workspaceId: string,
  currentUserId?: string
) => {
  const projectsQuery = useProjects(workspaceId);
  const activeProjects = useMemo(
    () =>
      (projectsQuery.data ?? []).filter((project) => project.status === 'ACTIVE'),
    [projectsQuery.data]
  );

  const taskQueries = useQueries({
    queries: activeProjects.map((project) => ({
      queryKey: ['tasks', project.id, undefined] as const,
      queryFn: () => taskService.getTasks(project.id),
      enabled: Boolean(workspaceId && project.id),
    })),
  });

  const isLoading =
    projectsQuery.isLoading || taskQueries.some((query) => query.isLoading);
  const isError =
    projectsQuery.isError || taskQueries.some((query) => query.isError);
  const error =
    projectsQuery.error ?? taskQueries.find((query) => query.error)?.error ?? null;

  const breakdown = useMemo<WorkspaceTasksBreakdown>(() => {
    const byStatus: Record<TaskStatus, number> = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
    };

    const byPriority: Record<TaskPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    const allTasks: DashboardTaskItem[] = [];

    activeProjects.forEach((project, index) => {
      const projectTasks = taskQueries[index]?.data ?? [];
      projectTasks.forEach((task) => {
        byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
        byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;
        allTasks.push({
          ...task,
          project: {
            id: project.id,
            name: project.name,
            status: project.status,
          },
        });
      });
    });

    const openTasks = allTasks.filter((task) => task.status !== 'DONE');

    // Prioritize tasks assigned to the current user, or fall back to workspace open tasks with due dates
    const userAssignedOpenTasks = currentUserId
      ? openTasks.filter((task) => task.assigneeId === currentUserId)
      : [];

    const candidatePool =
      userAssignedOpenTasks.length > 0 ? userAssignedOpenTasks : openTasks;

    const upcomingTasks = [...candidatePool]
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 6);

    const recentTasks = [...allTasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 6);

    return {
      totalTasks: allTasks.length,
      byStatus,
      byPriority,
      upcomingTasks,
      recentTasks,
    };
  }, [activeProjects, taskQueries, currentUserId]);

  const refetchAll = async () => {
    await projectsQuery.refetch();
    await Promise.all(taskQueries.map((query) => query.refetch()));
  };

  return {
    data: breakdown,
    projects: projectsQuery.data ?? [],
    isLoading,
    isError,
    error,
    refetch: refetchAll,
  };
};



'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Sparkles,
} from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import {
  TaskDueDateBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/features/tasks';

import { DashboardTaskItem } from '../types';

interface DashboardUpcomingTasksProps {
  workspaceId: string;
  upcomingTasks: DashboardTaskItem[];
  recentTasks: DashboardTaskItem[];
  currentUserId?: string;
}

export function DashboardUpcomingTasks({
  workspaceId,
  upcomingTasks,
  recentTasks,
  currentUserId,
}: DashboardUpcomingTasksProps) {
  const hasAssignedToCurrentUser =
    Boolean(currentUserId) &&
    upcomingTasks.some((task) => task.assigneeId === currentUserId);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Upcoming Deadlines / Assigned Tasks */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4 text-primary" />
              <span>
                {hasAssignedToCurrentUser
                  ? 'Assigned to You & Upcoming'
                  : 'Upcoming Deadlines'}
              </span>
            </CardTitle>
            <CardDescription>
              {hasAssignedToCurrentUser
                ? 'Open tasks assigned to you ordered by nearest due date'
                : 'Open workspace tasks ordered by nearest due date'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="xs"
            nativeButton={false}
            render={<Link href="/tasks" />}
            className="gap-1 text-xs"
          >
            <span>All tasks</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1">
          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
              <CheckCircle2 className="mb-2 size-7 text-emerald-500/80" />
              <p className="text-sm font-medium text-foreground">
                No pending deadlines
              </p>
              <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                All active tasks are completed or no open tasks have been scheduled yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border">
              {upcomingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/workspaces/${workspaceId}/projects/${task.project.id}/tasks?taskId=${task.id}`}
                  className="flex flex-col gap-2 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                        <FolderKanban className="size-3 text-primary" />
                        {task.project.name}
                      </span>
                      <span>•</span>
                      <TaskDueDateBadge task={task} />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <TaskPriorityBadge priority={task.priority} />
                    <TaskStatusBadge status={task.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Task Activity */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-purple-500" />
              <span>Recent Workspace Activity</span>
            </CardTitle>
            <CardDescription>
              Latest created or updated tasks across active projects
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0">
            Latest {recentTasks.length}
          </Badge>
        </CardHeader>

        <CardContent className="flex-1">
          {recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
              <Sparkles className="mb-2 size-7 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">
                No recent activity
              </p>
              <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                Activity will show up here as your team creates and progresses tasks.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border">
              {recentTasks.map((task) => {
                const updatedDate = new Date(task.updatedAt).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                  }
                );

                return (
                  <Link
                    key={task.id}
                    href={`/workspaces/${workspaceId}/projects/${task.project.id}/tasks?taskId=${task.id}`}
                    className="flex flex-col gap-2 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                          <FolderKanban className="size-3 text-primary" />
                          {task.project.name}
                        </span>
                        <span>•</span>
                        <span>Updated {updatedDate}</span>
                        {task.assignee && (
                          <>
                            <span>•</span>
                            <span>
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardUpcomingTasksSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
      {Array.from({ length: 2 }).map((_, cardIndex) => (
        <Card key={cardIndex}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-64" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border rounded-lg border border-border">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


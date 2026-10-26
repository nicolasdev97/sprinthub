import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
} from 'lucide-react';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import { cn } from '@/shared/utils';

import { WorkspaceDashboard } from '../types';

interface DashboardKpiGridProps {
  metrics: WorkspaceDashboard;
}

export function DashboardKpiGrid({ metrics }: DashboardKpiGridProps) {
  const totalTasks = metrics.pendingTasks + metrics.completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((metrics.completedTasks / totalTasks) * 100) : 0;

  const cards = [
    {
      title: 'Active Tasks',
      value: metrics.pendingTasks,
      description: 'In progress, review, or queued',
      icon: ClipboardList,
      iconClassName: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      badge:
        totalTasks > 0 ? `${totalTasks} total` : 'No tasks yet',
      badgeVariant: 'secondary' as const,
    },
    {
      title: 'Completed Tasks',
      value: metrics.completedTasks,
      description: 'Delivered across active projects',
      icon: CheckCircle2,
      iconClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badge: `${completionRate}% rate`,
      badgeVariant: 'secondary' as const,
    },
    {
      title: 'Overdue Tasks',
      value: metrics.overdueTasks,
      description:
        metrics.overdueTasks > 0
          ? 'Past due date and require attention'
          : 'All deadlines are on track',
      icon: AlertTriangle,
      iconClassName:
        metrics.overdueTasks > 0
          ? 'bg-destructive/10 text-destructive'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badge: metrics.overdueTasks > 0 ? 'Needs attention' : 'On track',
      badgeVariant:
        metrics.overdueTasks > 0 ? ('destructive' as const) : ('outline' as const),
    },
    {
      title: 'Active Projects',
      value: metrics.activeProjects,
      description: 'Currently active in this workspace',
      icon: FolderKanban,
      iconClassName: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      badge:
        metrics.totalProjects > 0
          ? `${metrics.activeProjects}/${metrics.totalProjects} active`
          : 'No projects',
      badgeVariant: 'outline' as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="transition-shadow hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {card.title}
              </CardTitle>
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  card.iconClassName
                )}
              >
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {card.value}
                </span>
                <Badge variant={card.badgeVariant} className="text-[11px]">
                  {card.badge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function DashboardKpiGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="size-8 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-44" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


import { BarChart3, Flame, Layers } from 'lucide-react';

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
} from '@/components/ui';
import { TaskPriority, TaskStatus } from '@/features/tasks';
import { cn } from '@/shared/utils';

import { WorkspaceTasksBreakdown } from '../types';

interface DashboardDistributionChartsProps {
  breakdown: WorkspaceTasksBreakdown;
}

const STATUS_CONFIG: Array<{
  status: TaskStatus;
  label: string;
  barClassName: string;
  dotClassName: string;
}> = [
  {
    status: 'BACKLOG',
    label: 'Backlog',
    barClassName: 'bg-slate-400 dark:bg-slate-500',
    dotClassName: 'bg-slate-400 dark:bg-slate-500',
  },
  {
    status: 'TODO',
    label: 'To Do',
    barClassName: 'bg-primary',
    dotClassName: 'bg-primary',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    barClassName: 'bg-blue-500',
    dotClassName: 'bg-blue-500',
  },
  {
    status: 'REVIEW',
    label: 'In Review',
    barClassName: 'bg-purple-500',
    dotClassName: 'bg-purple-500',
  },
  {
    status: 'DONE',
    label: 'Done',
    barClassName: 'bg-emerald-500',
    dotClassName: 'bg-emerald-500',
  },
];

const PRIORITY_CONFIG: Array<{
  priority: TaskPriority;
  label: string;
  barClassName: string;
  dotClassName: string;
}> = [
  {
    priority: 'CRITICAL',
    label: 'Critical',
    barClassName: 'bg-destructive',
    dotClassName: 'bg-destructive',
  },
  {
    priority: 'HIGH',
    label: 'High',
    barClassName: 'bg-amber-500',
    dotClassName: 'bg-amber-500',
  },
  {
    priority: 'MEDIUM',
    label: 'Medium',
    barClassName: 'bg-blue-500',
    dotClassName: 'bg-blue-500',
  },
  {
    priority: 'LOW',
    label: 'Low',
    barClassName: 'bg-slate-400 dark:bg-slate-500',
    dotClassName: 'bg-slate-400 dark:bg-slate-500',
  },
];

export function DashboardDistributionCharts({
  breakdown,
}: DashboardDistributionChartsProps) {
  const { totalTasks, byStatus, byPriority } = breakdown;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Status Distribution Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4 text-primary" />
              <span>Workflow Status Distribution</span>
            </CardTitle>
            <CardDescription>
              Task breakdown across execution stages
            </CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0">
            {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          {totalTasks === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
              <BarChart3 className="mb-2 size-7 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">
                No workflow data available
              </p>
              <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                Create tasks inside your active projects to visualize workflow distribution.
              </p>
            </div>
          ) : (
            <>
              {/* Stacked multi-segment bar */}
              <div
                className="flex h-3 w-full overflow-hidden rounded-full bg-secondary p-0.5 gap-0.5"
                aria-label="Workflow status stacked bar"
              >
                {STATUS_CONFIG.map((item) => {
                  const count = byStatus[item.status] ?? 0;
                  if (count === 0) return null;
                  const pct = Math.max(4, Math.round((count / totalTasks) * 100));
                  return (
                    <div
                      key={item.status}
                      title={`${item.label}: ${count} (${pct}%)`}
                      className={cn(
                        'h-full first:rounded-l-full last:rounded-r-full transition-all duration-300',
                        item.barClassName
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>

              {/* Per-status rows */}
              <div className="space-y-3.5">
                {STATUS_CONFIG.map((item) => {
                  const count = byStatus[item.status] ?? 0;
                  const pct =
                    totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                  return (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'size-2.5 rounded-full shrink-0',
                              item.dotClassName
                            )}
                          />
                          <span className="font-medium text-foreground">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {count}
                          </span>
                          <span className="w-9 text-right text-[11px]">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        max={100}
                        indicatorClassName={item.barClassName}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Priority Distribution Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="size-4 text-amber-500" />
              <span>Priority & Urgency Breakdown</span>
            </CardTitle>
            <CardDescription>
              Allocation of tasks by severity and impact
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {(byPriority.CRITICAL ?? 0) + (byPriority.HIGH ?? 0)} high/critical
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          {totalTasks === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
              <Flame className="mb-2 size-7 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">
                No priority metrics yet
              </p>
              <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                Once tasks are created and prioritized, their urgency breakdown will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Stacked multi-segment bar */}
              <div
                className="flex h-3 w-full overflow-hidden rounded-full bg-secondary p-0.5 gap-0.5"
                aria-label="Task priority stacked bar"
              >
                {PRIORITY_CONFIG.map((item) => {
                  const count = byPriority[item.priority] ?? 0;
                  if (count === 0) return null;
                  const pct = Math.max(4, Math.round((count / totalTasks) * 100));
                  return (
                    <div
                      key={item.priority}
                      title={`${item.label}: ${count} (${pct}%)`}
                      className={cn(
                        'h-full first:rounded-l-full last:rounded-r-full transition-all duration-300',
                        item.barClassName
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>

              {/* Per-priority rows */}
              <div className="space-y-3.5">
                {PRIORITY_CONFIG.map((item) => {
                  const count = byPriority[item.priority] ?? 0;
                  const pct =
                    totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                  return (
                    <div key={item.priority} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'size-2.5 rounded-full shrink-0',
                              item.dotClassName
                            )}
                          />
                          <span className="font-medium text-foreground">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {count}
                          </span>
                          <span className="w-9 text-right text-[11px]">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={pct}
                        max={100}
                        indicatorClassName={item.barClassName}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardDistributionChartsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
      {Array.from({ length: 2 }).map((_, cardIndex) => (
        <Card key={cardIndex}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-3.5 w-64" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-3 w-full rounded-full" />
            {Array.from({ length: 4 }).map((__, rowIndex) => (
              <div key={rowIndex} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


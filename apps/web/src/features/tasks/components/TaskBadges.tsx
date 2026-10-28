import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Eye,
  Flame,
} from 'lucide-react';

import { Badge } from '@/components/ui';
import { cn } from '@/shared/utils';

import { Task, TaskPriority, TaskStatus } from '../types';

export const TASK_STATUS_COLUMNS: Array<{
  status: TaskStatus;
  label: string;
  description: string;
}> = [
  {
    status: 'BACKLOG',
    label: 'Backlog',
    description: 'Scoped items awaiting sprint scheduling',
  },
  {
    status: 'TODO',
    label: 'To Do',
    description: 'Ready to be picked up',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    description: 'Actively being worked on',
  },
  {
    status: 'REVIEW',
    label: 'In Review',
    description: 'Awaiting code or quality review',
  },
  {
    status: 'DONE',
    label: 'Done',
    description: 'Completed and verified',
  },
];

export function formatTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'BACKLOG':
      return 'Backlog';
    case 'TODO':
      return 'To Do';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'REVIEW':
      return 'In Review';
    case 'DONE':
      return 'Done';
  }
}

export function formatTaskPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'LOW':
      return 'Low';
    case 'MEDIUM':
      return 'Medium';
    case 'HIGH':
      return 'High';
    case 'CRITICAL':
      return 'Critical';
  }
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  switch (status) {
    case 'DONE':
      return (
        <Badge
          variant="secondary"
          className={cn(
            'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            className
          )}
        >
          <CheckCircle2 className="size-3" />
          <span>Done</span>
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge
          variant="secondary"
          className={cn(
            'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
            className
          )}
        >
          <Clock className="size-3" />
          <span>In Progress</span>
        </Badge>
      );
    case 'REVIEW':
      return (
        <Badge
          variant="secondary"
          className={cn(
            'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
            className
          )}
        >
          <Eye className="size-3" />
          <span>In Review</span>
        </Badge>
      );
    case 'TODO':
      return (
        <Badge variant="outline" className={cn('text-foreground', className)}>
          <CircleDot className="size-3 text-primary" />
          <span>To Do</span>
        </Badge>
      );
    case 'BACKLOG':
    default:
      return (
        <Badge variant="outline" className={cn('text-muted-foreground', className)}>
          <Circle className="size-3" />
          <span>Backlog</span>
        </Badge>
      );
  }
}

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  switch (priority) {
    case 'CRITICAL':
      return (
        <Badge variant="destructive" className={className}>
          <Flame className="size-3" />
          <span>Critical</span>
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge
          variant="secondary"
          className={cn(
            'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
            className
          )}
        >
          <ArrowUp className="size-3" />
          <span>High</span>
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="secondary" className={className}>
          <ArrowRight className="size-3" />
          <span>Medium</span>
        </Badge>
      );
    case 'LOW':
    default:
      return (
        <Badge variant="outline" className={cn('text-muted-foreground', className)}>
          <ArrowDown className="size-3" />
          <span>Low</span>
        </Badge>
      );
  }
}

export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'status'>): boolean {
  if (!task.dueDate || task.status === 'DONE') {
    return false;
  }
  const due = new Date(task.dueDate);
  const now = new Date();
  return due.getTime() < now.getTime();
}

export function TaskDueDateBadge({
  task,
  className,
}: {
  task: Pick<Task, 'dueDate' | 'status'>;
  className?: string;
}) {
  if (!task.dueDate) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs text-muted-foreground/75 font-normal',
          className
        )}
      >
        <Calendar className="size-3 shrink-0 opacity-50" />
        <span>No due date</span>
      </span>
    );
  }

  const overdue = isTaskOverdue(task);
  const formatted = new Date(task.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        overdue ? 'font-semibold text-destructive' : 'text-muted-foreground',
        className
      )}
    >
      {overdue ? (
        <AlertTriangle className="size-3 shrink-0" />
      ) : (
        <Calendar className="size-3 shrink-0" />
      )}
      <span>{formatted}</span>
    </span>
  );
}

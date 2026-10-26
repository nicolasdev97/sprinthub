'use client';

import { useState } from 'react';
import {
  CheckSquare,
  ExternalLink,
  Loader2,
  Square,
  Trash2,
} from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  Button,
  Select,
  SelectOption,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { WorkspaceMember } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { cn } from '@/shared/utils';

import { useUpdateTaskStatus } from '../hook';
import { Task, TaskStatus } from '../types';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import {
  formatTaskStatusLabel,
  TaskDueDateBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from './TaskBadges';

interface TaskListTableProps {
  projectId: string;
  tasks: Task[];
  members: WorkspaceMember[];
  canManageProject: boolean;
  isProjectArchived: boolean;
  onSelectTask: (taskId: string) => void;
}

export function TaskListTable({
  projectId,
  tasks,
  members,
  canManageProject,
  isProjectArchived,
  onSelectTask,
}: TaskListTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateStatusMutation = useUpdateTaskStatus(projectId);

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const resolveAssignee = (task: Task) => {
    if (task.assignee) {
      return {
        fullName: `${task.assignee.firstName} ${task.assignee.lastName}`.trim(),
        initials:
          `${task.assignee.firstName.charAt(0)}${task.assignee.lastName.charAt(0)}`.toUpperCase(),
      };
    }

    if (task.assigneeId) {
      const member = members.find((m) => m.userId === task.assigneeId);
      if (member?.user) {
        return {
          fullName: `${member.user.firstName} ${member.user.lastName}`.trim(),
          initials:
            `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`.toUpperCase(),
        };
      }
    }

    return null;
  };

  const handleStatusChange = async (task: Task, nextStatus: TaskStatus) => {
    if (task.status === nextStatus || isProjectArchived) return;
    setUpdatingTaskId(task.id);

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.id,
        data: { status: nextStatus },
      });

      toast({
        title: 'Task status updated',
        description: `"${task.title}" is now ${formatTaskStatusLabel(nextStatus)}.`,
        variant: 'success',
      });
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast({
        title: 'Failed to update task status',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleToggleCompleted = (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    void handleStatusChange(task, nextStatus);
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Done</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isDone = task.status === 'DONE';
              const isUpdating = updatingTaskId === task.id;
              const assignee = resolveAssignee(task);
              const canDelete =
                !isProjectArchived &&
                (canManageProject || (user?.id && task.createdById === user.id));

              return (
                <TableRow key={task.id}>
                  {/* Quick Complete Checkbox Button */}
                  <TableCell>
                    <button
                      type="button"
                      disabled={isProjectArchived || isUpdating}
                      onClick={() => handleToggleCompleted(task)}
                      className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                      aria-label={
                        isDone
                          ? `Mark "${task.title}" as To Do`
                          : `Mark "${task.title}" as Done`
                      }
                    >
                      {isUpdating ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : isDone ? (
                        <CheckSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>
                  </TableCell>

                  {/* Title & Description */}
                  <TableCell className="max-w-xs whitespace-normal">
                    <button
                      type="button"
                      onClick={() => onSelectTask(task.id)}
                      className="group text-left outline-none"
                    >
                      <p
                        className={cn(
                          'font-medium text-foreground transition-colors group-hover:text-primary',
                          isDone && 'line-through text-muted-foreground'
                        )}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </button>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {isProjectArchived ? (
                      <TaskStatusBadge status={task.status} />
                    ) : (
                      <Select
                        value={task.status}
                        disabled={isUpdating}
                        onValueChange={(val) =>
                          void handleStatusChange(task, val as TaskStatus)
                        }
                        className="h-8 w-36 text-xs"
                        aria-label={`Change status for ${task.title}`}
                      >
                        <SelectOption value="BACKLOG">Backlog</SelectOption>
                        <SelectOption value="TODO">To Do</SelectOption>
                        <SelectOption value="IN_PROGRESS">In Progress</SelectOption>
                        <SelectOption value="REVIEW">In Review</SelectOption>
                        <SelectOption value="DONE">Done</SelectOption>
                      </Select>
                    )}
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <TaskPriorityBadge priority={task.priority} />
                  </TableCell>

                  {/* Assignee */}
                  <TableCell>
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6 border border-border">
                          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                            {assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-32 truncate text-xs font-medium text-foreground">
                          {assignee.fullName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>
                    <TaskDueDateBadge task={task} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onSelectTask(task.id)}
                        title="Open task details"
                        aria-label={`Open details for ${task.title}`}
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>

                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setTaskToDelete(task)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete task"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {taskToDelete && (
        <DeleteTaskDialog
          task={taskToDelete}
          open={Boolean(taskToDelete)}
          onOpenChange={(open) => {
            if (!open) setTaskToDelete(null);
          }}
          showTrigger={false}
          onDeleted={() => setTaskToDelete(null)}
        />
      )}
    </>
  );
}


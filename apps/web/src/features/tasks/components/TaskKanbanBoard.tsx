'use client';

import { ArrowRight, Plus } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from '@/components/ui';
import { WorkspaceMember } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { cn } from '@/shared/utils';

import { useUpdateTaskStatus } from '../hook';
import { Task, TaskStatus } from '../types';
import {
  formatTaskStatusLabel,
  TASK_STATUS_COLUMNS,
  TaskDueDateBadge,
  TaskPriorityBadge,
} from './TaskBadges';

interface TaskKanbanBoardProps {
  projectId: string;
  tasks: Task[];
  members: WorkspaceMember[];
  isProjectArchived: boolean;
  onSelectTask: (taskId: string) => void;
  onCreateTaskInStatus: (status: TaskStatus) => void;
}

export function TaskKanbanBoard({
  projectId,
  tasks,
  members,
  isProjectArchived,
  onSelectTask,
  onCreateTaskInStatus,
}: TaskKanbanBoardProps) {
  const { toast } = useToast();
  const updateStatusMutation = useUpdateTaskStatus(projectId);

  const resolveMemberInfo = (task: Task) => {
    if (task.assignee) {
      const fullName = `${task.assignee.firstName} ${task.assignee.lastName}`.trim();
      const initials =
        `${task.assignee.firstName.charAt(0)}${task.assignee.lastName.charAt(0)}`.toUpperCase();
      return { fullName, initials };
    }

    if (task.assigneeId) {
      const member = members.find((m) => m.userId === task.assigneeId);
      if (member?.user) {
        const fullName = `${member.user.firstName} ${member.user.lastName}`.trim();
        const initials =
          `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`.toUpperCase();
        return { fullName, initials };
      }
    }

    return null;
  };

  const handleMoveTask = async (task: Task, targetStatus: TaskStatus) => {
    if (task.status === targetStatus || isProjectArchived) return;

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.id,
        data: { status: targetStatus },
      });

      toast({
        title: 'Task moved',
        description: `"${task.title}" moved to ${formatTaskStatusLabel(targetStatus)}.`,
        variant: 'success',
      });
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast({
        title: 'Failed to move task',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {TASK_STATUS_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

        return (
          <div
            key={column.status}
            className="flex min-h-96 flex-col rounded-xl border border-border bg-muted/25 p-3"
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  {column.label}
                </h3>
                <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
                  {columnTasks.length}
                </Badge>
              </div>

              {!isProjectArchived && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onCreateTaskInStatus(column.status)}
                  title={`Add task to ${column.label}`}
                  aria-label={`Add task to ${column.label}`}
                >
                  <Plus className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Column Cards or Empty Column State */}
            <div className="flex flex-1 flex-col gap-2.5">
              {columnTasks.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No tasks in {column.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                    {column.description}
                  </p>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const assigneeInfo = resolveMemberInfo(task);

                  return (
                    <Card
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className={cn(
                        'cursor-pointer gap-3 py-3.5 transition-all hover:border-primary/50 hover:shadow-xs',
                        task.status === 'DONE' && 'opacity-80'
                      )}
                    >
                      <CardHeader className="px-3.5 py-0">
                        <div className="flex items-center justify-between gap-2">
                          <TaskPriorityBadge priority={task.priority} />

                          {/* Quick Move Dropdown */}
                          {!isProjectArchived && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      title="Move task to status"
                                      aria-label={`Move ${task.title} to another status`}
                                    />
                                  }
                                >
                                  <ArrowRight className="size-3" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuGroup>
                                    <DropdownMenuGroupLabel>Move to</DropdownMenuGroupLabel>
                                    {TASK_STATUS_COLUMNS.filter(
                                      (col) => col.status !== task.status
                                    ).map((col) => (
                                      <DropdownMenuItem
                                        key={col.status}
                                        onClick={() =>
                                          void handleMoveTask(task, col.status)
                                        }
                                      >
                                        <span>{col.label}</span>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>

                        <CardTitle
                          className={cn(
                            'mt-1.5 line-clamp-2 text-sm leading-snug font-semibold',
                            task.status === 'DONE' &&
                              'line-through text-muted-foreground'
                          )}
                        >
                          {task.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="px-3.5 py-0">
                        {task.description && (
                          <p className="mb-2.5 line-clamp-2 text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                          <TaskDueDateBadge task={task} />

                          {assigneeInfo ? (
                            <Avatar
                              className="size-6 border border-border"
                              title={`Assigned to ${assigneeInfo.fullName}`}
                            >
                              <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                                {assigneeInfo.initials}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


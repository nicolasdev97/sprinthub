'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Plus } from 'lucide-react';

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

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [optimisticStatusMap, setOptimisticStatusMap] = useState<
    Record<string, TaskStatus>
  >({});
  const dragCounters = useRef<Record<string, number>>({});
  const isDraggingRef = useRef(false);

  const effectiveTasks = useMemo(() => {
    return tasks.map((task) => {
      const overrideStatus = optimisticStatusMap[task.id];
      return overrideStatus ? { ...task, status: overrideStatus } : task;
    });
  }, [tasks, optimisticStatusMap]);

  const draggedTask = useMemo(() => {
    if (!draggedTaskId) return null;
    return effectiveTasks.find((t) => t.id === draggedTaskId) || null;
  }, [draggedTaskId, effectiveTasks]);

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

    setOptimisticStatusMap((prev) => ({ ...prev, [task.id]: targetStatus }));

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
    } finally {
      setOptimisticStatusMap((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (isProjectArchived) return;
    dragCounters.current[status] = (dragCounters.current[status] || 0) + 1;
    setDragOverStatus(status);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (isProjectArchived) return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (isProjectArchived) return;
    dragCounters.current[status] = (dragCounters.current[status] || 1) - 1;
    if (dragCounters.current[status] <= 0) {
      dragCounters.current[status] = 0;
      setDragOverStatus((prev) => (prev === status ? null : prev));
    }
  };

  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedTaskId(null);
      setDragOverStatus(null);
      dragCounters.current = {};
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, []);

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (isProjectArchived) return;
    dragCounters.current[targetStatus] = 0;
    setDragOverStatus(null);

    const droppedTaskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!droppedTaskId) return;

    const taskToMove = effectiveTasks.find((t) => t.id === droppedTaskId);
    if (taskToMove && taskToMove.status !== targetStatus) {
      void handleMoveTask(taskToMove, targetStatus);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, task: Task) => {
    if (isProjectArchived) return;
    isDraggingRef.current = true;
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      setDraggedTaskId(task.id);
    });
  };

  const handleCardDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
    dragCounters.current = {};
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {TASK_STATUS_COLUMNS.map((column) => {
        const columnTasks = effectiveTasks.filter(
          (task) => task.status === column.status
        );

        const isDropTarget = Boolean(
          dragOverStatus === column.status &&
            draggedTask &&
            draggedTask.status !== column.status
        );

        return (
          <div
            key={column.status}
            onDragEnter={(e) => handleDragEnter(e, column.status)}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={(e) => handleDragLeave(e, column.status)}
            onDrop={(e) => handleDrop(e, column.status)}
            className={cn(
              'flex flex-col rounded-xl border border-border bg-muted/25 p-3 transition-colors duration-150 min-h-0 xl:min-h-[500px]',
              isDropTarget &&
                'border-primary bg-primary/10 ring-2 ring-primary/25 shadow-sm'
            )}
          >
            {/* Column Header */}
            <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
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

            {/* Column Cards or Empty Column State (with responsive internal scroll) */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1 max-h-[380px] sm:max-h-[460px] xl:max-h-[calc(100vh-320px)] [scrollbar-width:thin]">
              {isDropTarget && (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-primary/60 bg-primary/15 py-4 px-3 text-xs font-semibold text-primary transition-all animate-pulse">
                  Drop here to set {column.label}
                </div>
              )}

              {columnTasks.length === 0 && !isDropTarget ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-3 sm:p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No tasks in {column.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80 hidden sm:block xl:block">
                    {column.description}
                  </p>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const assigneeInfo = resolveMemberInfo(task);

                  return (
                    <Card
                      key={task.id}
                      draggable={!isProjectArchived}
                      onDragStart={(e) => handleCardDragStart(e, task)}
                      onDragEnd={handleCardDragEnd}
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        onSelectTask(task.id);
                      }}
                      className={cn(
                        'gap-3 py-3.5 transition-all select-none hover:border-primary/50 hover:shadow-xs',
                        isProjectArchived
                          ? 'cursor-pointer'
                          : 'cursor-grab active:cursor-grabbing',
                        task.status === 'DONE' &&
                          'border-emerald-500/30 bg-emerald-500/[0.03] opacity-85',
                        draggedTaskId === task.id &&
                          'opacity-30 border-dashed border-primary scale-[0.98]'
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
                                <DropdownMenuContent
                                  align="end"
                                  className="w-44"
                                >
                                  <DropdownMenuGroup>
                                    <DropdownMenuGroupLabel>
                                      Move to
                                    </DropdownMenuGroupLabel>
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
                            'mt-1.5 line-clamp-2 text-sm leading-snug font-semibold flex items-start gap-1.5',
                            task.status === 'DONE' &&
                              'line-through text-muted-foreground'
                          )}
                        >
                          {task.status === 'DONE' && (
                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          <span>{task.title}</span>
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

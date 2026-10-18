'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  User as UserIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectOption,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Textarea,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { WorkspaceMember } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';

import {
  useAssignTask,
  useTask,
  useUpdateTask,
  useUpdateTaskPriority,
  useUpdateTaskStatus,
} from '../hook';
import { UpdateTaskFormValues, updateTaskSchema } from '../schema';
import { TaskPriority, TaskStatus } from '../types';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import {
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
  TaskDueDateBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from './TaskBadges';

interface TaskDetailSheetProps {
  projectId: string;
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: WorkspaceMember[];
  canManageProject: boolean;
  isProjectArchived: boolean;
}

function toDateInputValue(isoDate: string | null): string {
  if (!isoDate) return '';
  return isoDate.slice(0, 10);
}

export function TaskDetailSheet({
  projectId,
  taskId,
  open,
  onOpenChange,
  members,
  canManageProject,
  isProjectArchived,
}: TaskDetailSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    data: task,
    isLoading,
    isError,
    error,
    refetch,
  } = useTask(open && taskId ? taskId : '');

  const updateTaskMutation = useUpdateTask(projectId);
  const updateStatusMutation = useUpdateTaskStatus(projectId);
  const updatePriorityMutation = useUpdateTaskPriority(projectId);
  const assignTaskMutation = useAssignTask(projectId);

  const form = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? '',
        dueDate: toDateInputValue(task.dueDate),
      });
    }
  }, [task, form]);

  const handleStatusChange = async (nextStatus: TaskStatus) => {
    if (!task || task.status === nextStatus || isProjectArchived) return;

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.id,
        data: { status: nextStatus },
      });
      toast({
        title: 'Status updated',
        description: `Task moved to ${formatTaskStatusLabel(nextStatus)}.`,
        variant: 'success',
      });
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast({
        title: 'Failed to update status',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  const handlePriorityChange = async (nextPriority: TaskPriority) => {
    if (!task || task.priority === nextPriority || isProjectArchived) return;

    try {
      await updatePriorityMutation.mutateAsync({
        taskId: task.id,
        data: { priority: nextPriority },
      });
      toast({
        title: 'Priority updated',
        description: `Priority set to ${formatTaskPriorityLabel(nextPriority)}.`,
        variant: 'success',
      });
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast({
        title: 'Failed to update priority',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  const handleAssigneeChange = async (nextAssigneeId: string) => {
    if (!task || isProjectArchived || !canManageProject) return;
    const normalizedAssignee = nextAssigneeId ? nextAssigneeId : null;
    if (task.assigneeId === normalizedAssignee) return;

    try {
      await assignTaskMutation.mutateAsync({
        taskId: task.id,
        data: { assigneeId: normalizedAssignee },
      });
      toast({
        title: 'Assignee updated',
        description: normalizedAssignee
          ? 'Task has been assigned to the selected member.'
          : 'Task is now unassigned.',
        variant: 'success',
      });
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast({
        title: 'Failed to assign task',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  const onSubmitDetails = async (values: UpdateTaskFormValues) => {
    if (!task || isProjectArchived) return;
    setServerError(null);

    try {
      const isoDueDate = values.dueDate
        ? new Date(`${values.dueDate}T23:59:59.000Z`).toISOString()
        : null;

      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        data: {
          title: values.title,
          description: values.description?.trim() ? values.description.trim() : null,
          dueDate: isoDueDate,
        },
      });

      toast({
        title: 'Task updated',
        description: 'Task details have been saved.',
        variant: 'success',
      });
    } catch (err) {
      const apiError = normalizeApiError(err);

      if (apiError.errors) {
        const validFields: Array<keyof UpdateTaskFormValues> = [
          'title',
          'description',
          'dueDate',
        ];
        for (const field of validFields) {
          const messages = apiError.errors[field];
          if (messages && messages.length > 0) {
            form.setError(field, { type: 'server', message: messages[0] });
          }
        }
      }

      setServerError(apiError.message);
      toast({
        title: 'Failed to update task',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  const canDelete = Boolean(
    task &&
      !isProjectArchived &&
      (canManageProject || (user?.id && task.createdById === user.id))
  );

  const isSavingDetails = updateTaskMutation.isPending || form.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-lg"
        showCloseButton
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 pr-6">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
              {task ? `#${task.id.slice(0, 8)}` : 'TASK'}
            </span>
            {task && <TaskStatusBadge status={task.status} />}
            {task && <TaskPriorityBadge priority={task.priority} />}
          </div>
          <SheetTitle className="mt-1 line-clamp-2 text-left text-base">
            {task ? task.title : 'Task Details'}
          </SheetTitle>
          <SheetDescription className="text-left text-xs">
            View and update task attributes, assignment, and schedule.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 p-6">
          {/* 1. Loading State */}
          {isLoading && (
            <div className="space-y-4" aria-busy="true" aria-label="Loading task details">
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          )}

          {/* 2. Error State */}
          {isError && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Unable to load task details</AlertTitle>
              <AlertDescription className="mt-2 flex items-center justify-between gap-2">
                <span>{normalizeApiError(error).message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  <RefreshCw className="size-3.5" />
                  <span>Retry</span>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* 3. Success State */}
          {!isLoading && !isError && task && (
            <>
              {isProjectArchived && (
                <Alert>
                  <Archive className="size-4" />
                  <AlertTitle>Project is archived</AlertTitle>
                  <AlertDescription>
                    Tasks in an archived project are read-only.
                  </AlertDescription>
                </Alert>
              )}

              {/* Quick Metadata Controls (Status, Priority, Assignee) */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="detail-task-status" className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <Select
                    id="detail-task-status"
                    value={task.status}
                    disabled={isProjectArchived || updateStatusMutation.isPending}
                    onValueChange={(val) => void handleStatusChange(val as TaskStatus)}
                  >
                    <SelectOption value="BACKLOG">Backlog</SelectOption>
                    <SelectOption value="TODO">To Do</SelectOption>
                    <SelectOption value="IN_PROGRESS">In Progress</SelectOption>
                    <SelectOption value="REVIEW">In Review</SelectOption>
                    <SelectOption value="DONE">Done</SelectOption>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="detail-task-priority" className="text-xs text-muted-foreground">
                    Priority
                  </Label>
                  <Select
                    id="detail-task-priority"
                    value={task.priority}
                    disabled={isProjectArchived || updatePriorityMutation.isPending}
                    onValueChange={(val) => void handlePriorityChange(val as TaskPriority)}
                  >
                    <SelectOption value="LOW">Low</SelectOption>
                    <SelectOption value="MEDIUM">Medium</SelectOption>
                    <SelectOption value="HIGH">High</SelectOption>
                    <SelectOption value="CRITICAL">Critical</SelectOption>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="detail-task-assignee"
                      className="text-xs text-muted-foreground"
                    >
                      <UserIcon className="size-3" />
                      <span>Assignee</span>
                    </Label>
                    {!canManageProject && (
                      <span className="text-[11px] text-muted-foreground">
                        Assigned by Admin / Owner
                      </span>
                    )}
                  </div>
                  <Select
                    id="detail-task-assignee"
                    value={task.assigneeId ?? ''}
                    disabled={
                      isProjectArchived ||
                      !canManageProject ||
                      assignTaskMutation.isPending
                    }
                    onValueChange={(val) => void handleAssigneeChange(val)}
                  >
                    <SelectOption value="">Unassigned</SelectOption>
                    {members.map((member) => {
                      const label = member.user
                        ? `${member.user.firstName} ${member.user.lastName} (${member.user.email})`
                        : member.userId;
                      return (
                        <SelectOption key={member.userId} value={member.userId}>
                          {label}
                        </SelectOption>
                      );
                    })}
                  </Select>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs text-muted-foreground sm:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>Due:</span>
                    <TaskDueDateBadge task={task} />
                  </div>
                  {task.completedAt && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>
                        Completed{' '}
                        {new Date(task.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Editable Task Content Form */}
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Update failed</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitDetails)}
                  className="space-y-4"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Task title"
                            disabled={isProjectArchived || isSavingDetails}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            disabled={isProjectArchived || isSavingDetails}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed task description, checklist, or notes..."
                            rows={5}
                            disabled={isProjectArchived || isSavingDetails}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    {canDelete ? (
                      <DeleteTaskDialog
                        task={task}
                        onDeleted={() => onOpenChange(false)}
                      />
                    ) : (
                      <div />
                    )}

                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        isProjectArchived ||
                        isSavingDetails ||
                        !form.formState.isDirty
                      }
                    >
                      {isSavingDetails ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


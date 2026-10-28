'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  Loader2,
  Save,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DateInput,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  NotFoundState,
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
import { Task, TaskPriority, TaskStatus } from '../types';
import { AssigneeSearchSelect } from './AssigneeSearchSelect';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { TaskDueDateBadge, TaskPriorityBadge, TaskStatusBadge } from './TaskBadges';

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

interface TaskDetailFormProps {
  task: Task;
  projectId: string;
  members: WorkspaceMember[];
  canManageProject: boolean;
  isProjectArchived: boolean;
  canDelete: boolean;
  onClose: () => void;
}

function TaskDetailForm({
  task,
  projectId,
  members,
  canManageProject,
  isProjectArchived,
  canDelete,
  onClose,
}: TaskDetailFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const [draftStatus, setDraftStatus] = useState<TaskStatus>(task.status);
  const [draftPriority, setDraftPriority] = useState<TaskPriority>(task.priority);
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | null>(task.assigneeId ?? null);

  const updateTaskMutation = useUpdateTask(projectId);
  const updateStatusMutation = useUpdateTaskStatus(projectId);
  const updatePriorityMutation = useUpdateTaskPriority(projectId);
  const assignTaskMutation = useAssignTask(projectId);

  const form = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      dueDate: toDateInputValue(task.dueDate),
    },
  });

  // Sync form and local draft state when the task is updated in real time by another user
  useEffect(() => {
    setDraftStatus(task.status);
    setDraftPriority(task.priority);
    setDraftAssigneeId(task.assigneeId ?? null);
    form.reset({
      title: task.title,
      description: task.description ?? '',
      dueDate: toDateInputValue(task.dueDate),
    });
  }, [
    task.updatedAt,
    task.title,
    task.description,
    task.dueDate,
    task.status,
    task.priority,
    task.assigneeId,
    form,
  ]);

  const watchedTitle = useWatch({ control: form.control, name: 'title' });
  const watchedDueDate = useWatch({ control: form.control, name: 'dueDate' });

  const isStatusChanged = draftStatus !== task.status;
  const isPriorityChanged = draftPriority !== task.priority;
  const isAssigneeChanged = (draftAssigneeId ?? null) !== (task.assigneeId ?? null);
  const isFormDirty = form.formState.isDirty;

  const hasAnyChanges = isStatusChanged || isPriorityChanged || isAssigneeChanged || isFormDirty;

  const isSavingDetails =
    updateTaskMutation.isPending ||
    updateStatusMutation.isPending ||
    updatePriorityMutation.isPending ||
    assignTaskMutation.isPending ||
    form.formState.isSubmitting;

  const onSubmit = async (values: UpdateTaskFormValues) => {
    if (isProjectArchived) return;
    setServerError(null);

    try {
      const promises: Promise<unknown>[] = [];

      // 1. Title / Description / DueDate updates
      if (isFormDirty) {
        const isoDueDate = values.dueDate
          ? new Date(`${values.dueDate}T23:59:59.000Z`).toISOString()
          : null;

        promises.push(
          updateTaskMutation.mutateAsync({
            taskId: task.id,
            data: {
              title: values.title.trim(),
              description: values.description?.trim() ? values.description.trim() : null,
              dueDate: isoDueDate,
            },
          })
        );
      }

      // 2. Status update
      if (isStatusChanged) {
        promises.push(
          updateStatusMutation.mutateAsync({
            taskId: task.id,
            data: { status: draftStatus },
          })
        );
      }

      // 3. Priority update
      if (isPriorityChanged) {
        promises.push(
          updatePriorityMutation.mutateAsync({
            taskId: task.id,
            data: { priority: draftPriority },
          })
        );
      }

      // 4. Assignee update
      if (isAssigneeChanged && canManageProject) {
        promises.push(
          assignTaskMutation.mutateAsync({
            taskId: task.id,
            data: { assigneeId: draftAssigneeId ? draftAssigneeId : null },
          })
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      toast({
        title: 'Task updated',
        description: 'All task changes have been saved.',
        variant: 'success',
      });

      // Close the sheet after saving
      onClose();
    } catch (err) {
      const apiError = normalizeApiError(err);

      if (apiError.statusCode === 404 || apiError.message.toLowerCase().includes('not found')) {
        queryClient.setQueryDefaults(['tasks', task.id], { enabled: false });
        queryClient.setQueryData(['tasks', task.id], null);
        toast({
          title: 'Task no longer exists',
          description: 'This task was already deleted.',
          variant: 'destructive',
        });
        return;
      }

      if (apiError.errors) {
        const validFields: Array<keyof UpdateTaskFormValues> = ['title', 'description', 'dueDate'];
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

  return (
    <>
      <SheetHeader className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2 pr-6">
          <TaskStatusBadge status={draftStatus} />
          <TaskPriorityBadge priority={draftPriority} />
        </div>
        <SheetTitle className="mt-1 line-clamp-2 text-left text-base">
          {watchedTitle?.trim() || task.title}
        </SheetTitle>
        <SheetDescription className="text-left text-xs">
          View and update task attributes, assignment, and schedule.
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 p-6">
        {isProjectArchived && (
          <Alert>
            <Archive className="size-4" />
            <AlertTitle>Project is archived</AlertTitle>
            <AlertDescription>Tasks in an archived project are read-only.</AlertDescription>
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
              value={draftStatus}
              disabled={isProjectArchived || isSavingDetails}
              onValueChange={(val) => setDraftStatus(val as TaskStatus)}
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
              value={draftPriority}
              disabled={isProjectArchived || isSavingDetails}
              onValueChange={(val) => setDraftPriority(val as TaskPriority)}
            >
              <SelectOption value="LOW">Low</SelectOption>
              <SelectOption value="MEDIUM">Medium</SelectOption>
              <SelectOption value="HIGH">High</SelectOption>
              <SelectOption value="CRITICAL">Critical</SelectOption>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="detail-task-assignee" className="text-xs text-muted-foreground">
                <UserIcon className="size-3" />
                <span>Assignee</span>
              </Label>
              {!canManageProject && (
                <span className="text-[11px] text-muted-foreground">Assigned by Admin / Owner</span>
              )}
            </div>
            <AssigneeSearchSelect
              id="detail-task-assignee"
              value={draftAssigneeId ?? ''}
              members={members}
              disabled={isProjectArchived || !canManageProject || isSavingDetails}
              onValueChange={(val) => setDraftAssigneeId(val ? val : null)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2 text-xs text-muted-foreground sm:col-span-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>Due:</span>
              {watchedDueDate ? (
                <TaskDueDateBadge
                  task={{
                    ...task,
                    dueDate: new Date(`${watchedDueDate}T23:59:59.000Z`).toISOString(),
                  }}
                />
              ) : (
                <span className="text-xs text-muted-foreground">No due date</span>
              )}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                    <DateInput disabled={isProjectArchived || isSavingDetails} {...field} />
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
              {canDelete ? <DeleteTaskDialog task={task} onDeleted={onClose} /> : <div />}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSavingDetails}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isProjectArchived || isSavingDetails || !hasAnyChanges || !watchedTitle?.trim()
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
            </div>
          </form>
        </Form>
      </div>
    </>
  );
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

  const { data: task, isLoading, isError, error } = useTask(open && taskId ? taskId : '');

  const hadLoadedTaskRef = useRef<boolean>(false);
  useEffect(() => {
    if (task) {
      hadLoadedTaskRef.current = true;
    } else if (open && hadLoadedTaskRef.current && !isLoading && !task) {
      toast({
        title: 'Task deleted',
        description: 'This task was deleted by another member of your team.',
        variant: 'destructive',
      });
      hadLoadedTaskRef.current = false;
      onOpenChange(false);
    }
  }, [task, open, isLoading, toast, onOpenChange]);

  const canDelete = Boolean(
    task && !isProjectArchived && (canManageProject || (user?.id && task.createdById === user.id))
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-lg" showCloseButton>
        {/* 1. Loading State */}
        {isLoading && (
          <>
            <SheetHeader className="border-b border-border px-6 py-4">
              <SheetTitle className="text-left text-base">Loading Task...</SheetTitle>
              <SheetDescription className="text-left text-xs">
                Fetching task attributes and details.
              </SheetDescription>
            </SheetHeader>
            <div
              className="flex flex-1 flex-col gap-5 p-6"
              aria-busy="true"
              aria-label="Loading task details"
            >
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          </>
        )}

        {/* 2. Error State */}
        {((isError && !isLoading) || (!isLoading && !task && open && Boolean(taskId))) && (
          <>
            <SheetHeader className="border-b border-border px-6 py-4">
              <SheetTitle className="text-left text-base">Task Details</SheetTitle>
              <SheetDescription className="text-left text-xs">
                {!error ||
                normalizeApiError(error).statusCode === 404 ||
                normalizeApiError(error).message.toLowerCase().includes('not found')
                  ? 'This task has been deleted or cannot be found.'
                  : 'Unable to load task details.'}
              </SheetDescription>
            </SheetHeader>
            <div className="p-6">
              {!error ||
              normalizeApiError(error).statusCode === 404 ||
              normalizeApiError(error).statusCode === 403 ||
              normalizeApiError(error).message.toLowerCase().includes('not found') ||
              normalizeApiError(error).message.toLowerCase().includes('forbidden') ||
              normalizeApiError(error).message.toLowerCase().includes('not a member') ? (
                <NotFoundState
                  title="Task not found or deleted"
                  description="This task may have been removed or you no longer have access to it."
                  actionText="Close Task"
                  actionIcon={<X className="mr-2 size-4" />}
                  actionVariant="default"
                  onAction={() => onOpenChange(false)}
                  className="py-12"
                />
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Unable to load task details</AlertTitle>
                  <AlertDescription className="mt-2 flex items-center justify-between gap-2">
                    <span>{normalizeApiError(error).message}</span>
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                      <X className="size-3.5" />
                      <span>Close</span>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* 3. Success / Loaded State */}
        {!isLoading && !isError && task && (
          <TaskDetailForm
            key={task.id}
            task={task}
            projectId={projectId}
            members={members}
            canManageProject={canManageProject}
            isProjectArchived={isProjectArchived}
            canDelete={canDelete}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

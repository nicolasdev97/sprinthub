'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DateInput,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectOption,
  Textarea,
  useToast,
} from '@/components/ui';
import { useProjects } from '@/features/projects';
import { useWorkspaceContext, useWorkspaceMembers, WorkspaceMember } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';

import { taskService } from '../service';
import { TaskStatus } from '../types';
import { AssigneeSearchSelect } from './AssigneeSearchSelect';

const unifiedCreateTaskSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace is required'),
  projectId: z.string().min(1, 'Project is required'),
  title: z
    .string()
    .trim()
    .min(1, 'Task name is required')
    .max(200, 'Task name must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Task description must not exceed 2000 characters')
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

type UnifiedCreateTaskFormValues = z.infer<typeof unifiedCreateTaskSchema>;

export interface CreateTaskDialogProps {
  projectId?: string;
  workspaceId?: string;
  members?: WorkspaceMember[];
  defaultStatus?: TaskStatus;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function CreateTaskDialog({
  projectId: propProjectId,
  workspaceId: propWorkspaceId,
  members: propMembers,
  defaultStatus = 'TODO',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
  triggerLabel,
  triggerClassName,
  disabled = false,
}: CreateTaskDialogProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { workspaces, activeWorkspaceId } = useWorkspaceContext();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const setIsOpen = isControlled ? setControlledOpen! : setUncontrolledOpen;

  const [serverError, setServerError] = useState<string | null>(null);

  // Extract route parameters if inside a workspace / project
  const segments = pathname.split('/').filter(Boolean);
  const routeWorkspaceId =
    segments[0] === 'workspaces' && segments[1] && segments[1] !== 'settings'
      ? segments[1]
      : undefined;
  const routeProjectId =
    segments[0] === 'workspaces' && segments[2] === 'projects' && segments[3]
      ? segments[3]
      : undefined;

  const isInsideProjectContext = Boolean(propProjectId || routeProjectId);

  const defaultWorkspaceId =
    propWorkspaceId || routeWorkspaceId || activeWorkspaceId || workspaces[0]?.id || '';
  const defaultProjectId = isInsideProjectContext ? (propProjectId || routeProjectId || '') : '';

  const form = useForm<UnifiedCreateTaskFormValues>({
    resolver: zodResolver(unifiedCreateTaskSchema),
    defaultValues: {
      workspaceId: defaultWorkspaceId,
      projectId: defaultProjectId,
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: defaultStatus,
      assigneeId: '',
      dueDate: '',
    },
  });

  const watchWorkspaceId = useWatch({
    control: form.control,
    name: 'workspaceId',
    defaultValue: defaultWorkspaceId,
  });
  const selectedWorkspaceId = watchWorkspaceId || defaultWorkspaceId;
  const watchProjectId = useWatch({ control: form.control, name: 'projectId' });
  const watchTitle = useWatch({ control: form.control, name: 'title' });

  // Load projects for currently selected workspace
  const { data: rawProjects = [], isLoading: isProjectsLoading } = useProjects(selectedWorkspaceId);
  const availableProjects = useMemo(
    () => rawProjects.filter((p) => !p.archived),
    [rawProjects]
  );

  // Load members for currently selected workspace
  const { data: fetchedMembers = [], isLoading: isMembersLoading } = useWorkspaceMembers(selectedWorkspaceId);
  const availableMembers = useMemo(() => {
    if (propMembers && propMembers.length > 0 && selectedWorkspaceId === (propWorkspaceId || defaultWorkspaceId)) {
      return propMembers;
    }
    return fetchedMembers;
  }, [propMembers, selectedWorkspaceId, propWorkspaceId, defaultWorkspaceId, fetchedMembers]);

  // When dialog opens, reset form values based on context
  useEffect(() => {
    if (isOpen) {
      const activeWs = propWorkspaceId || routeWorkspaceId || activeWorkspaceId || workspaces[0]?.id || '';
      const activePrj = isInsideProjectContext ? (propProjectId || routeProjectId || '') : '';

      form.reset({
        workspaceId: activeWs,
        projectId: activePrj,
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: defaultStatus,
        assigneeId: '',
        dueDate: '',
      });
    }
  }, [isOpen, propWorkspaceId, propProjectId, routeWorkspaceId, routeProjectId, activeWorkspaceId, workspaces, defaultStatus, isInsideProjectContext, form]);

  // Ensure project is synchronized if inside project context when projects load
  useEffect(() => {
    if (isOpen && isInsideProjectContext && availableProjects.length > 0) {
      const targetPrj = propProjectId || routeProjectId;
      if (targetPrj && availableProjects.some((p) => p.id === targetPrj)) {
        form.setValue('projectId', targetPrj, { shouldValidate: true });
      }
    }
  }, [isOpen, isInsideProjectContext, propProjectId, routeProjectId, availableProjects, form]);

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (values: UnifiedCreateTaskFormValues) => {
      const isoDueDate = values.dueDate
        ? new Date(`${values.dueDate}T23:59:59.000Z`).toISOString()
        : null;

      const createdTask = await taskService.createTask(values.projectId, {
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
        priority: values.priority,
        assigneeId: values.assigneeId ? values.assigneeId : null,
        dueDate: isoDueDate,
      });

      if (values.status && values.status !== 'TODO') {
        await taskService.updateTaskStatus(createdTask.id, {
          status: values.status,
        });
      }

      return createdTask;
    },
    onSuccess: (createdTask, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });

      toast({
        title: 'Task created',
        description: `"${createdTask.title}" has been added to the project.`,
        variant: 'success',
      });

      handleOpenChange(false);
    },
    onError: (error) => {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof UnifiedCreateTaskFormValues> = [
          'workspaceId',
          'projectId',
          'title',
          'description',
          'priority',
          'status',
          'assigneeId',
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
        title: 'Failed to create task',
        description: apiError.message,
        variant: 'destructive',
      });
    },
  });

  const isSubmitting = createTaskMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      form.reset({
        workspaceId: defaultWorkspaceId,
        projectId: defaultProjectId,
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: defaultStatus,
        assigneeId: '',
        dueDate: '',
      });
    }
  };

  const onSubmit = (values: UnifiedCreateTaskFormValues) => {
    setServerError(null);
    createTaskMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger
          render={
            <Button
              disabled={disabled}
              className={triggerClassName}
              size={triggerClassName ? undefined : 'sm'}
            />
          }
        >
          <Plus className="size-4 shrink-0" />
          <span className="hidden sm:inline">{triggerLabel || 'New Task'}</span>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project with priority, status, assignee, and target due date.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Unable to create task</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Workspace & Project Selectors */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="workspaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Workspace <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={isSubmitting}
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('projectId', '');
                          form.setValue('assigneeId', '');
                        }}
                        aria-label="Select workspace"
                      >
                        {workspaces.map((ws) => (
                          <SelectOption key={ws.id} value={ws.id}>
                            {ws.name}
                          </SelectOption>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={isSubmitting || isProjectsLoading || availableProjects.length === 0}
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-label="Select project"
                      >
                        {availableProjects.length === 0 ? (
                          <SelectOption value="">
                            {isProjectsLoading ? 'Loading projects...' : 'No active projects'}
                          </SelectOption>
                        ) : (
                          <>
                            <SelectOption value="">Select a project...</SelectOption>
                            {availableProjects.map((p) => (
                              <SelectOption key={p.id} value={p.id}>
                                {p.name}
                              </SelectOption>
                            ))}
                          </>
                        )}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Task Name */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Task Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Implement OAuth2 callback handler"
                      disabled={isSubmitting}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add acceptance criteria, technical notes, or links..."
                      rows={3}
                      disabled={isSubmitting}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Up to 2000 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Initial Status & Priority */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
                    <FormControl>
                      <Select disabled={isSubmitting} {...field}>
                        <SelectOption value="BACKLOG">Backlog</SelectOption>
                        <SelectOption value="TODO">To Do</SelectOption>
                        <SelectOption value="IN_PROGRESS">In Progress</SelectOption>
                        <SelectOption value="REVIEW">In Review</SelectOption>
                        <SelectOption value="DONE">Done</SelectOption>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select disabled={isSubmitting} {...field}>
                        <SelectOption value="LOW">Low</SelectOption>
                        <SelectOption value="MEDIUM">Medium</SelectOption>
                        <SelectOption value="HIGH">High</SelectOption>
                        <SelectOption value="CRITICAL">Critical</SelectOption>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <AssigneeSearchSelect
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                        members={availableMembers}
                        disabled={isSubmitting || isMembersLoading}
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
                      <DateInput
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
              <p className="text-[11px] text-muted-foreground">
                <span className="text-destructive font-semibold">*</span> Required fields
              </p>
              <div className="flex items-center gap-2 justify-end">
                <DialogClose render={<Button variant="outline" disabled={isSubmitting} />}>
                  Cancel
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting || !watchTitle?.trim() || !watchProjectId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Task</span>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

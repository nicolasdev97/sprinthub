'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
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
import { WorkspaceMember } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';

import { useCreateTask, useUpdateTaskStatus } from '../hook';
import { CreateTaskFormValues, createTaskSchema } from '../schema';
import { TaskStatus } from '../types';

interface CreateTaskDialogProps {
  projectId: string;
  members: WorkspaceMember[];
  defaultStatus?: TaskStatus;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  disabled?: boolean;
}

export function CreateTaskDialog({
  projectId,
  members,
  defaultStatus = 'TODO',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
  disabled = false,
}: CreateTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const { toast } = useToast();
  const createTaskMutation = useCreateTask(projectId);
  const updateStatusMutation = useUpdateTaskStatus(projectId);

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: defaultStatus,
      assigneeId: '',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setValue('status', defaultStatus);
    }
  }, [defaultStatus, isOpen, form]);

  const isSubmitting =
    createTaskMutation.isPending ||
    updateStatusMutation.isPending ||
    form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      form.reset({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: defaultStatus,
        assigneeId: '',
        dueDate: '',
      });
    }
  };

  const onSubmit = async (values: CreateTaskFormValues) => {
    setServerError(null);

    try {
      const isoDueDate = values.dueDate
        ? new Date(`${values.dueDate}T23:59:59.000Z`).toISOString()
        : null;

      const createdTask = await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description?.trim() ? values.description.trim() : null,
        priority: values.priority,
        assigneeId: values.assigneeId ? values.assigneeId : null,
        dueDate: isoDueDate,
      });

      if (values.status && values.status !== 'TODO') {
        await updateStatusMutation.mutateAsync({
          taskId: createdTask.id,
          data: { status: values.status },
        });
      }

      toast({
        title: 'Task created',
        description: `"${createdTask.title}" has been added to the project.`,
        variant: 'success',
      });
      handleOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof CreateTaskFormValues> = [
          'title',
          'description',
          'priority',
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger render={<Button disabled={disabled} />}>
          <Plus className="size-4" />
          <span>New Task</span>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to this project with priority, status, assignee, and target due date.
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Implement OAuth2 callback handler"
                      disabled={isSubmitting}
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add acceptance criteria, technical notes, or links..."
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee (Optional)</FormLabel>
                    <FormControl>
                      <Select disabled={isSubmitting} {...field}>
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
                    </FormControl>
                    <FormDescription>
                      Select a workspace member to assign.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Target completion date.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose render={<Button variant="outline" disabled={isSubmitting} />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Task</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


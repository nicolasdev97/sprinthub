'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

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
import { useWorkspaceContext } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';

import { projectService } from '../service';
import { CreateProjectFormValues, createProjectSchema } from '../schema';

interface CreateProjectDialogProps {
  workspaceId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
}

export function CreateProjectDialog({
  workspaceId: propWorkspaceId,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
  triggerLabel = 'New Project',
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { workspaces, activeWorkspaceId } = useWorkspaceContext();

  const defaultWorkspaceId = propWorkspaceId || activeWorkspaceId || workspaces[0]?.id || '';

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      workspaceId: defaultWorkspaceId,
      name: '',
      description: '',
      status: 'PLANNING',
    },
  });

  // Sync workspaceId when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentVal = form.getValues('workspaceId');
      if (!currentVal && defaultWorkspaceId) {
        form.setValue('workspaceId', defaultWorkspaceId);
      }
    }
  }, [isOpen, defaultWorkspaceId, form]);

  const watchedWorkspaceId = useWatch({
    control: form.control,
    name: 'workspaceId',
    defaultValue: defaultWorkspaceId,
  });

  const watchedName = useWatch({
    control: form.control,
    name: 'name',
  });

  const createProjectMutation = useMutation({
    mutationFn: ({
      targetWorkspaceId,
      data,
    }: {
      targetWorkspaceId: string;
      data: {
        name: string;
        description?: string | null;
        status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
      };
    }) => projectService.createProject(targetWorkspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.targetWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const isSubmitting = createProjectMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      form.reset({
        workspaceId: defaultWorkspaceId,
        name: '',
        description: '',
        status: 'PLANNING',
      });
    }
  };

  const onSubmit = async (values: CreateProjectFormValues) => {
    setServerError(null);

    try {
      const created = await createProjectMutation.mutateAsync({
        targetWorkspaceId: values.workspaceId,
        data: {
          name: values.name,
          description: values.description?.trim() ? values.description.trim() : null,
          status: values.status,
        },
      });

      toast({
        title: 'Project created',
        description: `"${created.name}" has been added to the workspace.`,
        variant: 'success',
      });
      handleOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof CreateProjectFormValues> = [
          'workspaceId',
          'name',
          'description',
          'status',
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
        title: 'Failed to create project',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger render={<Button />}>
          <Plus className="size-4" />
          <span>{triggerLabel}</span>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Launch a new project within a workspace to organize tasks and track sprint progress.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Unable to create project</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Workspace Selector */}
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
                      disabled={isSubmitting || workspaces.length === 0}
                      value={field.value}
                      onValueChange={field.onChange}
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

            {/* Project Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mobile App Redesign"
                      disabled={isSubmitting}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Must be unique within the selected workspace.</FormDescription>
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
                      placeholder="Outline the goals, scope, or deliverables for this project..."
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Up to 1000 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Initial Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <FormControl>
                    <Select disabled={isSubmitting} {...field}>
                      <SelectOption value="PLANNING">
                        Planning — Scoping requirements and backlog
                      </SelectOption>
                      <SelectOption value="ACTIVE">Active — Currently in development</SelectOption>
                      <SelectOption value="COMPLETED">
                        Completed — Delivered and finished
                      </SelectOption>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  disabled={isSubmitting || !watchedName?.trim() || !watchedWorkspaceId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
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

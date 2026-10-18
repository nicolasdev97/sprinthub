'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { normalizeApiError } from '@/shared/errors';

import { useCreateProject } from '../hook';
import { CreateProjectFormValues, createProjectSchema } from '../schema';

interface CreateProjectDialogProps {
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function CreateProjectDialog({
  workspaceId,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const { toast } = useToast();
  const createProjectMutation = useCreateProject(workspaceId);

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'PLANNING',
    },
  });

  const watchedName = useWatch({
    control: form.control,
    name: 'name',
  });

  const derivedPrefix =
    (watchedName ?? '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 3)
      .toUpperCase() || 'PRJ';

  const isSubmitting = createProjectMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      form.reset({
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
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
        status: values.status,
      });

      toast({
        title: 'Project created',
        description: `"${created.name}" has been added to your workspace.`,
        variant: 'success',
      });
      handleOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof CreateProjectFormValues> = [
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
          <span>New Project</span>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Launch a new project within this workspace to organize tasks and track sprint progress.
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Project Name</FormLabel>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                      Key Prefix: {derivedPrefix}
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mobile App Redesign"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be unique within the current workspace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <SelectOption value="ACTIVE">
                        Active — Currently in development
                      </SelectOption>
                      <SelectOption value="COMPLETED">
                        Completed — Delivered and finished
                      </SelectOption>
                    </Select>
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
                  <span>Create Project</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


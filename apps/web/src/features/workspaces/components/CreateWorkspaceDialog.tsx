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
  Textarea,
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useWorkspaceContext } from '../context';
import { useCreateWorkspace } from '../hook';
import { CreateWorkspaceFormValues, createWorkspaceSchema } from '../schema';

interface CreateWorkspaceDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
}

export function CreateWorkspaceDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
  triggerLabel = 'New Workspace',
}: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const { setActiveWorkspaceId } = useWorkspaceContext();
  const { toast } = useToast();
  const createWorkspaceMutation = useCreateWorkspace();

  const form = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const watchedName = useWatch({
    control: form.control,
    name: 'name',
  });

  const isSubmitting = createWorkspaceMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      form.reset();
    }
  };

  const onSubmit = async (values: CreateWorkspaceFormValues) => {
    setServerError(null);

    try {
      const created = await createWorkspaceMutation.mutateAsync({
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
      });

      setActiveWorkspaceId(created.id);
      toast({
        title: 'Workspace created',
        description: `"${created.name}" is now your active workspace.`,
        variant: 'success',
      });
      handleOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof CreateWorkspaceFormValues> = ['name', 'description'];
        for (const field of validFields) {
          const messages = apiError.errors[field];
          if (messages && messages.length > 0) {
            form.setError(field, { type: 'server', message: messages[0] });
          }
        }
      }

      setServerError(apiError.message);
      toast({
        title: 'Failed to create workspace',
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
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a new shared space to organize your team&apos;s projects and tasks.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Unable to create workspace</AlertTitle>
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
                  <FormLabel>
                    Workspace Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Acme Product Engineering"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be unique and up to 100 characters.
                  </FormDescription>
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
                      placeholder="Briefly describe the purpose of this workspace..."
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Up to 500 characters.</FormDescription>
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
                <Button type="submit" disabled={isSubmitting || !watchedName?.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Workspace</span>
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


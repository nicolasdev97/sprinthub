'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useDeleteWorkspace } from '../hook';
import { createDeleteWorkspaceConfirmSchema, DeleteWorkspaceConfirmFormValues } from '../schema';
import { Workspace } from '../types';

interface DeleteWorkspaceDialogProps {
  workspace: Workspace;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function DeleteWorkspaceDialog({
  workspace,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
}: DeleteWorkspaceDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const deleteWorkspaceMutation = useDeleteWorkspace();
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const form = useForm<DeleteWorkspaceConfirmFormValues>({
    resolver: zodResolver(createDeleteWorkspaceConfirmSchema(workspace.name)),
    defaultValues: {
      confirmationName: '',
    },
  });

  const confirmationValue = useWatch({
    control: form.control,
    name: 'confirmationName',
  });
  const isConfirmed = (confirmationValue ?? '').trim() === workspace.name;
  const isDeleting = deleteWorkspaceMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  };

  const onSubmit = async () => {
    try {
      handleOpenChange(false);
      router.replace('/workspaces');

      await deleteWorkspaceMutation.mutateAsync(workspace.id);

      toast({
        title: 'Workspace deleted',
        description: `"${workspace.name}" and all its associated projects were permanently removed.`,
        variant: 'success',
      });
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast({
        title: 'Failed to delete workspace',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <AlertDialogTrigger render={<Button variant="destructive" />}>
          <Trash2 className="size-4" />
          <span>Delete Workspace</span>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle>Delete Workspace Permanently</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{' '}
            <span className="font-semibold text-foreground">{workspace.name}</span> workspace, all
            of its projects, tasks, and member associations.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Emphasized Confirmation Box */}
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3.5 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            To prevent accidental deletion, please type the exact workspace name below:
          </p>
          <div className="rounded-md border border-border bg-background px-3 py-2 shadow-2xs">
            <span className="font-mono text-sm font-bold text-foreground select-none break-all">
              {workspace.name}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="confirmationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm Workspace Name:</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={workspace.name}
                      autoComplete="off"
                      disabled={isDeleting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button type="submit" variant="destructive" disabled={!isConfirmed || isDeleting}>
                {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Delete Workspace
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

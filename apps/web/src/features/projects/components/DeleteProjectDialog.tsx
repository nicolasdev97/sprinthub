'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

import { useDeleteProject } from '../hook';
import { createDeleteProjectConfirmSchema, DeleteProjectConfirmFormValues } from '../schema';
import { Project } from '../types';

interface DeleteProjectDialogProps {
  project: Project;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  onDeleted?: () => void;
}

export function DeleteProjectDialog({
  project,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
  onDeleted,
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const deleteProjectMutation = useDeleteProject(project.workspaceId);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const form = useForm<DeleteProjectConfirmFormValues>({
    resolver: zodResolver(createDeleteProjectConfirmSchema(project.name)),
    defaultValues: {
      confirmationName: '',
    },
  });

  const confirmationValue = useWatch({
    control: form.control,
    name: 'confirmationName',
  });
  const isConfirmed = (confirmationValue ?? '').trim() === project.name;
  const isDeleting = deleteProjectMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  };

  const onSubmit = async () => {
    try {
      const wasOnProjectPage = pathname.includes(`/projects/${project.id}`);
      handleOpenChange(false);

      if (wasOnProjectPage) {
        router.replace(`/workspaces/${project.workspaceId}/projects`);
      }

      await deleteProjectMutation.mutateAsync(project.id);

      toast({
        title: 'Project deleted',
        description: `"${project.name}" and all its tasks have been permanently removed.`,
        variant: 'success',
      });

      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast({
        title: 'Failed to delete project',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <AlertDialogTrigger render={<Button variant="destructive" />}>
          <Trash2 className="size-4" />
          <span>Delete Project</span>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle>Delete Project Permanently</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action cannot be undone. All tasks, settings, and board data associated with this
            project will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Emphasized Confirmation Box */}
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3.5 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            To prevent accidental deletion, please type the exact project name below:
          </p>
          <div className="rounded-md border border-border bg-background px-3 py-2 shadow-2xs">
            <span className="font-mono text-sm font-bold text-foreground select-none break-all">
              {project.name}
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
                  <FormLabel className="text-sm font-medium">Confirm Project Name:</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={project.name}
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
                Delete Project
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

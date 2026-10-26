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
import {
  createDeleteProjectConfirmSchema,
  DeleteProjectConfirmFormValues,
} from '../schema';
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
      await deleteProjectMutation.mutateAsync(project.id);

      toast({
        title: 'Project deleted',
        description: `"${project.name}" and all its tasks have been permanently removed.`,
        variant: 'success',
      });
      handleOpenChange(false);
      if (onDeleted) {
        onDeleted();
      } else if (pathname.includes(`/projects/${project.id}`)) {
        router.push(`/workspaces/${project.workspaceId}/projects`);
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
            This action cannot be undone. This will permanently delete the{' '}
            <span className="font-semibold text-foreground">{project.name}</span>{' '}
            project and all tasks associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="confirmationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Please type{' '}
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                      {project.name}
                    </span>{' '}
                    to confirm
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={project.name}
                      autoComplete="off"
                      disabled={isDeleting}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={!isConfirmed || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Project</span>
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}


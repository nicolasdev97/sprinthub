'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

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
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useDeleteProject } from '../hook';
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
  const { toast } = useToast();
  const deleteProjectMutation = useDeleteProject(project.workspaceId);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);

      toast({
        title: 'Project deleted',
        description: `"${project.name}" and all its tasks have been permanently removed.`,
        variant: 'success',
      });
      setIsOpen(false);
      onDeleted?.();
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{project.name}</span>? This
            action cannot be undone and will permanently delete all tasks associated with
            this project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProjectMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteProjectMutation.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteProjectMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Project</span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


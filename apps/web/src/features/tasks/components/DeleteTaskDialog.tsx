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

import { useDeleteTask } from '../hook';
import { Task } from '../types';

interface DeleteTaskDialogProps {
  task: Task;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  onDeleted?: () => void;
}

export function DeleteTaskDialog({
  task,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
  onDeleted,
}: DeleteTaskDialogProps) {
  const { toast } = useToast();
  const deleteTaskMutation = useDeleteTask(task.projectId);
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);

      toast({
        title: 'Task deleted',
        description: `"${task.title}" has been permanently removed.`,
        variant: 'success',
      });
      setIsOpen(false);
      onDeleted?.();
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast({
        title: 'Failed to delete task',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {showTrigger && (
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
          <Trash2 className="size-3.5" />
          <span>Delete Task</span>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle>Delete Task Permanently</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{task.title}</span>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTaskMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteTaskMutation.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteTaskMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Task</span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
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
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/shared/errors';

import { useDeleteUser } from '../hook';
import {
  createDeleteUserConfirmSchema,
  DeleteUserConfirmFormValues,
} from '../schema';
import { User } from '../types';

interface DeleteAccountDialogProps {
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
  hasOwnedWorkspaces?: boolean;
}

export function DeleteAccountDialog({
  user,
  hasOwnedWorkspaces = false,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const deleteUserMutation = useDeleteUser();
  const [open, setOpen] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const form = useForm<DeleteUserConfirmFormValues>({
    resolver: zodResolver(createDeleteUserConfirmSchema(fullName)),
    defaultValues: {
      confirmationName: '',
    },
  });

  const confirmationValue = useWatch({
    control: form.control,
    name: 'confirmationName',
  });
  const isConfirmed = (confirmationValue ?? '').trim() === fullName;
  const isDeleting = deleteUserMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
    }
  };

  const onSubmit = async () => {
    if (hasOwnedWorkspaces) {
      toast({
        title: 'Cannot delete account',
        description:
          'You are currently the owner of one or more workspaces. Please transfer ownership or delete those workspaces first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteUserMutation.mutateAsync({
        confirmationName: fullName,
      });

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently removed. We are sorry to see you go.',
        variant: 'success',
      });

      handleOpenChange(false);
      queryClient.clear();
      await logout();
      router.push('/login');
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast({
        title: 'Failed to delete account',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            className="gap-2"
          />
        }
      >
        <Trash2 className="size-4" />
        <span>Delete Account</span>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle>Delete Account Permanently</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 text-left">
            <span>
              This action is permanent and cannot be undone. All your personal data, workspace
              memberships, and active sessions will be permanently erased.
            </span>
            {hasOwnedWorkspaces && (
              <span className="block font-medium text-amber-500">
                Warning: You currently own workspaces. You must transfer ownership or delete
                your workspaces before your account can be deleted.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="confirmationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    To confirm, please type your full name:{' '}
                    <span className="font-semibold text-foreground select-all">
                      {fullName}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={fullName}
                      autoComplete="off"
                      disabled={isDeleting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={!isConfirmed || isDeleting || hasOwnedWorkspaces}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    <span>Delete My Account</span>
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}


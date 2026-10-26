'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
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
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useAddWorkspaceMember } from '../hook';
import { AddWorkspaceMemberFormValues, addWorkspaceMemberSchema } from '../schema';

interface InviteMemberDialogProps {
  workspaceId: string;
  workspaceName: string;
  trigger?: React.ReactElement;
}

export function InviteMemberDialog({
  workspaceId,
  workspaceName,
  trigger,
}: InviteMemberDialogProps) {
  const { toast } = useToast();
  const addMemberMutation = useAddWorkspaceMember();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AddWorkspaceMemberFormValues>({
    resolver: zodResolver(addWorkspaceMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const isSubmitting = addMemberMutation.isPending || form.formState.isSubmitting;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      form.reset({ email: '', role: 'MEMBER' });
    }
  };

  const onSubmit = async (values: AddWorkspaceMemberFormValues) => {
    setServerError(null);

    try {
      await addMemberMutation.mutateAsync({
        workspaceId,
        data: {
          email: values.email,
          role: values.role,
        },
      });

      toast({
        title: 'Member added',
        description: `${values.email} has been added to "${workspaceName}" as ${values.role}.`,
        variant: 'success',
      });
      handleOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(error);

      if (apiError.errors) {
        const validFields: Array<keyof AddWorkspaceMemberFormValues> = ['email', 'role'];
        for (const field of validFields) {
          const messages = apiError.errors[field];
          if (messages && messages.length > 0) {
            form.setError(field, { type: 'server', message: messages[0] });
          }
        }
      }

      setServerError(apiError.message);
      toast({
        title: 'Failed to add member',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <UserPlus className="size-4" />
              <span>Invite Member</span>
            </Button>
          )
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member to {workspaceName}</DialogTitle>
          <DialogDescription>
            Add an existing SprintHub user by their registered email address and assign their workspace role.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Unable to invite member</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The user must already have a registered SprintHub account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Role</FormLabel>
                  <FormControl>
                    <Select disabled={isSubmitting} {...field}>
                      <SelectOption value="MEMBER">
                        Member — Can view and collaborate on projects &amp; tasks
                      </SelectOption>
                      <SelectOption value="ADMIN">
                        Admin — Can manage projects, tasks, and invite members
                      </SelectOption>
                    </Select>
                  </FormControl>
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
                    <span>Adding member...</span>
                  </>
                ) : (
                  <span>Add Member</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


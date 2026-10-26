'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, Plus, Users, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
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
  Label,
  Select,
  SelectOption,
  Textarea,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/shared/errors';
import { crossTabSync } from '@/shared/utils';

import { useWorkspaceContext } from '../context';
import { useCreateWorkspace } from '../hook';
import { CreateWorkspaceFormValues, createWorkspaceSchema } from '../schema';
import { workspaceService } from '../service';

interface CreateWorkspaceDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
}

interface PendingMember {
  email: string;
  role: 'MEMBER' | 'ADMIN';
}

export function CreateWorkspaceDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showTrigger = true,
  triggerLabel = 'New Workspace',
}: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [memberRoleInput, setMemberRoleInput] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [memberInputError, setMemberInputError] = useState<string | null>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  const { user } = useAuth();
  const queryClient = useQueryClient();
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
      setPendingMembers([]);
      setMemberEmailInput('');
      setMemberRoleInput('MEMBER');
      setMemberInputError(null);
    }
  };

  const handleAddMember = () => {
    const email = memberEmailInput.trim().toLowerCase();

    if (!email) {
      setMemberInputError('Please enter an email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMemberInputError('Please enter a valid email address.');
      return;
    }

    if (user?.email && email === user.email.toLowerCase()) {
      setMemberInputError('You will already be the owner of this workspace.');
      return;
    }

    if (pendingMembers.some((m) => m.email === email)) {
      setMemberInputError('This user is already in the list.');
      return;
    }

    setPendingMembers((prev) => [...prev, { email, role: memberRoleInput }]);
    setMemberEmailInput('');
    setMemberInputError(null);
  };

  const handleRemoveMember = (indexToRemove: number) => {
    setPendingMembers((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (values: CreateWorkspaceFormValues) => {
    setServerError(null);

    try {
      const created = await createWorkspaceMutation.mutateAsync({
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
      });

      // If pending members were added, invite them sequentially or in parallel
      if (pendingMembers.length > 0) {
        const results = await Promise.allSettled(
          pendingMembers.map((member) =>
            workspaceService.addMember(created.id, {
              email: member.email,
              role: member.role,
            })
          )
        );

        queryClient.invalidateQueries({
          queryKey: ['workspaces', created.id, 'members'],
        });

        crossTabSync.postMessage({
          type: 'QUERY_INVALIDATE',
          queryKeys: [
            ['workspaces'],
            ['workspaces', created.id],
            ['workspaces', created.id, 'members'],
          ],
        });

        const failedInvitations = results.filter((r) => r.status === 'rejected');
        if (failedInvitations.length > 0) {
          toast({
            title: 'Workspace created with warnings',
            description: `"${created.name}" created, but ${failedInvitations.length} member invitation(s) could not be completed (e.g. user not registered).`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Workspace created',
            description: `"${created.name}" is now active with ${pendingMembers.length + 1} members.`,
            variant: 'success',
          });
        }
      } else {
        toast({
          title: 'Workspace created',
          description: `"${created.name}" is now your active workspace.`,
          variant: 'success',
        });
      }

      setActiveWorkspaceId(created.id);
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
                      autoFocus
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

            {/* Team Members Section */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="size-4 text-primary" />
                  <span>Add Team Members (Optional)</span>
                </Label>
                {pendingMembers.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {pendingMembers.length} {pendingMembers.length === 1 ? 'member' : 'members'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Invite teammates by email to collaborate in this workspace immediately upon creation.
              </p>

              {/* Member input row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={memberEmailInput}
                  onChange={(e) => {
                    setMemberEmailInput(e.target.value);
                    if (memberInputError) setMemberInputError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                />

                <Select
                  value={memberRoleInput}
                  onValueChange={(val) => setMemberRoleInput(val as 'MEMBER' | 'ADMIN')}
                  disabled={isSubmitting}
                  className="w-full sm:w-32"
                >
                  <SelectOption value="MEMBER">Member</SelectOption>
                  <SelectOption value="ADMIN">Admin</SelectOption>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMember}
                  disabled={isSubmitting || !memberEmailInput.trim()}
                  className="shrink-0"
                >
                  <Plus className="size-4" />
                  <span>Add</span>
                </Button>
              </div>

              {memberInputError && (
                <p className="text-xs text-destructive">{memberInputError}</p>
              )}

              {/* Added members list */}
              {pendingMembers.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-lg border border-border bg-muted/20 p-2">
                  {pendingMembers.map((member, index) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between rounded-md bg-card px-3 py-1.5 text-xs border border-border/60 shadow-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="truncate font-medium text-foreground">{member.email}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                          {member.role}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        disabled={isSubmitting}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label={`Remove ${member.email}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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


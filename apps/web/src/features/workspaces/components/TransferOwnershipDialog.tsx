'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRightLeft, Loader2, ShieldAlert } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectOption,
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useTransferWorkspaceOwnership } from '../hook';
import { Workspace, WorkspaceMember } from '../types';

interface TransferOwnershipDialogProps {
  workspace: Workspace;
  members: WorkspaceMember[];
  currentUserId: string;
}

export function TransferOwnershipDialog({
  workspace,
  members,
  currentUserId,
}: TransferOwnershipDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const transferMutation = useTransferWorkspaceOwnership();

  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Filter out the current owner
  const eligibleMembers = members.filter((m) => m.userId !== currentUserId);

  const selectedMember = eligibleMembers.find((m) => m.userId === selectedMemberId);
  const selectedMemberName = selectedMember?.user
    ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}`
    : (selectedMember?.user?.email ?? 'the selected member');

  const handleTransfer = async () => {
    if (!selectedMemberId) return;
    setServerError(null);

    try {
      await transferMutation.mutateAsync({
        workspaceId: workspace.id,
        newOwnerId: selectedMemberId,
      });

      toast({
        title: 'Ownership transferred',
        description: `Workspace "${workspace.name}" has been transferred to ${selectedMemberName}. You are now an Admin.`,
        variant: 'success',
      });

      setOpen(false);
      router.refresh();
    } catch (err) {
      const apiError = normalizeApiError(err);
      setServerError(apiError.message);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <ArrowRightLeft className="size-4 text-primary" />
          <CardTitle>Transfer Workspace Ownership</CardTitle>
        </div>
        <CardDescription>
          Transfer this workspace to another member. They will become the primary Owner, and your
          role will become Admin.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Transfer failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {eligibleMembers.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            There are no other members in this workspace to transfer ownership to. Invite a team
            member first.
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
                className="w-full text-xs"
              >
                <SelectOption value="">Select a new owner...</SelectOption>
                {eligibleMembers.map((member) => (
                  <SelectOption key={member.userId} value={member.userId}>
                    {member.user
                      ? `${member.user.firstName} ${member.user.lastName} (${member.user.email})`
                      : member.userId}
                  </SelectOption>
                ))}
              </Select>
            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedMemberId || transferMutation.isPending}
                    className="gap-1.5"
                  >
                    <ArrowRightLeft className="size-3.5" />
                    <span>Transfer Ownership</span>
                  </Button>
                }
              />

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="size-5" />
                    <span>Confirm Ownership Transfer</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2 pt-2 text-foreground">
                    <span className="block">
                      Are you sure you want to transfer ownership of{' '}
                      <span className="font-semibold text-foreground">
                        &quot;{workspace.name}&quot;
                      </span>{' '}
                      to <span className="font-semibold text-foreground">{selectedMemberName}</span>
                      ?
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      This action will grant {selectedMemberName} full ownership rights (including
                      workspace deletion and billing). You will retain Admin access to manage
                      projects and members.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={transferMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      void handleTransfer();
                    }}
                    disabled={transferMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {transferMutation.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-1.5" />
                        <span>Transferring...</span>
                      </>
                    ) : (
                      'Yes, Transfer Ownership'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

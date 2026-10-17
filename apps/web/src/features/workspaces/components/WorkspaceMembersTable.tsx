'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserMinus,
  Users,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectOption,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/shared/errors';

import {
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMemberRole,
  useWorkspaceMembers,
} from '../hook';
import { AssignableWorkspaceRole, WorkspaceMember, WorkspaceRole } from '../types';
import { InviteMemberDialog } from './InviteMemberDialog';

interface WorkspaceMembersTableProps {
  workspaceId: string;
  workspaceName: string;
  ownerId: string;
}

export function WorkspaceMembersTable({
  workspaceId,
  workspaceName,
  ownerId,
}: WorkspaceMembersTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: members,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspaceMembers(workspaceId);

  const updateRoleMutation = useUpdateWorkspaceMemberRole();
  const removeMemberMutation = useRemoveWorkspaceMember();

  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);

  const currentMember = members?.find((m) => m.userId === user?.id);
  const currentUserRole: WorkspaceRole =
    currentMember?.role ?? (ownerId === user?.id ? 'OWNER' : 'MEMBER');

  const canInviteMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';
  const canChangeRoles = currentUserRole === 'OWNER';

  const canRemoveTargetMember = (target: WorkspaceMember): boolean => {
    if (target.role === 'OWNER') {
      return false;
    }
    if (currentUserRole === 'OWNER') {
      return true;
    }
    if (currentUserRole === 'ADMIN' && target.role === 'MEMBER') {
      return true;
    }
    return false;
  };

  const handleRoleChange = async (
    member: WorkspaceMember,
    newRole: AssignableWorkspaceRole
  ) => {
    if (member.role === newRole) return;
    setUpdatingMemberId(member.id);

    try {
      await updateRoleMutation.mutateAsync({
        workspaceId,
        memberId: member.id,
        data: { role: newRole },
      });

      const displayName = member.user
        ? `${member.user.firstName} ${member.user.lastName}`
        : 'Member';

      toast({
        title: 'Role updated',
        description: `${displayName} is now ${newRole}.`,
        variant: 'success',
      });
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast({
        title: 'Failed to update role',
        description: apiError.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMemberMutation.mutateAsync({
        workspaceId,
        memberId: memberToRemove.id,
      });

      const displayName = memberToRemove.user
        ? `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`
        : 'Member';

      toast({
        title: 'Member removed',
        description: `${displayName} has been removed from "${workspaceName}".`,
        variant: 'success',
      });
      setMemberToRemove(null);
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast({
        title: 'Failed to remove member',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Workspace Members</span>
              {members && (
                <Badge variant="secondary" className="ml-1">
                  {members.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Manage who has access to this workspace and their role permissions.
            </CardDescription>
          </div>

          {canInviteMembers && (
            <InviteMemberDialog
              workspaceId={workspaceId}
              workspaceName={workspaceName}
            />
          )}
        </CardHeader>

        <CardContent>
          {/* 1. Loading State */}
          {isLoading && (
            <div className="space-y-3" aria-busy="true" aria-label="Loading workspace members">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {isError && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Failed to load workspace members</AlertTitle>
              <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{normalizeApiError(error).message}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  <RefreshCw className="size-3.5" />
                  <span>Retry</span>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* 3. Empty State */}
          {!isLoading && !isError && (!members || members.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="size-5" />
              </div>
              <div className="max-w-sm space-y-1">
                <p className="text-sm font-semibold text-foreground">No members found</p>
                <p className="text-xs text-muted-foreground">
                  Invite team members to collaborate on projects and tasks inside this workspace.
                </p>
              </div>
              {canInviteMembers && (
                <InviteMemberDialog
                  workspaceId={workspaceId}
                  workspaceName={workspaceName}
                />
              )}
            </div>
          )}

          {/* 4. Success State (Table) */}
          {!isLoading && !isError && members && members.length > 0 && (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const fullName = member.user
                      ? `${member.user.firstName} ${member.user.lastName}`.trim()
                      : 'Workspace Member';
                    const email = member.user?.email ?? member.userId;
                    const initials = member.user
                      ? `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`.toUpperCase()
                      : 'WM';
                    const isSelf = member.userId === user?.id;
                    const joinedDate = new Date(member.joinedAt).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    );
                    const isUpdatingThisRow = updatingMemberId === member.id;
                    const canRemove = canRemoveTargetMember(member);

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 border border-border">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate font-medium text-foreground">
                                  {fullName}
                                </span>
                                {isSelf && (
                                  <Badge variant="outline" className="text-[10px]">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {joinedDate}
                        </TableCell>

                        <TableCell>
                          {member.role === 'OWNER' ? (
                            <Badge variant="default" className="gap-1">
                              <ShieldCheck className="size-3" />
                              OWNER
                            </Badge>
                          ) : canChangeRoles ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={member.role}
                                disabled={isUpdatingThisRow}
                                onValueChange={(val) => {
                                  void handleRoleChange(
                                    member,
                                    val as AssignableWorkspaceRole
                                  );
                                }}
                                className="h-8 w-32 text-xs"
                                aria-label={`Change role for ${fullName}`}
                              >
                                <SelectOption value="ADMIN">ADMIN</SelectOption>
                                <SelectOption value="MEMBER">MEMBER</SelectOption>
                              </Select>
                              {isUpdatingThisRow && (
                                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          ) : (
                            <Badge
                              variant={member.role === 'ADMIN' ? 'secondary' : 'outline'}
                            >
                              {member.role}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {canRemove ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMemberToRemove(member)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remove ${fullName} from workspace`}
                            >
                              <UserMinus className="size-3.5" />
                              <span className="hidden sm:inline">Remove</span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Workspace Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold text-foreground">
                {memberToRemove?.user
                  ? `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`
                  : memberToRemove?.userId}
              </span>{' '}
              from <span className="font-semibold text-foreground">{workspaceName}</span>? Any
              tasks currently assigned to them in this workspace will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMemberMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={removeMemberMutation.isPending}
              onClick={() => void handleConfirmRemoveMember()}
            >
              {removeMemberMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <span>Remove Member</span>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


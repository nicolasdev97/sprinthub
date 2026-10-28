'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import {
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  FolderKanban,
  ListTodo,
  Loader2,
  Lock,
  LogOut,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ScrollArea,
  Separator,
  Skeleton,
  useToast,
} from '@/components/ui';
import { AuthUser, useAuth } from '@/features/auth';
import { projectService } from '@/features/projects';
import { taskService } from '@/features/tasks';
import { DeleteAccountDialog, useCurrentUser, useUpdateUser } from '@/features/users';
import { useWorkspaceContext, WorkspaceRole, workspaceService } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { cn, deletedEntities } from '@/shared/utils';

interface PersonalDetailsFormProps {
  user: AuthUser;
}

function PersonalDetailsForm({ user }: PersonalDetailsFormProps) {
  const { toast } = useToast();
  const { accessToken, setAuth } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);

  const updateUserMutation = useUpdateUser();
  const isUpdating = updateUserMutation.isPending;

  const hasChanges = firstName.trim() !== user.firstName || lastName.trim() !== user.lastName;
  const canSave = hasChanges && firstName.trim() !== '' && lastName.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || isUpdating) return;

    try {
      const updated = await updateUserMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (accessToken) {
        setAuth(accessToken, updated);
      }

      toast({
        title: 'Profile updated',
        description: 'Your personal information has been saved successfully.',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Failed to update profile',
        description: normalizeApiError(err).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="size-4 text-primary" />
          <span>Personal Details</span>
        </CardTitle>
        <CardDescription>Update your display name across all workspaces.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                disabled={isUpdating}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                disabled={isUpdating}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="cursor-not-allowed bg-muted/50 opacity-80"
            />
            <p className="text-[11px] text-muted-foreground">
              Your registered email address cannot be changed directly.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={!canSave || isUpdating} className="gap-1.5">
              {isUpdating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, logout } = useAuth();
  const { data: serverUser } = useCurrentUser();
  const user = serverUser || authUser;
  const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspaceContext();

  const [copiedId, setCopiedId] = useState(false);

  // 0. Query members for all workspaces in parallel to resolve accurate user roles (OWNER, ADMIN, MEMBER)
  const memberQueries = useQueries({
    queries: workspaces.map((ws) => ({
      queryKey: ['workspaces', ws.id, 'members'],
      queryFn: () => workspaceService.getMembers(ws.id),
      enabled: Boolean(ws.id) && !deletedEntities.isDeleted(ws.id),
      retry: false,
    })),
  });

  // 1. Query projects for all workspaces in parallel
  const projectQueries = useQueries({
    queries: workspaces.map((ws) => ({
      queryKey: ['projects', ws.id],
      queryFn: () => projectService.getProjects(ws.id),
      enabled: Boolean(ws.id) && !deletedEntities.isDeleted(ws.id),
      retry: false,
    })),
  });

  const isProjectsLoading = projectQueries.some((q) => q.isLoading);

  const allProjects = useMemo(() => {
    return workspaces.flatMap((ws, index) => {
      const projects = projectQueries[index]?.data ?? [];
      return projects.map((p) => ({
        ...p,
        workspaceName: ws.name,
      }));
    });
  }, [workspaces, projectQueries]);

  // 2. Query tasks across all projects in parallel
  const taskQueries = useQueries({
    queries: allProjects.map((project) => ({
      queryKey: ['tasks', project.id],
      queryFn: () => taskService.getTasks(project.id),
      enabled:
        Boolean(project.id) &&
        !deletedEntities.isDeleted(project.id) &&
        !deletedEntities.isDeleted(project.workspaceId),
      retry: false,
    })),
  });

  const isTasksLoading = taskQueries.some((q) => q.isLoading);

  const allTasks = useMemo(() => {
    return allProjects.flatMap((project, index) => {
      const tasks = taskQueries[index]?.data ?? [];
      return tasks;
    });
  }, [allProjects, taskQueries]);

  const userId = user?.id;
  const myActiveTasksCount = userId
    ? allTasks.filter((t) => t.assigneeId === userId && t.status !== 'DONE').length
    : 0;

  const myCompletedTasksCount = userId
    ? allTasks.filter((t) => t.assigneeId === userId && t.status === 'DONE').length
    : 0;

  const activeProjectsCount = allProjects.filter((p) => !p.archived).length;
  const isStatsLoading = isProjectsLoading || isTasksLoading;

  const hasOwnedWorkspaces = workspaces.some((ws, index) => {
    const members = memberQueries[index]?.data;
    const currentMember = members?.find((m) => m.userId === user?.id);
    const role: WorkspaceRole =
      currentMember?.role ?? (ws.ownerId === user?.id ? 'OWNER' : 'MEMBER');
    return role === 'OWNER';
  });

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently joined';

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      toast({
        title: 'Copied to clipboard',
        description: 'Account ID has been copied to your clipboard.',
        variant: 'success',
      });
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy account ID to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal identity, workload overview, and account settings.
        </p>
      </div>

      {/* Top Grid: Identity & Stats on Left, Workspaces on Right */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity & Workload Summary Card */}
        <Card className="flex flex-col justify-between lg:col-span-2">
          <div>
            <CardHeader className="flex flex-row items-center gap-4 pb-6">
              <Avatar className="size-16 border border-border shadow-2xs">
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="truncate text-2xl font-bold">{fullName}</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground/80" />
                    <span>{user.email}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground/80" />
                    <span>Member since {memberSince}</span>
                  </span>
                </div>
              </div>
            </CardHeader>

            <Separator />
          </div>

          {/* Personal Activity & Workload Metrics */}
          <CardContent className="pt-6">
            <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Workload &amp; Activity Overview
            </p>
            <div className="grid gap-3.5 sm:grid-cols-3">
              {/* Active Tasks Assigned */}
              <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Assigned Tasks</span>
                  <ListTodo className="size-4 text-blue-500" />
                </div>
                {isStatsLoading ? (
                  <Skeleton className="my-0.5 h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {myActiveTasksCount}
                  </p>
                )}
                <span className="text-[11px] text-muted-foreground">In progress or pending</span>
              </div>

              {/* Completed Tasks */}
              <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Tasks Completed</span>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                {isStatsLoading ? (
                  <Skeleton className="my-0.5 h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {myCompletedTasksCount}
                  </p>
                )}
                <span className="text-[11px] text-muted-foreground">Delivered across projects</span>
              </div>

              {/* Active Projects */}
              <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Projects</span>
                  <FolderKanban className="size-4 text-primary" />
                </div>
                {isStatsLoading ? (
                  <Skeleton className="my-0.5 h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {activeProjectsCount}
                  </p>
                )}
                <span className="text-[11px] text-muted-foreground">In your workspaces</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspaces Summary Card with Roles */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="size-4 text-primary" />
              <span>Workspaces ({workspaces.length})</span>
            </CardTitle>
            <CardDescription>Environments you currently belong to</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-4">
            {workspaces.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                You are not a member of any workspace yet.
              </p>
            ) : (
              <ScrollArea className="max-h-[145px] pr-1.5">
                <div className="space-y-2">
                  {workspaces.map((ws, index) => {
                    const members = memberQueries[index]?.data;
                    const currentMember = members?.find((m) => m.userId === user.id);
                    const userRole: WorkspaceRole =
                      currentMember?.role ?? (ws.ownerId === user.id ? 'OWNER' : 'MEMBER');
                    const isOwner = userRole === 'OWNER';
                    const isAdmin = userRole === 'ADMIN';
                    const isWsActive = activeWorkspace?.id === ws.id;

                    return (
                      <div
                        key={ws.id}
                        onClick={() => {
                          setActiveWorkspaceId(ws.id);
                          toast({
                            title: 'Workspace activated',
                            description: `"${ws.name}" is now your active workspace.`,
                            variant: 'success',
                          });
                        }}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-xs transition-colors',
                          isWsActive
                            ? 'border-primary/50 bg-primary/[0.04]'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate font-medium text-foreground">{ws.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {isOwner
                              ? 'Workspace Creator'
                              : isAdmin
                                ? 'Workspace Admin'
                                : 'Team Member'}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <Badge
                            variant={isOwner || isAdmin ? 'outline' : 'secondary'}
                            className={cn(
                              'text-[10px] font-semibold',
                              isOwner &&
                                'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                              isAdmin &&
                                'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            )}
                          >
                            {userRole}
                          </Badge>
                          {isWsActive && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-[10px] text-primary"
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            <Button
              variant="outline"
              size="sm"
              className="mt-auto w-full"
              nativeButton={false}
              render={<Link href="/workspaces" />}
            >
              Manage All Workspaces
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Account Settings & Security */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit Personal Details Card */}
        <PersonalDetailsForm key={`${user.id}-${user.firstName}-${user.lastName}`} user={user} />

        {/* Security & Credentials Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>Security &amp; Account</span>
            </CardTitle>
            <CardDescription>Authentication status and technical identification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Password Protection Active
              </p>
              <p className="text-xs text-muted-foreground">
                Your session is authenticated with encrypted credentials.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Account ID (for support)
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded border border-border bg-muted/40 px-2 py-1 font-mono text-[11px] text-foreground">
                  {user.id}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyId}
                  className="shrink-0 gap-1.5 text-xs"
                >
                  {copiedId ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-4" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible actions that permanently affect your account and personal data.
              </CardDescription>
            </div>
            {hasOwnedWorkspaces && (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="size-3.5" />
                <span>Workspaces Owned</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col justify-between gap-4 border-t border-destructive/20 pt-4 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Delete your account</p>
            <p className="text-xs text-muted-foreground">
              Once deleted, your profile and personal data will be permanently removed.
              {hasOwnedWorkspaces && (
                <span className="block text-amber-500 pt-0.5 font-medium">
                  You must transfer ownership or delete your workspaces before deleting your
                  account.
                </span>
              )}
            </p>
          </div>

          <DeleteAccountDialog user={user} hasOwnedWorkspaces={hasOwnedWorkspaces} />
        </CardContent>
      </Card>
    </div>
  );
}

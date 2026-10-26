'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  FolderKanban,
  Lock,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/shared/errors';

import { useWorkspaceContext } from '../context';
import { useWorkspace, useWorkspaceMembers } from '../hook';
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog';
import { EditWorkspaceForm } from './EditWorkspaceForm';
import { TransferOwnershipDialog } from './TransferOwnershipDialog';
import { WorkspaceMembersTable } from './WorkspaceMembersTable';
import { WorkspaceStatusBadge } from './WorkspaceStatusBadge';

interface WorkspaceSettingsViewProps {
  workspaceId: string;
}

export function WorkspaceSettingsView({ workspaceId }: WorkspaceSettingsViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();

  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const source = searchParams.get('source');

  const { data: workspace, isLoading, isError, error, refetch } = useWorkspace(workspaceId);
  const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);

  const isFromHub = from === 'hub';
  const isFromDashboard = from === 'dashboard';

  const workspaceProjectsHref = `/workspaces/${workspaceId}/projects${
    source ? `?from=${source}` : ''
  }`;

  const currentMember = members?.find((m) => m.userId === user?.id);
  const isOwner = workspace?.ownerId === user?.id || currentMember?.role === 'OWNER';
  const isAdmin = currentMember?.role === 'ADMIN';
  const canManage = isOwner || isAdmin;

  // Enforce access control: if user is a regular MEMBER, redirect to projects view
  useEffect(() => {
    if (!isLoading && !isMembersLoading && workspace && members && !canManage) {
      router.replace(workspaceProjectsHref);
    }
  }, [isLoading, isMembersLoading, workspace, members, canManage, router, workspaceProjectsHref]);

  const backHref = isFromHub
    ? '/workspaces'
    : isFromDashboard
      ? '/dashboard'
      : workspaceProjectsHref;

  const backLabel = isFromHub
    ? 'Back to Workspaces Hub'
    : isFromDashboard
      ? 'Back to Dashboard'
      : workspace
        ? `Back to ${workspace.name}`
        : 'Back to Workspace';

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading workspace settings">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    const apiError = normalizeApiError(error);

    return (
      <div className="space-y-4">
        <Link href={backHref}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            <span>{backLabel}</span>
          </Button>
        </Link>

        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load workspace settings</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{apiError.message}</span>
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
      </div>
    );
  }

  // 3. Empty / Not Found Fallback
  if (!workspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workspace Not Found</CardTitle>
          <CardDescription>
            The requested workspace could not be found or you no longer have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={backHref}>
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              <span>{backLabel}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isActive = activeWorkspaceId === workspace.id;

  const handleSetActive = () => {
    setActiveWorkspaceId(workspace.id);
    toast({
      title: 'Workspace activated',
      description: `"${workspace.name}" is now your active workspace.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Workspace Context Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>{backLabel}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {workspace.name} — Settings
            </h1>
            <WorkspaceStatusBadge isActive={isActive} />
          </div>
          <p className="text-sm text-muted-foreground">
            Manage workspace details, member access, roles, and lifecycle settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isActive && (
            <Button variant="outline" size="sm" onClick={handleSetActive}>
              Set as Active Workspace
            </Button>
          )}

          <Link href={workspaceProjectsHref}>
            <Button variant="outline" size="sm">
              <FolderKanban className="size-4" />
              <span>Open Workspace Projects</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Section 1: General Workspace Information */}
      <EditWorkspaceForm workspace={workspace} canEdit={isOwner} />

      {/* Section 2: Members & Role-Based Access Control */}
      <WorkspaceMembersTable
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        ownerId={workspace.ownerId}
      />

      {/* Section 2.5: Transfer Ownership (Owner only) */}
      {isOwner && members && user && (
        <TransferOwnershipDialog
          workspace={workspace}
          members={members}
          currentUserId={user.id}
        />
      )}

      {/* Section 3: Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-4" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible actions that permanently affect this workspace and all its resources.
              </CardDescription>
            </div>
            {!isOwner && (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="size-3.5" />
                <span>Owner only</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col justify-between gap-4 border-t border-destructive/20 pt-4 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Delete this workspace</p>
            <p className="text-xs text-muted-foreground">
              Once deleted, all projects, tasks, and member records inside &ldquo;{workspace.name}
              &rdquo; will be permanently removed.
            </p>
          </div>

          {isOwner ? (
            <DeleteWorkspaceDialog workspace={workspace} />
          ) : (
            <Button variant="destructive" disabled>
              Delete Workspace
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

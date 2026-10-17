'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
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
import { useWorkspace } from '../hook';
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog';
import { EditWorkspaceForm } from './EditWorkspaceForm';
import { WorkspaceMembersTable } from './WorkspaceMembersTable';

interface WorkspaceSettingsViewProps {
  workspaceId: string;
}

export function WorkspaceSettingsView({ workspaceId }: WorkspaceSettingsViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();

  const {
    data: workspace,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspace(workspaceId);

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
        <Link href="/workspaces">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            <span>Back to Workspaces</span>
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
          <Link href="/workspaces">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              <span>Return to Workspaces</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isOwner = workspace.ownerId === user?.id;
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
            href="/workspaces"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Workspaces</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {workspace.name} — Settings
            </h1>
            {isActive && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                <CheckCircle2 className="size-3" />
                Active Workspace
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage workspace details, member access, roles, and lifecycle settings.
          </p>
        </div>

        {!isActive && (
          <Button variant="outline" size="sm" onClick={handleSetActive}>
            Set as Active Workspace
          </Button>
        )}
      </div>

      {/* Section 1: General Workspace Information */}
      <EditWorkspaceForm workspace={workspace} canEdit={isOwner} />

      {/* Section 2: Members & Role-Based Access Control */}
      <WorkspaceMembersTable
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        ownerId={workspace.ownerId}
      />

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
            <p className="text-sm font-semibold text-foreground">
              Delete this workspace
            </p>
            <p className="text-xs text-muted-foreground">
              Once deleted, all projects, tasks, and member records inside &ldquo;{workspace.name}&rdquo; will be permanently removed.
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


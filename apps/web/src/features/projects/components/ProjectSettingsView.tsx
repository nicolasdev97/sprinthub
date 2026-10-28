'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  FolderKanban,
  Loader2,
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
  NotFoundState,
  Skeleton,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useWorkspace, useWorkspaceMembers } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { deletedEntities } from '@/shared/utils';

import { useArchiveProject, useProject } from '../hook';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { EditProjectForm } from './EditProjectForm';
import { ProjectStatusBadge } from './ProjectStatusBadge';

interface ProjectSettingsViewProps {
  workspaceId: string;
  projectId: string;
}

export function ProjectSettingsView({ workspaceId, projectId }: ProjectSettingsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const { user } = useAuth();
  const { toast } = useToast();

  const { data: project, isLoading, isError, error, refetch } = useProject(projectId);

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useWorkspace(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);
  const archiveMutation = useArchiveProject(workspaceId);

  const isFromHub = from === 'hub';
  const isFromWorkspace = from === 'workspace';
  const isFromDashboard = from === 'dashboard';
  const source = searchParams.get('source');

  const projectTasksHref = `/workspaces/${workspaceId}/projects/${projectId}/tasks${
    source ? `?from=${source}` : ''
  }`;

  const backHref = isFromHub
    ? '/projects'
    : isFromWorkspace
      ? `/workspaces/${workspaceId}/projects`
      : isFromDashboard
        ? '/dashboard'
        : projectTasksHref;

  const backLabel = isFromHub
    ? 'Back to Projects Hub'
    : isFromWorkspace
      ? workspace
        ? `Back to ${workspace.name}`
        : 'Back to Workspace'
      : isFromDashboard
        ? 'Back to Dashboard'
        : project
          ? `Back to ${project.name}`
          : 'Back to Project';

  const currentMember = members?.find((m) => m.userId === user?.id);
  const canManage =
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN' ||
    workspace?.ownerId === user?.id;

  // Enforce access control: if user is a regular MEMBER, redirect back to tasks
  useEffect(() => {
    if (
      !isLoading &&
      project &&
      workspace &&
      members &&
      currentMember?.role === 'MEMBER' &&
      !canManage &&
      !deletedEntities.isDeleted(workspaceId) &&
      !deletedEntities.isDeleted(projectId)
    ) {
      router.replace(projectTasksHref);
    }
  }, [
    isLoading,
    project,
    projectId,
    workspace,
    workspaceId,
    members,
    currentMember,
    canManage,
    router,
    projectTasksHref,
  ]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading project settings">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    const apiError = normalizeApiError(error);

    if (
      apiError.statusCode === 404 ||
      apiError.statusCode === 403 ||
      apiError.message.toLowerCase().includes('not found') ||
      apiError.message.toLowerCase().includes('forbidden') ||
      apiError.message.toLowerCase().includes('not a member')
    ) {
      return (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Details</h1>
            <p className="text-sm text-muted-foreground">
              This project has been deleted or cannot be found.
            </p>
          </div>

          <NotFoundState
            title="Project not found or deleted"
            description="This project may have been removed or you no longer have access to it."
            actionText="Go to Workspace Projects"
            actionIcon={<ArrowLeft className="mr-2 size-4" />}
            actionHref={`/workspaces/${workspaceId}/projects`}
          />
        </div>
      );
    }

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
          <AlertTitle>Unable to load project settings</AlertTitle>
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
  if (!project) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Details</h1>
          <p className="text-sm text-muted-foreground">
            This project has been deleted or cannot be found.
          </p>
        </div>

        <NotFoundState
          title="Project not found or deleted"
          description="The requested project could not be found or you do not have access to it."
          actionText="Go to Workspace Projects"
          actionIcon={<ArrowLeft className="mr-2 size-4" />}
          actionHref={`/workspaces/${workspaceId}/projects`}
        />
      </div>
    );
  }

  if (isWorkspaceError || (!isWorkspaceLoading && !workspace)) {
    const apiError = workspaceError ? normalizeApiError(workspaceError) : null;
    const isNotFound =
      !apiError ||
      apiError.statusCode === 404 ||
      apiError.statusCode === 403 ||
      apiError.message.toLowerCase().includes('not found') ||
      apiError.message.toLowerCase().includes('forbidden') ||
      apiError.message.toLowerCase().includes('not a member');

    if (isNotFound) {
      return (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Details</h1>
            <p className="text-sm text-muted-foreground">
              This workspace has been deleted or cannot be found.
            </p>
          </div>

          <NotFoundState
            title="Workspace not found or deleted"
            description="This workspace may have been removed or you no longer have access to it."
            actionText="Go to Workspaces"
            actionIcon={<ArrowLeft className="mr-2 size-4" />}
            actionHref="/workspaces"
          />
        </div>
      );
    }
  }

  const handleToggleArchive = async () => {
    const nextArchived = !project.archived;

    try {
      await archiveMutation.mutateAsync({
        projectId: project.id,
        data: { archived: nextArchived },
      });

      toast({
        title: nextArchived ? 'Project archived' : 'Project unarchived',
        description: `"${project.name}" is now ${nextArchived ? 'archived' : 'active'}.`,
        variant: 'success',
      });
    } catch (err) {
      const apiError = normalizeApiError(err);
      toast({
        title: 'Failed to update archive status',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              {project.name} — Settings
            </h1>
            <ProjectStatusBadge status={project.status} />
            {project.archived && (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <Archive className="size-3" />
                <span>Archived</span>
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Configure project details, lifecycle state, and permanent deletion.
          </p>
        </div>

        <Link href={projectTasksHref}>
          <Button variant="outline" size="sm">
            <FolderKanban className="size-4" />
            <span>Open Project Tasks</span>
          </Button>
        </Link>
      </div>

      {/* Section 1: Edit Project Details */}
      <EditProjectForm project={project} canManage={Boolean(canManage)} />

      {/* Section 2: Archive / Unarchive Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>Project Lifecycle &amp; Archiving</CardTitle>
              <CardDescription>
                Archiving a project preserves its tasks and history while making it read-only.
              </CardDescription>
            </div>
            {!canManage && (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="size-3.5" />
                <span>Admin / Owner only</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col justify-between gap-4 border-t border-border/60 pt-4 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {project.archived ? 'Unarchive this project' : 'Archive this project'}
            </p>
            <p className="text-xs text-muted-foreground">
              {project.archived
                ? 'Restoring this project will allow team members to edit project details and manage tasks again.'
                : 'While archived, project details cannot be edited until the project is unarchived.'}
            </p>
          </div>

          <Button
            variant="outline"
            disabled={!canManage || archiveMutation.isPending}
            onClick={() => void handleToggleArchive()}
          >
            {archiveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : project.archived ? (
              <>
                <ArchiveRestore className="size-4" />
                <span>Unarchive Project</span>
              </>
            ) : (
              <>
                <Archive className="size-4" />
                <span>Archive Project</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

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
                Permanently remove this project and all of its associated tasks.
              </CardDescription>
            </div>
            {!canManage && (
              <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Lock className="size-3.5" />
                <span>Admin / Owner only</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col justify-between gap-4 border-t border-destructive/20 pt-4 sm:flex-row sm:items-center">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Delete this project</p>
            <p className="text-xs text-muted-foreground">
              Once deleted, &ldquo;{project.name}&rdquo; and all of its tasks cannot be recovered.
            </p>
          </div>

          {canManage ? (
            <DeleteProjectDialog
              project={project}
              onDeleted={() => router.push(`/workspaces/${workspaceId}/projects`)}
            />
          ) : (
            <Button variant="destructive" disabled>
              Delete Project
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

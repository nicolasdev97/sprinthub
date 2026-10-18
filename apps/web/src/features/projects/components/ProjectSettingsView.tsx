'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Skeleton,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useWorkspace, useWorkspaceMembers } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';

import { useArchiveProject, useProject } from '../hook';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { EditProjectForm } from './EditProjectForm';
import {
  deriveProjectKey,
  formatProjectStatusLabel,
  getProjectStatusBadgeVariant,
} from './ProjectCard';

interface ProjectSettingsViewProps {
  workspaceId: string;
  projectId: string;
}

export function ProjectSettingsView({
  workspaceId,
  projectId,
}: ProjectSettingsViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useProject(projectId);

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);
  const archiveMutation = useArchiveProject(workspaceId);

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

    return (
      <div className="space-y-4">
        <Link href={`/workspaces/${workspaceId}/projects`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            <span>Back to Projects</span>
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
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>
            The requested project could not be found or you do not have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/workspaces/${workspaceId}/projects`}>
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              <span>Return to Projects</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const currentMember = members?.find((m) => m.userId === user?.id);
  const canManage =
    currentMember?.role === 'OWNER' ||
    currentMember?.role === 'ADMIN' ||
    workspace?.ownerId === user?.id;

  const projectKey = deriveProjectKey(project);

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
            href={`/workspaces/${workspaceId}/projects`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Projects</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
              {projectKey}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {project.name} — Settings
            </h1>
            <Badge variant={getProjectStatusBadgeVariant(project.status)}>
              {formatProjectStatusLabel(project.status)}
            </Badge>
            {project.archived && (
              <Badge variant="outline" className="text-muted-foreground">
                Archived
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Configure project details, lifecycle state, and permanent deletion.
          </p>
        </div>

        <Link href={`/tasks?workspaceId=${workspaceId}&projectId=${project.id}`}>
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
            <p className="text-sm font-semibold text-foreground">
              Delete this project
            </p>
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


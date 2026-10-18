'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  ArchiveRestore,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  MoreVertical,
  Settings,
  Trash2,
} from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  useToast,
} from '@/components/ui';
import { useTasks } from '@/features/tasks';
import { normalizeApiError } from '@/shared/errors';
import { cn } from '@/shared/utils';

import { useArchiveProject } from '../hook';
import { Project, ProjectStatus } from '../types';
import { DeleteProjectDialog } from './DeleteProjectDialog';

interface ProjectCardProps {
  project: Project;
  canManage: boolean;
}

export function deriveProjectKey(project: Project): string {
  const letters = project.name
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase();
  const prefix = letters.length >= 2 ? letters : 'PRJ';
  const shortId = project.id.slice(0, 4).toUpperCase();
  return `${prefix}-${shortId}`;
}

export function getProjectStatusBadgeVariant(
  status: ProjectStatus
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'COMPLETED':
      return 'secondary';
    case 'PLANNING':
    default:
      return 'outline';
  }
}

export function formatProjectStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case 'PLANNING':
      return 'Planning';
    case 'ACTIVE':
      return 'Active';
    case 'COMPLETED':
      return 'Completed';
  }
}

export function ProjectCard({ project, canManage }: ProjectCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: tasks, isLoading: isTasksLoading } = useTasks(project.id);
  const archiveMutation = useArchiveProject(project.workspaceId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const activeTasksCount =
    tasks?.filter((task) => task.status !== 'DONE').length ?? 0;
  const completedTasksCount =
    tasks?.filter((task) => task.status === 'DONE').length ?? 0;
  const totalTasksCount = activeTasksCount + completedTasksCount;
  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const projectKey = deriveProjectKey(project);
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleToggleArchive = async () => {
    const nextArchived = !project.archived;

    try {
      await archiveMutation.mutateAsync({
        projectId: project.id,
        data: { archived: nextArchived },
      });

      toast({
        title: nextArchived ? 'Project archived' : 'Project unarchived',
        description: `"${project.name}" has been ${nextArchived ? 'archived' : 'restored to active projects'}.`,
        variant: 'success',
      });
    } catch (error) {
      const apiError = normalizeApiError(error);
      toast({
        title: 'Failed to update archive status',
        description: apiError.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card
        className={cn(
          'group flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-sm',
          project.archived && 'bg-muted/20 opacity-85'
        )}
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase',
                  project.archived
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary/10 text-primary'
                )}
              >
                <FolderKanban className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                    {projectKey}
                  </span>
                  {project.archived ? (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Archived
                    </Badge>
                  ) : (
                    <Badge
                      variant={getProjectStatusBadgeVariant(project.status)}
                      className="text-[10px]"
                    >
                      {formatProjectStatusLabel(project.status)}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-1 truncate text-base">
                  {project.name}
                </CardTitle>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${project.name}`}
                  />
                }
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/workspaces/${project.workspaceId}/projects/${project.id}/tasks`
                      )
                    }
                  >
                    <FolderKanban className="size-4 text-muted-foreground" />
                    <span>View Tasks</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/workspaces/${project.workspaceId}/projects/${project.id}/settings`
                      )
                    }
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    <span>Project Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {canManage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        disabled={archiveMutation.isPending}
                        onClick={() => void handleToggleArchive()}
                      >
                        {project.archived ? (
                          <>
                            <ArchiveRestore className="size-4 text-muted-foreground" />
                            <span>Unarchive Project</span>
                          </>
                        ) : (
                          <>
                            <Archive className="size-4 text-muted-foreground" />
                            <span>Archive Project</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <Trash2 className="size-4" />
                        <span>Delete Project</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardDescription className="line-clamp-2 min-h-10 text-xs leading-relaxed">
            {project.description || 'No description provided for this project.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Task Counters */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-amber-500" />
              <div>
                <p className="text-muted-foreground">Active Tasks</p>
                {isTasksLoading ? (
                  <Skeleton className="mt-0.5 h-4 w-8" />
                ) : (
                  <p className="font-semibold text-foreground">{activeTasksCount}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <div>
                <p className="text-muted-foreground">Completed</p>
                {isTasksLoading ? (
                  <Skeleton className="mt-0.5 h-4 w-8" />
                ) : (
                  <p className="font-semibold text-foreground">{completedTasksCount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar & Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Task Completion</span>
              <span className="font-medium text-foreground">{completionRate}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3 shrink-0" />
              <span>Created {formattedDate}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
          <Link
            href={`/workspaces/${project.workspaceId}/projects/${project.id}/tasks`}
            className="flex-1"
          >
            <Button variant="default" size="sm" className="w-full">
              Open Tasks
            </Button>
          </Link>

          <Link
            href={`/workspaces/${project.workspaceId}/projects/${project.id}/settings`}
          >
            <Button
              variant="outline"
              size="sm"
              aria-label={`Settings for ${project.name}`}
            >
              <Settings className="size-3.5" />
              <span>Settings</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {canManage && (
        <DeleteProjectDialog
          project={project}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          showTrigger={false}
        />
      )}
    </>
  );
}


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Archive,
  ArchiveRestore,
  Briefcase,
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
import { Project } from '../types';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { ProjectStatusBadge } from './ProjectStatusBadge';

interface ProjectCardProps {
  project: Project;
  canManage: boolean;
  workspaceName?: string;
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

export function ProjectCard({ project, canManage, workspaceName }: ProjectCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { data: tasks, isLoading: isTasksLoading } = useTasks(project.id);
  const archiveMutation = useArchiveProject(project.workspaceId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isFromProjectsHub = pathname.startsWith('/projects');
  const settingsFrom = isFromProjectsHub ? 'hub' : 'workspace';
  const tasksHref = isFromProjectsHub
    ? `/workspaces/${project.workspaceId}/projects/${project.id}/tasks?from=projects`
    : `/workspaces/${project.workspaceId}/projects/${project.id}/tasks`;

  const activeTasksCount =
    tasks?.filter((task) => task.status !== 'DONE').length ?? 0;
  const completedTasksCount =
    tasks?.filter((task) => task.status === 'DONE').length ?? 0;
  const totalTasksCount = activeTasksCount + completedTasksCount;
  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

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
          'group flex flex-col gap-4 transition-all hover:border-primary/40 hover:shadow-sm',
          project.archived && 'bg-muted/20 opacity-85'
        )}
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold uppercase',
                  project.archived
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {project.name.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <Link
                  href={tasksHref}
                  className="block truncate hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
                >
                  <CardTitle className="truncate text-base transition-colors hover:text-primary">
                    {project.name}
                  </CardTitle>
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {workspaceName && (
                    <Link
                      href={`/workspaces/${project.workspaceId}/projects${
                        isFromProjectsHub ? '?from=projects' : ''
                      }`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Badge
                        variant="outline"
                        className="text-[10px] gap-1 font-normal border-border/80 px-2 py-0.5 h-5 -ml-1 cursor-pointer hover:bg-muted/50"
                      >
                        <Briefcase className="size-2.5 text-muted-foreground" />
                        <span className="truncate max-w-28">{workspaceName}</span>
                      </Badge>
                    </Link>
                  )}
                  {project.archived ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] text-muted-foreground px-2 py-0.5 h-5 gap-1',
                        !workspaceName && '-ml-1'
                      )}
                    >
                      <Archive className="size-2.5" />
                      <span>Archived</span>
                    </Badge>
                  ) : (
                    <ProjectStatusBadge
                      status={project.status}
                      className={cn('text-[10px] px-2 py-0.5 h-5', !workspaceName && '-ml-1')}
                    />
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:ml-1">
                    <Calendar className="size-3 shrink-0" />
                    <span>Created {formattedDate}</span>
                  </div>
                </div>
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
                    onClick={() => router.push(tasksHref)}
                  >
                    <FolderKanban className="size-4 text-muted-foreground" />
                    <span>View Tasks</span>
                  </DropdownMenuItem>
                  {canManage && (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/workspaces/${project.workspaceId}/projects/${project.id}/settings?from=${settingsFrom}`
                        )
                      }
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      <span>Project Settings</span>
                    </DropdownMenuItem>
                  )}
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

          {/* Progress Bar */}
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
          </div>
        </CardContent>

        <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-4">
          <Link
            href={tasksHref}
            className="flex-1"
          >
            <Button variant="default" size="sm" className="w-full">
              View Tasks
            </Button>
          </Link>

          {canManage && (
            <Link
              href={`/workspaces/${project.workspaceId}/projects/${project.id}/settings?from=${settingsFrom}`}
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
          )}
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


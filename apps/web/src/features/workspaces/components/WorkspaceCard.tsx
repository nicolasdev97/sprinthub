'use client';

import Link from 'next/link';
import { Calendar, CheckCircle2, FolderKanban, Settings, Users } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useWorkspaceDashboard } from '@/features/dashboard';
import { cn } from '@/shared/utils';

import { useWorkspaceMembers } from '../hook';
import { Workspace, WorkspaceRole } from '../types';

interface WorkspaceCardProps {
  workspace: Workspace;
  isActive: boolean;
  onSelect: (workspaceId: string) => void;
}

function getRoleBadgeVariant(role: WorkspaceRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'OWNER':
      return 'default';
    case 'ADMIN':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function WorkspaceCard({ workspace, isActive, onSelect }: WorkspaceCardProps) {
  const { user } = useAuth();
  const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(workspace.id);
  const { data: dashboard, isLoading: isDashboardLoading } = useWorkspaceDashboard(workspace.id);

  const currentMember = members?.find((member) => member.userId === user?.id);
  const userRole: WorkspaceRole =
    currentMember?.role ?? (workspace.ownerId === user?.id ? 'OWNER' : 'MEMBER');

  const formattedDate = new Date(workspace.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      className={cn(
        'group flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-sm',
        isActive && 'border-primary/60 ring-1 ring-primary/20'
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary uppercase">
              {workspace.name.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{workspace.name}</CardTitle>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3 shrink-0" />
                <span>Created {formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {isActive && (
              <Badge variant="outline" className="border-primary/40 text-primary">
                <CheckCircle2 className="size-3" />
                Active
              </Badge>
            )}
            <Badge variant={getRoleBadgeVariant(userRole)}>{userRole}</Badge>
          </div>
        </div>

        <CardDescription className="line-clamp-2 min-h-10 text-xs leading-relaxed">
          {workspace.description || 'No description provided for this workspace.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Members</p>
              {isMembersLoading ? (
                <Skeleton className="mt-0.5 h-4 w-8" />
              ) : (
                <p className="font-semibold text-foreground">{members?.length ?? 1}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FolderKanban className="size-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Projects</p>
              {isDashboardLoading ? (
                <Skeleton className="mt-0.5 h-4 w-8" />
              ) : (
                <p className="font-semibold text-foreground">
                  {dashboard?.activeProjects ?? 0}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
        <Button
          variant={isActive ? 'secondary' : 'default'}
          size="sm"
          onClick={() => onSelect(workspace.id)}
          className="flex-1"
        >
          {isActive ? 'Selected Workspace' : 'Switch to Workspace'}
        </Button>

        <Link href={`/workspaces/${workspace.id}/settings`}>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Settings for ${workspace.name}`}
          >
            <Settings className="size-3.5" />
            <span>Settings</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}


'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Settings,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
} from '@/components/ui';
import { useAuth } from '@/features/auth';
import {
  useWorkspace,
  useWorkspaceContext,
  useWorkspaceMembers,
} from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { cn } from '@/shared/utils';

import { useWorkspaceMetrics, useWorkspaceTasksBreakdown } from '../hook';
import {
  DashboardDistributionCharts,
  DashboardDistributionChartsSkeleton,
} from './DashboardDistributionCharts';
import { DashboardKpiGrid, DashboardKpiGridSkeleton } from './DashboardKpiGrid';
import {
  DashboardUpcomingTasks,
  DashboardUpcomingTasksSkeleton,
} from './DashboardUpcomingTasks';

interface WorkspaceDashboardViewProps {
  workspaceId: string;
}

export function WorkspaceDashboardView({
  workspaceId,
}: WorkspaceDashboardViewProps) {
  const { user } = useAuth();
  const { activeWorkspace, setActiveWorkspaceId } = useWorkspaceContext();

  useEffect(() => {
    if (workspaceId && activeWorkspace?.id !== workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [workspaceId, activeWorkspace?.id, setActiveWorkspaceId]);

  const workspaceQuery = useWorkspace(workspaceId);
  const membersQuery = useWorkspaceMembers(workspaceId);
  const metricsQuery = useWorkspaceMetrics(workspaceId);
  const breakdownQuery = useWorkspaceTasksBreakdown(workspaceId, user?.id);

  const workspace = workspaceQuery.data ?? activeWorkspace;
  const currentUserRole = membersQuery.data?.find(
    (member) => member.userId === user?.id
  )?.role;
  const isInitialLoading =
    metricsQuery.isLoading ||
    breakdownQuery.isLoading ||
    (workspaceQuery.isLoading && !workspace);

  const isError = metricsQuery.isError || breakdownQuery.isError;
  const error = metricsQuery.error ?? breakdownQuery.error;
  const isRefreshing = metricsQuery.isFetching;

  const handleRefresh = async () => {
    await Promise.all([metricsQuery.refetch(), breakdownQuery.refetch()]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {workspace ? `${workspace.name} Dashboard` : 'Workspace Dashboard'}
            </h1>
            {currentUserRole && (
              <Badge variant="secondary" className="text-xs">
                {currentUserRole}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time overview of project velocity, task distribution, and upcoming deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isInitialLoading || isRefreshing}
          >
            <RefreshCw
              className={cn('size-3.5', isRefreshing && 'animate-spin')}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/workspaces/${workspaceId}/settings`} />}
          >
            <Settings className="size-3.5" />
            <span>Settings</span>
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/workspaces/${workspaceId}/projects`} />}
          >
            <FolderKanban className="size-3.5" />
            <span>View Projects</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load workspace analytics</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{normalizeApiError(error).message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="w-fit shrink-0"
            >
              <RefreshCw className="size-3.5" />
              <span>Try again</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isInitialLoading ? (
        <div className="space-y-6">
          <DashboardKpiGridSkeleton />
          <DashboardDistributionChartsSkeleton />
          <DashboardUpcomingTasksSkeleton />
        </div>
      ) : metricsQuery.data ? (
        <>
          {/* KPI Summary Cards */}
          <DashboardKpiGrid metrics={metricsQuery.data} />

          {/* Empty Workspace State (No Projects yet) */}
          {metricsQuery.data.activeProjects === 0 &&
          breakdownQuery.projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LayoutDashboard className="size-6" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Your workspace is ready for its first project
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Create a project and add tasks to unlock workflow analytics, priority breakdowns, and upcoming deadline tracking.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    nativeButton={false}
                    render={<Link href={`/workspaces/${workspaceId}/projects`} />}
                  >
                    <Plus className="size-4" />
                    <span>Create First Project</span>
                  </Button>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/tasks" />}
                  >
                    <CheckSquare className="size-4" />
                    <span>Explore Tasks</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Status & Priority Visual Distributions */}
              <DashboardDistributionCharts breakdown={breakdownQuery.data} />

              {/* Upcoming Deadlines & Recent Activity */}
              <DashboardUpcomingTasks
                workspaceId={workspaceId}
                upcomingTasks={breakdownQuery.data.upcomingTasks}
                recentTasks={breakdownQuery.data.recentTasks}
                currentUserId={user?.id}
              />
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

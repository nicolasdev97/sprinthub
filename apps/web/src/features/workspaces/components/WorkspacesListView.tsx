'use client';

import { useState } from 'react';
import { AlertCircle, ArrowUpDown, Briefcase, Plus, RefreshCw, Search, X } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Select,
  SelectOption,
  Skeleton,
  useToast,
} from '@/components/ui';
import { normalizeApiError } from '@/shared/errors';

import { useWorkspaceContext } from '../context';
import { useWorkspaces } from '../hook';
import { WorkspaceQueryParams } from '../types';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import { WorkspaceCard } from './WorkspaceCard';

interface WorkspacesListViewProps {
  initialCreateOpen?: boolean;
}

export function WorkspacesListView({ initialCreateOpen = false }: WorkspacesListViewProps) {
  const { toast } = useToast();
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(initialCreateOpen);
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortBy, setSortBy] = useState<NonNullable<WorkspaceQueryParams['sortBy']>>('createdAt');
  const [sortOrder, setSortOrder] =
    useState<NonNullable<WorkspaceQueryParams['sortOrder']>>('desc');

  const queryParams: WorkspaceQueryParams = {
    ...(searchInput.trim() ? { search: searchInput.trim() } : {}),
    sortBy,
    sortOrder,
  };

  const { data: workspaces, isLoading, isError, error, refetch } = useWorkspaces(queryParams);

  const handleSelectWorkspace = (workspaceId: string) => {
    const selected = workspaces?.find((w) => w.id === workspaceId);
    setActiveWorkspaceId(workspaceId);
    if (selected) {
      toast({
        title: 'Active workspace switched',
        description: `Now working in "${selected.name}".`,
        variant: 'success',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspaces Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select an active workspace or create a new one to collaborate with your team.
          </p>
        </div>

        <CreateWorkspaceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      {/* Filters & Sorting Bar */}
      <div className="flex flex-col xl:flex-row xl:items-start gap-2.5 rounded-xl border border-border bg-card p-4">
        <div className="relative w-full xl:w-72 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workspaces..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
            aria-label="Search workspaces"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-col xl:flex-row xl:flex-1 xl:flex-wrap items-stretch xl:items-center gap-2">
          <Select
            icon={ArrowUpDown}
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(val) => {
              const [newSortBy, newSortOrder] = val.split('-') as [
                NonNullable<WorkspaceQueryParams['sortBy']>,
                NonNullable<WorkspaceQueryParams['sortOrder']>,
              ];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="w-full xl:w-44"
            aria-label="Sort workspaces"
          >
            <SelectOption value="createdAt-desc">Newest First</SelectOption>
            <SelectOption value="createdAt-asc">Oldest First</SelectOption>
            <SelectOption value="name-asc">Name (A - Z)</SelectOption>
            <SelectOption value="name-desc">Name (Z - A)</SelectOption>
          </Select>

          {(Boolean(searchInput.trim()) || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
              className="w-full xl:w-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label="Loading workspaces"
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-lg" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Error State */}
      {isError && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load workspaces</AlertTitle>
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
      {!isLoading && !isError && (!workspaces || workspaces.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="size-6" />
          </div>

          {searchInput.trim() ? (
            <>
              <div className="max-w-md space-y-1">
                <h2 className="text-base font-semibold text-foreground">No matching workspaces</h2>
                <p className="text-sm text-muted-foreground">
                  No workspaces matched &ldquo;{searchInput.trim()}&rdquo;. Try a different search
                  term or clear the filter.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSearchInput('')}>
                Clear search
              </Button>
            </>
          ) : (
            <>
              <div className="max-w-md space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  You don&apos;t belong to any workspace yet
                </h2>
                <p className="text-sm text-muted-foreground">
                  Create your first workspace to start organizing projects, sprints, and tasks with
                  your team.
                </p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="size-4" />
                <span>Create First Workspace</span>
              </Button>
            </>
          )}
        </div>
      )}

      {/* 4. Success State */}
      {!isLoading && !isError && workspaces && workspaces.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              isActive={activeWorkspaceId === workspace.id}
              onSelect={handleSelectWorkspace}
            />
          ))}
        </div>
      )}
    </div>
  );
}

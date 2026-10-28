'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';
import { Project } from '@/features/projects';
import { Task } from '@/features/tasks';
import { Workspace } from '@/features/workspaces';
import { normalizeApiError } from '@/shared/errors';
import { crossTabSync, deletedEntities } from '@/shared/utils';

interface RealtimeEventsProviderProps {
  children: ReactNode;
}

function isQueryEligibleForInvalidation(query: {
  state: { data: unknown; error: unknown };
  queryKey: readonly unknown[];
}): boolean {
  if (deletedEntities.isQueryKeyDeleted(query.queryKey)) {
    return false;
  }
  if (query.state.data === null) {
    return false;
  }
  if (query.state.error) {
    const apiError = normalizeApiError(query.state.error);
    if (
      apiError.statusCode === 404 ||
      apiError.statusCode === 403 ||
      apiError.message.toLowerCase().includes('not found') ||
      apiError.message.toLowerCase().includes('forbidden') ||
      apiError.message.toLowerCase().includes('not a member')
    ) {
      return false;
    }
  }
  return true;
}

export function RealtimeEventsProvider({ children }: RealtimeEventsProviderProps) {
  const { accessToken, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const userIdRef = useRef<string | undefined>(user?.id);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // Helper function to safely evict and silence deleted tasks
  const applyTaskDeleted = useCallback(
    (taskId: string, projectId?: string) => {
      deletedEntities.markDeleted(taskId, projectId);

      queryClient.cancelQueries({
        predicate: (q) => q.queryKey.includes(taskId),
      });

      queryClient.setQueryDefaults(['tasks', taskId], { enabled: false, retry: false });
      queryClient.setQueryData(['tasks', taskId], null);

      if (projectId) {
        queryClient.setQueriesData<Task[]>({ queryKey: ['tasks', projectId] }, (old) =>
          Array.isArray(old) ? old.filter((t) => t.id !== taskId) : old
        );
      }
      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) =>
        Array.isArray(old) ? old.filter((t) => t.id !== taskId) : old
      );
    },
    [queryClient]
  );

  // Helper function to safely evict and silence deleted projects (and their cached tasks)
  const applyProjectDeleted = useCallback(
    (projectId: string, workspaceId?: string) => {
      deletedEntities.markDeleted(projectId, workspaceId);

      // Cascade eviction to all cached tasks belonging to this project
      const cachedTaskQueries = queryClient.getQueriesData<Task[]>({
        queryKey: ['tasks', projectId],
      });
      cachedTaskQueries.forEach(([, tasksList]) => {
        if (Array.isArray(tasksList)) {
          tasksList.forEach((t) => {
            if (t?.id) {
              applyTaskDeleted(t.id, projectId);
            }
          });
        }
      });

      queryClient.cancelQueries({
        predicate: (q) => q.queryKey.includes(projectId),
      });

      queryClient.setQueryDefaults(['projects', projectId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['tasks', projectId], { enabled: false, retry: false });

      queryClient.setQueryData(['projects', projectId], null);
      queryClient.setQueriesData({ queryKey: ['tasks', projectId] }, []);

      if (workspaceId) {
        queryClient.setQueriesData<Project[]>({ queryKey: ['projects', workspaceId] }, (old) =>
          Array.isArray(old) ? old.filter((p) => p.id !== projectId) : old
        );
      }
      queryClient.setQueriesData<Project[]>({ queryKey: ['projects'] }, (old) =>
        Array.isArray(old) ? old.filter((p) => p.id !== projectId) : old
      );
    },
    [applyTaskDeleted, queryClient]
  );

  // Helper function to safely evict and silence deleted or revoked workspaces
  const applyWorkspaceDeleted = useCallback(
    (workspaceId: string) => {
      deletedEntities.markDeleted(workspaceId);

      // Cascade eviction to all cached projects (and their tasks) belonging to this workspace
      const cachedProjectQueries = queryClient.getQueriesData<Project[]>({
        queryKey: ['projects', workspaceId],
      });
      cachedProjectQueries.forEach(([, projectsList]) => {
        if (Array.isArray(projectsList)) {
          projectsList.forEach((p) => {
            if (p?.id) {
              applyProjectDeleted(p.id, workspaceId);
            }
          });
        }
      });

      // Cancel all in-flight queries referencing this workspace
      queryClient.cancelQueries({
        predicate: (q) => q.queryKey.includes(workspaceId),
      });

      queryClient.setQueryDefaults(['workspaces', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['workspaces', workspaceId, 'members'], {
        enabled: false,
        retry: false,
      });
      queryClient.setQueryDefaults(['projects', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['tasks', workspaceId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['dashboard', workspaceId], { enabled: false, retry: false });

      queryClient.setQueryData(['workspaces', workspaceId], null);
      queryClient.setQueriesData({ queryKey: ['workspaces', workspaceId, 'members'] }, []);
      queryClient.setQueriesData({ queryKey: ['projects', workspaceId] }, []);
      queryClient.setQueriesData({ queryKey: ['tasks', workspaceId] }, []);
      queryClient.setQueryData(['dashboard', workspaceId], null);

      queryClient.setQueriesData<Workspace[]>({ queryKey: ['workspaces'] }, (old) =>
        Array.isArray(old) ? old.filter((w) => w.id !== workspaceId) : old
      );
    },
    [applyProjectDeleted, queryClient]
  );

  // Helper function to cleanly restore a workspace when a previously removed member is re-added
  const applyWorkspaceRestored = useCallback(
    (workspaceId: string) => {
      const restoredIds = deletedEntities.unmarkDeleted(workspaceId);

      queryClient.setQueryDefaults(['workspaces', workspaceId], { retry: false });
      queryClient.setQueryDefaults(['workspaces', workspaceId, 'members'], { retry: false });
      queryClient.setQueryDefaults(['projects', workspaceId], { retry: false });
      queryClient.setQueryDefaults(['tasks', workspaceId], { retry: false });
      queryClient.setQueryDefaults(['dashboard', workspaceId], { retry: false });

      restoredIds.forEach((id) => {
        queryClient.setQueryDefaults(['projects', id], { retry: false });
        queryClient.setQueryDefaults(['tasks', id], { retry: false });
      });

      const restoredSet = new Set([workspaceId, ...restoredIds]);
      queryClient.removeQueries({
        predicate: (q) =>
          q.queryKey.some((part) => typeof part === 'string' && restoredSet.has(part)) ||
          Boolean(q.state.error),
      });
    },
    [queryClient]
  );

  // Cross-tab synchronization listener for multi-tab environments
  useEffect(() => {
    const unsubscribe = crossTabSync.subscribe((event) => {
      if (event.type === 'ENTITY_DELETED') {
        if (event.entity === 'task') {
          applyTaskDeleted(event.id, event.projectId);
        } else if (event.entity === 'project') {
          applyProjectDeleted(event.id, event.workspaceId);
        } else if (event.entity === 'workspace') {
          applyWorkspaceDeleted(event.id);
        }
      } else if (event.type === 'QUERY_INVALIDATE') {
        event.queryKeys.forEach((key) => {
          queryClient.invalidateQueries({
            predicate: (query) => {
              if (!isQueryEligibleForInvalidation(query)) {
                return false;
              }
              const keyPrefix = key[0];
              return query.queryKey[0] === keyPrefix;
            },
          });
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [applyProjectDeleted, applyTaskDeleted, applyWorkspaceDeleted, queryClient]);

  // Server-Sent Events (SSE) stream listener
  useEffect(() => {
    if (!isAuthenticated || !accessToken || typeof window === 'undefined') {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const sseUrl = `${apiUrl}/events?token=${encodeURIComponent(accessToken)}`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;

      try {
        eventSource = new EventSource(sseUrl);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          if (!event.data) return;
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'TASK_MUTATED':
                if (data.action === 'deleted' && data.taskId) {
                  applyTaskDeleted(data.taskId, data.projectId);
                }
                queryClient.invalidateQueries({
                  predicate: (query) =>
                    isQueryEligibleForInvalidation(query) && query.queryKey[0] === 'tasks',
                });
                queryClient.invalidateQueries({
                  predicate: (query) =>
                    isQueryEligibleForInvalidation(query) && query.queryKey[0] === 'dashboard',
                });
                break;
              case 'PROJECT_MUTATED':
                if (data.action === 'deleted' && data.projectId) {
                  applyProjectDeleted(data.projectId, data.workspaceId);
                }
                queryClient.invalidateQueries({
                  predicate: (query) =>
                    isQueryEligibleForInvalidation(query) && query.queryKey[0] === 'projects',
                });
                queryClient.invalidateQueries({
                  predicate: (query) =>
                    isQueryEligibleForInvalidation(query) && query.queryKey[0] === 'tasks',
                });
                queryClient.invalidateQueries({
                  predicate: (query) =>
                    isQueryEligibleForInvalidation(query) && query.queryKey[0] === 'dashboard',
                });
                break;
              case 'WORKSPACE_MUTATED':
                if (
                  (data.action === 'deleted' && data.workspaceId) ||
                  (data.action === 'member_removed' &&
                    data.userId === userIdRef.current &&
                    data.workspaceId)
                ) {
                  applyWorkspaceDeleted(data.workspaceId);
                  break;
                }
                if (
                  data.action === 'member_added' &&
                  data.workspaceId &&
                  deletedEntities.isDeleted(data.workspaceId)
                ) {
                  applyWorkspaceRestored(data.workspaceId);
                }
                queryClient.invalidateQueries({
                  predicate: (query) =>
                    isQueryEligibleForInvalidation(query) &&
                    (query.queryKey[0] === 'workspaces' ||
                      query.queryKey[0] === 'projects' ||
                      query.queryKey[0] === 'tasks' ||
                      query.queryKey[0] === 'workspace-members' ||
                      query.queryKey[0] === 'dashboard'),
                });
                break;
              case 'NOTIFICATION_CREATED':
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                break;
              default:
                break;
            }
          } catch {
            // Heartbeats or non-JSON messages can be safely ignored
          }
        };

        eventSource.onerror = () => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          if (!isDisposed) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
      } catch {
        // SSE connection error, scheduled retry
        if (!isDisposed) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [
    accessToken,
    applyProjectDeleted,
    applyTaskDeleted,
    applyWorkspaceDeleted,
    applyWorkspaceRestored,
    isAuthenticated,
    queryClient,
  ]);

  return <>{children}</>;
}

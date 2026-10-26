'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth';

import { workspaceService } from '../service';
import { Workspace } from '../types';

const ACTIVE_WORKSPACE_STORAGE_KEY = 'sprinthub:active-workspace-id';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  isLoading: boolean;
  isError: boolean;
  setActiveWorkspaceId: (workspaceId: string) => void;
  refetchWorkspaces: () => Promise<unknown>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { isAuthenticated, isInitializing } = useAuth();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const {
    data: workspaces = [],
    isLoading: isQueryLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['workspaces', undefined],
    queryFn: () => workspaceService.getWorkspaces(),
    enabled: isAuthenticated && !isInitializing,
  });

  const activeWorkspace = useMemo<Workspace | null>(() => {
    if (workspaces.length === 0) {
      return null;
    }

    if (selectedWorkspaceId) {
      const matched = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
      if (matched) {
        return matched;
      }
    }

    // Default to first workspace if none saved or if saved workspace no longer exists
    return workspaces[0] ?? null;
  }, [workspaces, selectedWorkspaceId]);

  const setActiveWorkspaceId = useCallback((workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
      } catch {
        // Ignore storage write errors in restricted environments
      }
    }
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces,
      activeWorkspace,
      activeWorkspaceId: activeWorkspace?.id ?? null,
      isLoading: isInitializing || (isAuthenticated && isQueryLoading),
      isError,
      setActiveWorkspaceId,
      refetchWorkspaces: refetch,
    }),
    [
      workspaces,
      activeWorkspace,
      isInitializing,
      isAuthenticated,
      isQueryLoading,
      isError,
      setActiveWorkspaceId,
      refetch,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }

  return context;
}


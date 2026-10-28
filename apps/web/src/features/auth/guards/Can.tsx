'use client';

import { ReactNode } from 'react';

import type { WorkspaceRole } from '@/features/workspaces/types';

import { WorkspacePermission } from './permissions';
import { useHasPermission } from './use-has-permission';

export interface CanProps {
  /**
   * Optional workspace ID. Defaults to the currently active workspace in WorkspaceContext.
   */
  workspaceId?: string | null;
  /**
   * Granular domain permission to check (e.g., 'project:create', 'workspace:delete').
   */
  permission?: WorkspacePermission;
  /**
   * Explicit list of allowed workspace roles (e.g., ['OWNER', 'ADMIN']).
   */
  allowedRoles?: readonly WorkspaceRole[];
  /**
   * Optional fallback UI rendered when the user lacks the required permission.
   */
  fallback?: ReactNode;
  /**
   * Content rendered when the user is authorized. Can also be a render function receiving `{ hasPermission, role, isLoading }`.
   */
  children:
    | ReactNode
    | ((state: {
        hasPermission: boolean;
        role: WorkspaceRole | null;
        isOwner: boolean;
        isAdmin: boolean;
        isLoading: boolean;
      }) => ReactNode);
}

/**
 * Declarative client-side authorization guard component to hide or disable
 * UI actions reserved for specific workspace roles (`OWNER` / `ADMIN`).
 */
export function Can({
  workspaceId,
  permission,
  allowedRoles,
  fallback = null,
  children,
}: CanProps) {
  const { hasPermission, role, isOwner, isAdmin, isLoading } = useHasPermission({
    workspaceId,
    permission,
    allowedRoles,
  });

  if (typeof children === 'function') {
    return <>{children({ hasPermission, role, isOwner, isAdmin, isLoading })}</>;
  }

  if (isLoading) {
    return null;
  }

  return <>{hasPermission ? children : fallback}</>;
}

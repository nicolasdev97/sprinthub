'use client';

import { useMemo } from 'react';

import { useWorkspaceContext } from '@/features/workspaces/context';
import { useWorkspace, useWorkspaceMembers } from '@/features/workspaces/hook';
import type { WorkspaceRole } from '@/features/workspaces/types';
import { deletedEntities } from '@/shared/utils';

import { useAuth } from '../context';
import { evaluateRolePermission, WorkspacePermission } from './permissions';

export interface UseHasPermissionOptions {
  workspaceId?: string | null;
  permission?: WorkspacePermission;
  allowedRoles?: readonly WorkspaceRole[];
}

export interface UseHasPermissionResult {
  role: WorkspaceRole | null;
  hasPermission: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isLoading: boolean;
}

/**
 * Resolves the authenticated user's role in the target (or active) workspace
 * and evaluates whether they hold the requested role or domain permission.
 */
export function useHasPermission(options: UseHasPermissionOptions = {}): UseHasPermissionResult {
  const { user, isAuthenticated } = useAuth();
  const { activeWorkspaceId, activeWorkspace } = useWorkspaceContext();

  const resolvedWorkspaceId = options.workspaceId ?? activeWorkspaceId ?? '';
  const isWorkspaceValid =
    Boolean(resolvedWorkspaceId) && !deletedEntities.isDeleted(resolvedWorkspaceId);

  const { data: fetchedWorkspace, isLoading: isWorkspaceLoading } = useWorkspace(
    resolvedWorkspaceId,
    {
      enabled: isWorkspaceValid && activeWorkspace?.id !== resolvedWorkspaceId,
    }
  );

  const { data: members, isLoading: isMembersLoading } = useWorkspaceMembers(resolvedWorkspaceId, {
    enabled: isWorkspaceValid,
  });

  const targetWorkspace =
    activeWorkspace?.id === resolvedWorkspaceId ? activeWorkspace : fetchedWorkspace;

  const role = useMemo<WorkspaceRole | null>(() => {
    if (!isAuthenticated || !user || !isWorkspaceValid) {
      return null;
    }

    const memberRecord = members?.find((m) => m.userId === user.id);
    if (memberRecord?.role) {
      return memberRecord.role;
    }

    if (targetWorkspace?.ownerId === user.id) {
      return 'OWNER';
    }

    if (members && members.length > 0) {
      return null;
    }

    return targetWorkspace ? 'MEMBER' : null;
  }, [isAuthenticated, user, isWorkspaceValid, members, targetWorkspace]);

  const hasPermission = useMemo(() => {
    return evaluateRolePermission(role, {
      permission: options.permission,
      allowedRoles: options.allowedRoles,
    });
  }, [role, options.permission, options.allowedRoles]);

  return {
    role,
    hasPermission,
    isOwner: role === 'OWNER',
    isAdmin: role === 'ADMIN',
    isMember: role === 'MEMBER',
    isLoading: isWorkspaceLoading || isMembersLoading,
  };
}

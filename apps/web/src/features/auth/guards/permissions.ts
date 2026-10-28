import type { WorkspaceRole } from '@/features/workspaces/types';

export type WorkspacePermission =
  | 'workspace:update'
  | 'workspace:delete'
  | 'workspace:transfer_ownership'
  | 'workspace:manage_settings'
  | 'member:invite'
  | 'member:remove'
  | 'member:update_role'
  | 'project:create'
  | 'project:update'
  | 'project:archive'
  | 'project:delete'
  | 'task:create'
  | 'task:update'
  | 'task:delete';

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

export const PERMISSION_MATRIX: Record<WorkspacePermission, readonly WorkspaceRole[]> = {
  'workspace:update': ['OWNER', 'ADMIN'],
  'workspace:delete': ['OWNER'],
  'workspace:transfer_ownership': ['OWNER'],
  'workspace:manage_settings': ['OWNER', 'ADMIN'],
  'member:invite': ['OWNER', 'ADMIN'],
  'member:remove': ['OWNER', 'ADMIN'],
  'member:update_role': ['OWNER'],
  'project:create': ['OWNER', 'ADMIN'],
  'project:update': ['OWNER', 'ADMIN'],
  'project:archive': ['OWNER', 'ADMIN'],
  'project:delete': ['OWNER', 'ADMIN'],
  'task:create': ['OWNER', 'ADMIN', 'MEMBER'],
  'task:update': ['OWNER', 'ADMIN', 'MEMBER'],
  'task:delete': ['OWNER', 'ADMIN'],
};

/**
 * Evaluates whether a given workspace role satisfies the required permission or role list.
 */
export function evaluateRolePermission(
  userRole: WorkspaceRole | null | undefined,
  options: {
    permission?: WorkspacePermission;
    allowedRoles?: readonly WorkspaceRole[];
  }
): boolean {
  if (!userRole) {
    return false;
  }

  if (options.allowedRoles && options.allowedRoles.length > 0) {
    if (!options.allowedRoles.includes(userRole)) {
      return false;
    }
  }

  if (options.permission) {
    const permittedRoles = PERMISSION_MATRIX[options.permission];
    if (!permittedRoles.includes(userRole)) {
      return false;
    }
  }

  return true;
}


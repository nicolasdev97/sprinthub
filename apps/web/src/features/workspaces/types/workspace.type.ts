export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type AssignableWorkspaceRole = Exclude<WorkspaceRole, 'OWNER'>;

export interface WorkspaceMemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user?: WorkspaceMemberUser;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string | null;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string | null;
}

export interface AddWorkspaceMemberRequest {
  email: string;
  role: AssignableWorkspaceRole;
}

export interface UpdateWorkspaceMemberRoleRequest {
  role: AssignableWorkspaceRole;
}

export interface WorkspaceQueryParams {
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface WorkspaceParams {
  workspaceId: string;
}

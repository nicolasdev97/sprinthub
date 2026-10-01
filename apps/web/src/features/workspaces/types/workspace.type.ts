export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
  description: string;
}

export interface AddWorkspaceMemberRequest {
  userId: string;
  role: WorkspaceRole;
}

export interface UpdateWorkspaceMemberRoleRequest {
  role: WorkspaceRole;
}

export interface WorkspaceParams {
  workspaceId: string;
}

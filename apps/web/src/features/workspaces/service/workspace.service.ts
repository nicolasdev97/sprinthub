import { httpClient } from '@/services';

import {
  AddWorkspaceMemberRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceMemberRoleRequest,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceMember,
} from '../types';

export const workspaceService = {
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await httpClient.get<Workspace[]>('/workspaces');

    return response.data;
  },

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const response = await httpClient.get<Workspace>(`/workspaces/${workspaceId}`);

    return response.data;
  },

  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await httpClient.post<Workspace>('/workspaces', data);

    return response.data;
  },

  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    const response = await httpClient.patch<Workspace>(`/workspaces/${workspaceId}`, data);

    return response.data;
  },

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await httpClient.delete(`/workspaces/${workspaceId}`);
  },

  async addMember(workspaceId: string, data: AddWorkspaceMemberRequest): Promise<WorkspaceMember> {
    const response = await httpClient.post<WorkspaceMember>(
      `/workspaces/${workspaceId}/members`,
      data
    );

    return response.data;
  },

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    data: UpdateWorkspaceMemberRoleRequest
  ): Promise<WorkspaceMember> {
    const response = await httpClient.patch<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      data
    );

    return response.data;
  },

  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    await httpClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
};

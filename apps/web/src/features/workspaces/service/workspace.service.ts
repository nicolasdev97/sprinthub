import { httpClient } from '@/services';

import {
  AddWorkspaceMemberRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceMemberRoleRequest,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceMember,
  WorkspaceQueryParams,
} from '../types';

export const workspaceService = {
  async getWorkspaces(params?: WorkspaceQueryParams): Promise<Workspace[]> {
    const response = await httpClient.get<Workspace[]>('/workspaces', {
      params,
    });

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

  async getMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await httpClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);

    return response.data;
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

  async transferOwnership(workspaceId: string, newOwnerId: string): Promise<Workspace> {
    const response = await httpClient.post<Workspace>(
      `/workspaces/${workspaceId}/transfer-ownership`,
      { newOwnerId }
    );

    return response.data;
  },
};

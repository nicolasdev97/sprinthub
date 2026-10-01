import { httpClient } from '@/services';

import { CreateProjectRequest, Project, ProjectQueryParams, UpdateProjectRequest } from '../types';

export const projectService = {
  async getProjects(workspaceId: string, params?: ProjectQueryParams): Promise<Project[]> {
    const response = await httpClient.get<Project[]>(`/workspaces/${workspaceId}/projects`, {
      params,
    });

    return response.data;
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await httpClient.get<Project>(`/projects/${projectId}`);

    return response.data;
  },

  async createProject(workspaceId: string, data: CreateProjectRequest): Promise<Project> {
    const response = await httpClient.post<Project>(`/workspaces/${workspaceId}/projects`, data);

    return response.data;
  },

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await httpClient.patch<Project>(`/projects/${projectId}`, data);

    return response.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await httpClient.delete(`/projects/${projectId}`);
  },

  async archiveProject(projectId: string): Promise<Project> {
    const response = await httpClient.patch<Project>(`/projects/${projectId}/archive`);

    return response.data;
  },

  async unarchiveProject(projectId: string): Promise<Project> {
    const response = await httpClient.patch<Project>(`/projects/${projectId}/unarchive`);

    return response.data;
  },
};

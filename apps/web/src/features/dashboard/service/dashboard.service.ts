import { httpClient } from '@/services';
import { WorkspaceDashboard } from '../types/dashboard.type';

export const dashboardService = {
  async getWorkspaceDashboard(
    workspaceId: string,
  ): Promise<WorkspaceDashboard> {
    const response = await httpClient.get<WorkspaceDashboard>(
      `/workspaces/${workspaceId}/dashboard`,
    );

    return response.data;
  },
};


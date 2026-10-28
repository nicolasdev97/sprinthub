import { useQuery } from '@tanstack/react-query';

import { deletedEntities } from '@/shared/utils';

import { dashboardService } from '../service';

export const useWorkspaceDashboard = (workspaceId: string) => {
  return useQuery({
    queryKey: ['dashboard', workspaceId],
    queryFn: () => dashboardService.getWorkspaceDashboard(workspaceId),
    enabled: Boolean(workspaceId) && !deletedEntities.isDeleted(workspaceId),
    retry: false,
  });
};

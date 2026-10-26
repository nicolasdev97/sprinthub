import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { crossTabSync } from '@/shared/utils';

import { projectService } from '../service';
import {
  ArchiveProjectRequest,
  CreateProjectRequest,
  ProjectQueryParams,
  UpdateProjectRequest,
} from '../types';

export const useProjects = (workspaceId: string, params?: ProjectQueryParams) => {
  return useQuery({
    queryKey: ['projects', workspaceId, params],
    queryFn: () => projectService.getProjects(workspaceId, params),
    enabled: Boolean(workspaceId),
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: Boolean(projectId),
  });
};

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.createProject(workspaceId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['projects'], ['tasks'], ['dashboard']],
      });
    },
  });
};

export const useUpdateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectRequest }) =>
      projectService.updateProject(projectId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', workspaceId],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['projects'], ['tasks'], ['dashboard']],
      });
    },
  });
};

export const useDeleteProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),

    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', workspaceId],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['projects'], ['tasks'], ['dashboard']],
      });
    },
  });
};

export const useArchiveProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ArchiveProjectRequest }) =>
      projectService.archiveProject(projectId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', workspaceId],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['projects'], ['tasks'], ['dashboard']],
      });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { projectService } from '../service';
import { CreateProjectRequest, ProjectQueryParams, UpdateProjectRequest } from '../types';

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
    },
  });
};

export const useArchiveProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.archiveProject(projectId),

    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', projectId],
      });
    },
  });
};

export const useUnarchiveProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.unarchiveProject(projectId),

    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['projects', projectId],
      });
    },
  });
};

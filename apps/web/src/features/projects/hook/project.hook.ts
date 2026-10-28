import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Task } from '@/features/tasks/types';
import { crossTabSync, deletedEntities } from '@/shared/utils';

import { projectService } from '../service';
import {
  ArchiveProjectRequest,
  CreateProjectRequest,
  Project,
  ProjectQueryParams,
  UpdateProjectRequest,
} from '../types';

export const useProjects = (
  workspaceId: string,
  params?: ProjectQueryParams,
  options?: { enabled?: boolean }
) => {
  const isEnabled = Boolean(workspaceId) && !deletedEntities.isDeleted(workspaceId);
  return useQuery({
    queryKey: ['projects', workspaceId, params],
    queryFn: () => projectService.getProjects(workspaceId, params),
    enabled: options?.enabled !== undefined ? options.enabled && isEnabled : isEnabled,
    retry: false,
  });
};

export const useProject = (projectId: string, options?: { enabled?: boolean }) => {
  const isEnabled = Boolean(projectId) && !deletedEntities.isDeleted(projectId);
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: options?.enabled !== undefined ? options.enabled && isEnabled : isEnabled,
    retry: false,
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

    onSuccess: (updatedProject, variables) => {
      if (updatedProject && updatedProject.id) {
        queryClient.setQueryData(['projects', variables.projectId], updatedProject);
      }

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

    onMutate: async (projectId: string) => {
      // 1. Immediately register project (and its cached tasks) as permanently deleted
      deletedEntities.markDeleted(projectId, workspaceId);

      const cachedTaskQueries = queryClient.getQueriesData<Task[]>({
        queryKey: ['tasks', projectId],
      });
      cachedTaskQueries.forEach(([, tasksList]) => {
        if (Array.isArray(tasksList)) {
          tasksList.forEach((t) => {
            if (t?.id) {
              deletedEntities.markDeleted(t.id, projectId);
              queryClient.setQueryDefaults(['tasks', t.id], { enabled: false, retry: false });
              queryClient.setQueryData(['tasks', t.id], null);
            }
          });
        }
      });

      // 2. Immediately silence and set null on any mounted queries observing this project or its tasks
      queryClient.setQueryDefaults(['projects', projectId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['tasks', projectId], { enabled: false, retry: false });
      await queryClient.cancelQueries({ queryKey: ['projects', projectId] });
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      queryClient.setQueryData(['projects', projectId], null);
      queryClient.setQueriesData({ queryKey: ['tasks', projectId] }, []);

      // 3. Optimistically remove project from list queries so <ProjectCard> unmounts right away
      queryClient.setQueriesData<Project[]>({ queryKey: ['projects', workspaceId] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((p) => p.id !== projectId);
      });
      queryClient.setQueriesData<Project[]>({ queryKey: ['projects'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((p) => p.id !== projectId);
      });
    },

    onSuccess: (_, projectId) => {
      deletedEntities.markDeleted(projectId, workspaceId);

      // Ensure queries for this deleted project remain silenced and set to null
      queryClient.setQueryDefaults(['projects', projectId], { enabled: false, retry: false });
      queryClient.setQueryDefaults(['tasks', projectId], { enabled: false, retry: false });
      queryClient.setQueryData(['projects', projectId], null);
      queryClient.setQueriesData({ queryKey: ['tasks', projectId] }, []);

      queryClient.invalidateQueries({
        queryKey: ['projects', workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard', workspaceId],
      });

      crossTabSync.postMessage({
        type: 'ENTITY_DELETED',
        entity: 'project',
        id: projectId,
        workspaceId,
      });
    },
  });
};

export const useArchiveProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ArchiveProjectRequest }) =>
      projectService.archiveProject(projectId, data),

    onSuccess: (updatedProject, variables) => {
      if (updatedProject && updatedProject.id) {
        queryClient.setQueryData(['projects', variables.projectId], updatedProject);
      }

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

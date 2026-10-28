import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { crossTabSync, deletedEntities } from '@/shared/utils';

import { taskService } from '../service';
import {
  AssignTaskRequest,
  CreateTaskRequest,
  Task,
  TaskQueryParams,
  UpdateTaskPriorityRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '../types';

export const useTasks = (
  projectId: string,
  params?: TaskQueryParams,
  options?: { enabled?: boolean }
) => {
  const isEnabled = Boolean(projectId) && !deletedEntities.isDeleted(projectId);
  return useQuery({
    queryKey: ['tasks', projectId, params],
    queryFn: () => taskService.getTasks(projectId, params),
    enabled: options?.enabled !== undefined ? options.enabled && isEnabled : isEnabled,
    retry: false,
  });
};

export const useTask = (taskId: string, options?: { enabled?: boolean }) => {
  const isEnabled = Boolean(taskId) && !deletedEntities.isDeleted(taskId);
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => taskService.getTask(taskId),
    enabled: options?.enabled !== undefined ? options.enabled && isEnabled : isEnabled,
    retry: false,
  });
};

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(projectId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['tasks'], ['dashboard']],
      });
    },
  });
};

export const useUpdateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      taskService.updateTask(taskId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['tasks'], ['dashboard']],
      });
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),

    onMutate: async (taskId: string) => {
      deletedEntities.markDeleted(taskId);

      queryClient.setQueryDefaults(['tasks', taskId], { enabled: false, retry: false });
      await queryClient.cancelQueries({ queryKey: ['tasks', taskId] });
      queryClient.setQueryData(['tasks', taskId], null);
      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks', projectId] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((t) => t.id !== taskId);
      });
      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((t) => t.id !== taskId);
      });
    },

    onSuccess: (_, taskId) => {
      deletedEntities.markDeleted(taskId);

      // Ensure deleted task is silenced and set to null so no refetch occurs
      queryClient.setQueryDefaults(['tasks', taskId], { enabled: false, retry: false });
      queryClient.setQueryData(['tasks', taskId], null);

      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      crossTabSync.postMessage({
        type: 'ENTITY_DELETED',
        entity: 'task',
        id: taskId,
        projectId,
      });
    },
  });
};

export const useAssignTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: AssignTaskRequest }) =>
      taskService.assignTask(taskId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['tasks'], ['dashboard']],
      });
    },
  });
};

export const useUpdateTaskStatus = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskStatusRequest }) =>
      taskService.updateTaskStatus(taskId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['tasks'], ['dashboard']],
      });
    },
  });
};

export const useUpdateTaskPriority = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskPriorityRequest }) =>
      taskService.updateTaskPriority(taskId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });

      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['tasks'], ['dashboard']],
      });
    },
  });
};

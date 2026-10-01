import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { taskService } from '../service';
import {
  AssignTaskRequest,
  CreateTaskRequest,
  TaskQueryParams,
  UpdateTaskPriorityRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '../types';

export const useTasks = (projectId: string, params?: TaskQueryParams) => {
  return useQuery({
    queryKey: ['tasks', projectId, params],
    queryFn: () => taskService.getTasks(projectId, params),
    enabled: Boolean(projectId),
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => taskService.getTask(taskId),
    enabled: Boolean(taskId),
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
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),

    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks', taskId],
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
    },
  });
};

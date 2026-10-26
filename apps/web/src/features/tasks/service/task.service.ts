import { httpClient } from '@/services';

import {
  AssignTaskRequest,
  CreateTaskRequest,
  Task,
  TaskQueryParams,
  UpdateTaskPriorityRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '../types';

export const taskService = {
  async getTasks(projectId: string, params?: TaskQueryParams): Promise<Task[]> {
    const response = await httpClient.get<Task[]>(`/projects/${projectId}/tasks`, {
      params,
    });

    return response.data;
  },

  async getTask(taskId: string): Promise<Task> {
    const response = await httpClient.get<Task>(`/tasks/${taskId}`);

    return response.data;
  },

  async createTask(projectId: string, data: CreateTaskRequest): Promise<Task> {
    const response = await httpClient.post<Task>(`/projects/${projectId}/tasks`, data);

    return response.data;
  },

  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await httpClient.patch<Task>(`/tasks/${taskId}`, data);

    return response.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await httpClient.delete(`/tasks/${taskId}`);
  },

  async assignTask(taskId: string, data: AssignTaskRequest): Promise<Task> {
    const response = await httpClient.patch<Task>(`/tasks/${taskId}/assign`, data);

    return response.data;
  },

  async updateTaskStatus(taskId: string, data: UpdateTaskStatusRequest): Promise<Task> {
    const response = await httpClient.patch<Task>(`/tasks/${taskId}/status`, data);

    return response.data;
  },

  async updateTaskPriority(taskId: string, data: UpdateTaskPriorityRequest): Promise<Task> {
    const response = await httpClient.patch<Task>(`/tasks/${taskId}/priority`, data);

    return response.data;
  },
};

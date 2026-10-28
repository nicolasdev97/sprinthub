import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks, useCreateTask } from '../task.hook';
import { taskService } from '../../service';
import { deletedEntities } from '@/shared/utils';

jest.mock('../../service', () => ({
  taskService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
  },
}));

describe('useTasks and useCreateTask Hooks', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    return function TestQueryWrapper({ children }: { children: React.ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deletedEntities.clear();
  });

  describe('useTasks', () => {
    it('should fetch and return tasks when project is valid and not deleted', async () => {
      const mockTasks = [
        { id: 't-1', title: 'Task 1', status: 'TODO', priority: 'HIGH' },
        { id: 't-2', title: 'Task 2', status: 'DONE', priority: 'LOW' },
      ];
      (taskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks('proj-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(taskService.getTasks).toHaveBeenCalledWith('proj-1', undefined);
      expect(result.current.data).toEqual(mockTasks);
    });

    it('should not trigger query if projectId is marked in deletedEntities', async () => {
      deletedEntities.markDeleted('proj-deleted');

      const { result } = renderHook(() => useTasks('proj-deleted'), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(taskService.getTasks).not.toHaveBeenCalled();
    });
  });

  describe('useCreateTask', () => {
    it('should call taskService.createTask and succeed', async () => {
      const newTask = { id: 't-created', title: 'New Story', status: 'TODO' };
      (taskService.createTask as jest.Mock).mockResolvedValue(newTask);

      const { result } = renderHook(() => useCreateTask('proj-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'New Story',
        priority: 'MEDIUM',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(taskService.createTask).toHaveBeenCalledWith('proj-1', {
        title: 'New Story',
        priority: 'MEDIUM',
      });
      expect(result.current.data).toEqual(newTask);
    });
  });
});

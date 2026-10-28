import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { crossTabSync } from '@/shared/utils';
import { userService } from '../service';
import { DeleteUserRequest, UpdateUserRequest } from '../types';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => userService.getCurrentUser(),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateCurrentUser(data),

    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({
        queryKey: ['user'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
      crossTabSync.postMessage({
        type: 'AUTH_USER_UPDATED',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      });
      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['workspaces'], ['tasks'], ['dashboard']],
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteUserRequest) => userService.deleteCurrentUser(data),

    onSuccess: () => {
      queryClient.clear();
      crossTabSync.postMessage({ type: 'AUTH_LOGOUT' });
    },
  });
};

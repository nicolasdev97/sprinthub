import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user'],
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteUserRequest) => userService.deleteCurrentUser(data),

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ['user'],
      });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationService } from '../service';
import { NotificationQueryParams } from '../types';

export const useNotifications = (params?: NotificationQueryParams) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });
    },
  });
};

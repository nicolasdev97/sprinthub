import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationService } from '../service';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
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

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      if (notificationIds.length === 0) {
        return;
      }
      await Promise.all(
        notificationIds.map((notificationId) =>
          notificationService.markAsRead(notificationId)
        )
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      });
    },
  });
};


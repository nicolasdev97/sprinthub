import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { crossTabSync } from '@/shared/utils';
import { notificationService } from '../service';

export const useNotifications = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    enabled: options?.enabled ?? true,
    refetchInterval: 15_000, // Background polling every 15s
    refetchIntervalInBackground: false, // Pauses when tab is inactive to save battery/network
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
      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['notifications']],
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
      crossTabSync.postMessage({
        type: 'QUERY_INVALIDATE',
        queryKeys: [['notifications']],
      });
    },
  });
};


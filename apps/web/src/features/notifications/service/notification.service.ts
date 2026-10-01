import { httpClient } from '@/services';

import { Notification, NotificationQueryParams } from '../types';

export const notificationService = {
  async getNotifications(params?: NotificationQueryParams): Promise<Notification[]> {
    const response = await httpClient.get<Notification[]>('/notifications', {
      params,
    });

    return response.data;
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await httpClient.patch<Notification>(`/notifications/${notificationId}/read`);

    return response.data;
  },
};

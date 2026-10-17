import { httpClient } from '@/services';

import { Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await httpClient.get<Notification[]>('/notifications');

    return response.data;
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await httpClient.patch<Notification>(`/notifications/${notificationId}/read`);

    return response.data;
  },
};

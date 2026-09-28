import { AppError } from "../../../shared";

import { NotificationRepository } from "../repository";

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createNotification(userId: string, title: string, message: string) {
    return this.notificationRepository.createNotification(
      userId,
      title,
      message,
    );
  }

  async getNotificationsByUser(userId: string) {
    return this.notificationRepository.getNotificationsByUser(userId);
  }

  async updateNotificationReadStatus(notificationId: string, userId: string) {
    const notification =
      await this.notificationRepository.getNotificationById(notificationId);

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    if (notification.userId !== userId) {
      throw new AppError("Notification not found", 404);
    }

    return this.notificationRepository.updateNotificationReadStatus(
      notificationId,
    );
  }
}

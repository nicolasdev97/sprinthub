import { AppError } from "../../../shared";
import { eventsService } from "../../events";

import { NotificationRepository } from "../repository";

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createNotification(userId: string, title: string, message: string) {
    const notification = await this.notificationRepository.createNotification(
      userId,
      title,
      message,
    );

    eventsService.emitToUser(userId, {
      type: "NOTIFICATION_CREATED",
      userId,
      notificationId: notification.id,
    });

    return notification;
  }

  async createManyNotifications(
    userIds: string[],
    title: string,
    message: string,
  ) {
    const result = await this.notificationRepository.createManyNotifications(
      userIds,
      title,
      message,
    );

    userIds.forEach((uid) => {
      eventsService.emitToUser(uid, {
        type: "NOTIFICATION_CREATED",
        userId: uid,
        notificationId: "bulk",
      });
    });

    return result;
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

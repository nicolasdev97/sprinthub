import { Request, Response } from "express";

import { NotificationService } from "../service";
import { NotificationParams } from "../types";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications(req: Request, res: Response) {
    const userId = req.user.userId;

    const notifications =
      await this.notificationService.getNotificationsByUser(userId);

    res.status(200).json(notifications);
  }

  async updateNotificationReadStatus(
    req: Request<NotificationParams>,
    res: Response,
  ) {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification =
      await this.notificationService.updateNotificationReadStatus(
        notificationId,
        userId,
      );

    res.status(200).json(notification);
  }
}

import { Request, Response } from "express";

import { NotificationService } from "../service";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async getNotifications(req: Request, res: Response) {
    const userId = req.user.userId;

    const notifications =
      await this.notificationService.getNotificationsByUser(userId);

    res.status(200).json(notifications);
  }
}

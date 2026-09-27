import { Router } from "express";

import { authenticate } from "../../../middleware";

import { NotificationController } from "../controller";
import { NotificationRepository } from "../repository";
import { NotificationService } from "../service";
import { NotificationParams } from "../types";

export const notificationRouter = Router();

const notificationRepository = new NotificationRepository();

const notificationService = new NotificationService(notificationRepository);

const notificationController = new NotificationController(notificationService);

notificationRouter.get(
  "/",
  authenticate,
  notificationController.getNotifications.bind(notificationController),
);

notificationRouter.patch<NotificationParams>(
  "/notifications/:notificationId/read",
  authenticate,
  notificationController.updateNotificationReadStatus.bind(
    notificationController,
  ),
);

export default notificationRouter;

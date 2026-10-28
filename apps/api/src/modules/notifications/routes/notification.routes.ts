import { Router } from 'express';

import { authenticate, validateParams } from '../../../middleware';

import { NotificationController } from '../controller';
import { NotificationRepository } from '../repository';
import { NotificationService } from '../service';
import { notificationParamsSchema } from '../schema';
import { NotificationParams } from '../types';

export const notificationRouter = Router();

const notificationRepository = new NotificationRepository();

const notificationService = new NotificationService(notificationRepository);

const notificationController = new NotificationController(notificationService);

notificationRouter.get(
  '/',
  authenticate,
  notificationController.getNotifications.bind(notificationController)
);

notificationRouter.patch<NotificationParams>(
  '/:notificationId/read',
  authenticate,
  validateParams(notificationParamsSchema),
  notificationController.updateNotificationReadStatus.bind(notificationController)
);

export default notificationRouter;

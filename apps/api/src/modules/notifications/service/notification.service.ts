import { NotificationRepository } from "../repository";

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getNotificationsByUser(userId: string) {
    return this.notificationRepository.getNotificationsByUser(userId);
  }
}

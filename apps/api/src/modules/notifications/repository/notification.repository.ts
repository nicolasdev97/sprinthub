import { prisma } from "../../../database/prisma";

export class NotificationRepository {
  async getNotificationsByUser(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

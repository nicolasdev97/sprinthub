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

  async getNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: {
        id,
      },
    });
  }

  async updateNotificationReadStatus(id: string) {
    return prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }
}

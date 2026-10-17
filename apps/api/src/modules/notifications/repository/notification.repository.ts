import { prisma } from "../../../database/prisma";

export class NotificationRepository {
  async createNotification(userId: string, title: string, message: string) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  }

  async createManyNotifications(
    userIds: string[],
    title: string,
    message: string,
  ) {
    if (userIds.length === 0) {
      return { count: 0 };
    }

    return prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        message,
      })),
    });
  }

  async getNotificationById(id: string) {
    return prisma.notification.findUnique({
      where: {
        id,
      },
    });
  }

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

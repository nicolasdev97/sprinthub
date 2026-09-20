import { prisma } from "../../../database/prisma";

import { UpdateUserDto } from "../dto";

export class UserRepository {
  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}

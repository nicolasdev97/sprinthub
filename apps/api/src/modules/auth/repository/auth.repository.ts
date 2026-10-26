import { prisma } from "../../../database/prisma";

import { CreateUserDto } from "../dto";

export class AuthRepository {
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser(data: CreateUserDto) {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({
      data,
    });
  }

  async getRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
      },
    });
  }

  async deleteRefreshToken(id: string) {
    return prisma.refreshToken.delete({
      where: {
        id,
      },
    });
  }
}

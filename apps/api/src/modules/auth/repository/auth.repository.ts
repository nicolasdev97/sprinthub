import { prisma } from "../../../database/prisma";

import { RegisterDto } from "../dto";

export class AuthRepository {
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async createUser(data: RegisterDto) {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.password,
        isActive: true,
      },
    });
  }
}

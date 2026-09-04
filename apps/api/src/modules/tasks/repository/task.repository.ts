import { prisma } from "../../../database/prisma";

import { CreateTaskDto, UpdateTaskDto } from "../dto";

export class TaskRepository {
  async findMany(projectId: string) {
    return prisma.task.findMany({
      where: {
        projectId,
      },
    });
  }

  async findById(id: string) {
    return prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        assignee: true,
      },
    });
  }

  async create(data: CreateTaskDto) {
    return prisma.task.create({
      data,
    });
  }

  async update(id: string, data: UpdateTaskDto) {
    return prisma.task.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.task.delete({
      where: {
        id,
      },
    });
  }
}

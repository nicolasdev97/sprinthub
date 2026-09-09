import { prisma } from "../../../database/prisma";

import { CreateTaskDto, UpdateTaskDto } from "../dto";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { TaskFilterParams } from "../types";

export class TaskRepository {
  async createTask(data: CreateTaskDto) {
    return prisma.task.create({
      data,
    });
  }

  async getTasks(projectId: string, filters?: TaskFilterParams) {
    return prisma.task.findMany({
      where: {
        projectId,
        status: filters?.status,
        priority: filters?.priority,
        assigneeId: filters?.assigneeId,
        ...(filters?.dueDate && {
          dueDate: {
            equals: new Date(filters.dueDate),
          },
        }),
        ...(filters?.search && {
          title: {
            contains: filters.search,
            mode: "insensitive",
          },
        }),
      },
      orderBy: filters?.sortBy
        ? {
            [filters.sortBy]: filters.sortOrder ?? "asc",
          }
        : undefined,
    });
  }

  async getTaskById(id: string) {
    return prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        assignee: true,
      },
    });
  }

  async updateTask(id: string, data: UpdateTaskDto) {
    return prisma.task.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteTask(id: string) {
    return prisma.task.delete({
      where: {
        id,
      },
    });
  }

  async assignTask(taskId: string, assigneeId: string) {
    return prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        assigneeId,
      },
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    completedAt: Date | null,
  ) {
    return prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
        completedAt,
      },
    });
  }

  async updateTaskPriority(taskId: string, priority: TaskPriority) {
    return prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        priority,
      },
    });
  }
}

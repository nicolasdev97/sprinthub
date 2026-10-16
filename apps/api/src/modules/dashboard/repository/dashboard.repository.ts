import { TaskStatus } from "@prisma/client";

import { prisma } from "../../../database/prisma";
import { WorkspaceDashboardDto } from "../dto";

export class DashboardRepository {
  async getWorkspaceDashboard(
    workspaceId: string,
  ): Promise<WorkspaceDashboardDto> {
    const now = new Date();

    const [activeProjects, pendingTasks, completedTasks, overdueTasks] =
      await Promise.all([
        prisma.project.count({
          where: {
            workspaceId,
            status: "ACTIVE",
            archived: false,
          },
        }),
        prisma.task.count({
          where: {
            project: {
              workspaceId,
            },
            status: {
              in: [
                TaskStatus.BACKLOG,
                TaskStatus.TODO,
                TaskStatus.IN_PROGRESS,
                TaskStatus.REVIEW,
              ],
            },
          },
        }),
        prisma.task.count({
          where: {
            project: {
              workspaceId,
            },
            status: TaskStatus.DONE,
          },
        }),
        prisma.task.count({
          where: {
            project: {
              workspaceId,
            },
            status: {
              not: TaskStatus.DONE,
            },
            dueDate: {
              lt: now,
            },
          },
        }),
      ]);

    return {
      activeProjects,
      pendingTasks,
      completedTasks,
      overdueTasks,
    };
  }
}


import { WorkspaceRole } from "@prisma/client";

import { prisma } from "../../../database/prisma";

import { CreateWorkspaceDto } from "../dto";

export class WorkspaceRepository {
  async createWorkspace(data: CreateWorkspaceDto, ownerId: string) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          ownerId,
          name: data.name,
          description: "",
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerId,
          role: WorkspaceRole.OWNER,
          joinedAt: new Date(),
        },
      });

      return workspace;
    });
  }

  async findUserWorkspaces(userId: string) {
    return prisma.workspaceMember.findMany({
      where: {
        userId,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        joinedAt: "asc",
      },
    });
  }
}

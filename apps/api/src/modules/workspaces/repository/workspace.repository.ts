import { WorkspaceRole } from "@prisma/client";

import { prisma } from "../../../database/prisma";

import { CreateWorkspaceDto } from "../dto";
import { UpdateWorkspaceDto } from "../dto";

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

  async getWorkspaces(userId: string) {
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

  async getWorkspaceById(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
      include: {
        workspace: true,
      },
    });
  }

  async getWorkspaceByName(name: string) {
    return prisma.workspace.findFirst({
      where: {
        name,
      },
    });
  }

  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceDto) {
    return prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data,
    });
  }

  async deleteWorkspace(workspaceId: string) {
    return prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  }

  async addWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ) {
    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
        joinedAt: new Date(),
      },
    });
  }

  async getWorkspaceMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });
  }

  async getWorkspaceMemberById(workspaceId: string, memberId: string) {
    return prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });
  }

  async getWorkspaceMemberByUser(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
  }

  async updateWorkspaceMemberRole(memberId: string, role: WorkspaceRole) {
    return prisma.workspaceMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    });
  }

  async deleteWorkspaceMember(memberId: string) {
    return prisma.workspaceMember.delete({
      where: {
        id: memberId,
      },
    });
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}

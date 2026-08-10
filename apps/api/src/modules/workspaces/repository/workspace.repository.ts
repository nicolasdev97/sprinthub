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

  async findWorkspaceById(workspaceId: string, userId: string) {
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

  async findWorkspaceMember(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findWorkspaceMemberByUser(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });
  }

  async createWorkspaceMember(
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
}

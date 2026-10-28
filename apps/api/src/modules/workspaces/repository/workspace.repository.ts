import { WorkspaceRole } from '@prisma/client';

import { prisma } from '../../../database/prisma';

import { WorkspaceFilterParams } from '../types';

import { CreateWorkspaceDto } from '../dto';
import { UpdateWorkspaceDto } from '../dto';

export class WorkspaceRepository {
  async createWorkspace(data: CreateWorkspaceDto, ownerId: string) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          ownerId,
          name: data.name,
          description: data.description ?? null,
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

  async getWorkspaces(userId: string, filters?: WorkspaceFilterParams) {
    return prisma.workspaceMember.findMany({
      where: {
        userId,
        ...(filters?.search && {
          workspace: {
            name: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        workspace: true,
      },
      orderBy: filters?.sortBy
        ? {
            workspace: {
              [filters.sortBy]: filters.sortOrder ?? 'asc',
            },
          }
        : {
            joinedAt: 'asc',
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

  async getWorkspaceEntityById(workspaceId: string) {
    return prisma.workspace.findUnique({
      where: {
        id: workspaceId,
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

  async addWorkspaceMember(workspaceId: string, userId: string, role: WorkspaceRole) {
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
        joinedAt: 'asc',
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

  async deleteWorkspaceMember(memberId: string, workspaceId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: {
          assigneeId: userId,
          project: {
            workspaceId,
          },
        },
        data: {
          assigneeId: null,
        },
      });

      return tx.workspaceMember.delete({
        where: {
          id: memberId,
        },
      });
    });
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async transferWorkspaceOwnership(
    workspaceId: string,
    currentOwnerUserId: string,
    newOwnerUserId: string
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Update workspace ownerId
      const updatedWorkspace = await tx.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: newOwnerUserId },
      });

      // 2. Update new owner's member role to OWNER
      await tx.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: newOwnerUserId,
          },
        },
        data: { role: WorkspaceRole.OWNER },
      });

      // 3. Update previous owner's member role to ADMIN
      await tx.workspaceMember.update({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: currentOwnerUserId,
          },
        },
        data: { role: WorkspaceRole.ADMIN },
      });

      return updatedWorkspace;
    });
  }
}

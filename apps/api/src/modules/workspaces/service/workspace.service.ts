import { AppError } from "../../../shared/errors";

import { WorkspaceRole } from "@prisma/client";

import { CreateWorkspaceDto, UpdateWorkspaceDto } from "../dto";
import { WorkspaceRepository } from "../repository";

export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async createWorkspace(data: CreateWorkspaceDto, ownerId: string) {
    return this.workspaceRepository.createWorkspace(data, ownerId);
  }

  async getUserWorkspaces(userId: string) {
    const workspaceMembers =
      await this.workspaceRepository.findUserWorkspaces(userId);

    return workspaceMembers.map((workspaceMember) => workspaceMember.workspace);
  }

  async getWorkspaceById(workspaceId: string, userId: string) {
    const workspaceMember = await this.workspaceRepository.findWorkspaceById(
      workspaceId,
      userId,
    );

    if (!workspaceMember) {
      throw new AppError("Workspace not found", 404);
    }

    return workspaceMember.workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    data: UpdateWorkspaceDto,
  ) {
    const workspaceMember = await this.workspaceRepository.findWorkspaceMember(
      workspaceId,
      userId,
    );

    if (!workspaceMember) {
      throw new AppError("Workspace not found", 404);
    }

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    return this.workspaceRepository.updateWorkspace(workspaceId, data);
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspaceMember = await this.workspaceRepository.findWorkspaceMember(
      workspaceId,
      userId,
    );

    if (!workspaceMember) {
      throw new AppError("Workspace not found", 404);
    }

    if (workspaceMember.role !== WorkspaceRole.OWNER) {
      throw new AppError("Forbidden", 403);
    }

    await this.workspaceRepository.deleteWorkspace(workspaceId);
  }
}

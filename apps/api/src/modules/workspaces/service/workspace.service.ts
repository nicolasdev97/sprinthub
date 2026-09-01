import { AppError } from "../../../shared/errors";

import { WorkspaceRole } from "@prisma/client";

import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddWorkspaceMemberDto,
} from "../dto";
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

  async addWorkspaceMember(
    workspaceId: string,
    userId: string,
    data: AddWorkspaceMemberDto,
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

    // Regla de negocio
    if (data.role === WorkspaceRole.OWNER) {
      throw new AppError("Owner role cannot be assigned", 400);
    }

    const memberUser = await this.workspaceRepository.findUserByEmail(
      data.email,
    );

    if (!memberUser) {
      throw new AppError("User not found", 404);
    }

    const existingMember =
      await this.workspaceRepository.findWorkspaceMemberByUser(
        workspaceId,
        memberUser.id,
      );

    if (existingMember) {
      throw new AppError("User is already a workspace member", 409);
    }

    return this.workspaceRepository.createWorkspaceMember(
      workspaceId,
      memberUser.id,
      data.role,
    );
  }

  async getWorkspaceMembers(workspaceId: string, userId: string) {
    const workspaceMember = await this.workspaceRepository.findWorkspaceMember(
      workspaceId,
      userId,
    );

    if (!workspaceMember) {
      throw new AppError("Workspace not found", 404);
    }

    return this.workspaceRepository.findWorkspaceMembers(workspaceId);
  }

  async updateWorkspaceMemberRole(
    workspaceId: string,
    memberId: string,
    userId: string,
    role: WorkspaceRole,
  ) {
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

    const member = await this.workspaceRepository.findWorkspaceMemberById(
      workspaceId,
      memberId,
    );

    if (!member) {
      throw new AppError("Workspace member not found", 404);
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new AppError("Cannot update workspace owner", 403);
    }

    return this.workspaceRepository.updateWorkspaceMemberRole(memberId, role);
  }
}

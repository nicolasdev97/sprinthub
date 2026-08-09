import { AppError } from "../../../shared/errors";

import { CreateWorkspaceDto } from "../dto";
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
}

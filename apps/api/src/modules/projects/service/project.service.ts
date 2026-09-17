import { WorkspaceRole } from "@prisma/client";

import { AppError } from "../../../shared/errors";
import { CreateProjectDto, UpdateProjectDto } from "../dto";
import { ProjectRepository } from "../repository";
import { WorkspaceService } from "../../workspaces/service";
import { ProjectFilterParams } from "../types";

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async createProject(data: CreateProjectDto, userId: string) {
    const workspaceMember =
      await this.workspaceService.getWorkspaceMemberByUser(
        data.workspaceId,
        userId,
      );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    const existingProject = await this.projectRepository.getProjectByName(
      data.workspaceId,
      data.name,
    );

    if (existingProject) {
      throw new AppError("Project name already exists in this workspace", 409);
    }

    return this.projectRepository.createProject(data);
  }

  async getProjects(
    workspaceId: string,
    userId: string,
    filters?: ProjectFilterParams,
  ) {
    console.log("FILTERS IN SERVICE:", filters);

    await this.workspaceService.getWorkspaceMemberByUser(workspaceId, userId);

    return this.projectRepository.getProjects(workspaceId, filters);
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMemberByUser(
      project.workspaceId,
      userId,
    );

    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectDto,
  ) {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember =
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        userId,
      );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    if (data.name) {
      const existingProject = await this.projectRepository.getProjectByName(
        project.workspaceId,
        data.name,
      );

      if (existingProject && existingProject.id !== projectId) {
        throw new AppError(
          "Project name already exists in this workspace",
          409,
        );
      }
    }

    return this.projectRepository.updateProject(projectId, data);
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember =
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        userId,
      );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    await this.projectRepository.deleteProject(projectId);
  }

  async archiveProject(projectId: string, userId: string) {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember =
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        userId,
      );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    return this.projectRepository.archiveProject(projectId);
  }

  async unarchiveProject(projectId: string, userId: string) {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember =
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        userId,
      );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    return this.projectRepository.unarchiveProject(projectId);
  }
}

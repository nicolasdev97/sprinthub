import { WorkspaceRole } from "@prisma/client";

import { AppError } from "../../../shared/errors";
import { CreateProjectDto, UpdateProjectDto } from "../dto";
import { ProjectRepository } from "../repository";
import { WorkspaceService } from "../../workspaces/service";

export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async getProjects(workspaceId: string, userId: string) {
    await this.workspaceService.getWorkspaceMember(workspaceId, userId);

    return this.projectRepository.findMany(workspaceId);
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMember(project.workspaceId, userId);

    return project;
  }

  async createProject(data: CreateProjectDto, userId: string) {
    const workspaceMember = await this.workspaceService.getWorkspaceMember(
      data.workspaceId,
      userId,
    );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    const existingProject = await this.projectRepository.findByName(
      data.workspaceId,
      data.name,
    );

    if (existingProject) {
      throw new AppError("Project name already exists in this workspace", 409);
    }

    return this.projectRepository.create(data);
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectDto,
  ) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember = await this.workspaceService.getWorkspaceMember(
      project.workspaceId,
      userId,
    );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    return this.projectRepository.update(projectId, data);
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember = await this.workspaceService.getWorkspaceMember(
      project.workspaceId,
      userId,
    );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError("Forbidden", 403);
    }

    await this.projectRepository.delete(projectId);
  }

  async archiveProject(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember = await this.workspaceService.getWorkspaceMember(
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
}

import { Request, Response } from "express";

import { ProjectParams, WorkspaceProjectParams } from "../types";

import { CreateProjectDto, UpdateProjectDto } from "../dto";
import { ProjectService } from "../service";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  async getProjects(req: Request<WorkspaceProjectParams>, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const projects = await this.projectService.getProjects(workspaceId, userId);

    res.status(200).json(projects);
  }

  async createProject(
    req: Request<
      WorkspaceProjectParams,
      unknown,
      Omit<CreateProjectDto, "workspaceId">
    >,
    res: Response,
  ) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const data: CreateProjectDto = {
      workspaceId,
      ...req.body,
    };

    const project = await this.projectService.createProject(data, userId);

    res.status(201).json(project);
  }

  async getProjectById(req: Request<ProjectParams>, res: Response) {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await this.projectService.getProjectById(projectId, userId);

    res.status(200).json(project);
  }

  async updateProject(
    req: Request<ProjectParams, unknown, UpdateProjectDto>,
    res: Response,
  ) {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await this.projectService.updateProject(
      projectId,
      userId,
      req.body,
    );

    res.status(200).json(project);
  }

  async deleteProject(req: Request<ProjectParams>, res: Response) {
    const { projectId } = req.params;
    const userId = req.user.userId;

    await this.projectService.deleteProject(projectId, userId);

    res.status(204).send();
  }

  async archiveProject(req: Request<ProjectParams>, res: Response) {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await this.projectService.archiveProject(projectId, userId);

    res.status(200).json(project);
  }
}

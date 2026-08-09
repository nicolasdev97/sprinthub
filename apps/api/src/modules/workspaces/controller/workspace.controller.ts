import { Request, Response } from "express";

import { WorkspaceParams } from "../types";

import { CreateWorkspaceDto, UpdateWorkspaceDto } from "../dto";
import { WorkspaceService } from "../service";

export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  async createWorkspace(req: Request, res: Response) {
    const data = req.body as CreateWorkspaceDto;
    const ownerId = req.user!.userId;

    const workspace = await this.workspaceService.createWorkspace(
      data,
      ownerId,
    );

    res.status(201).json(workspace);
  }

  async getUserWorkspaces(req: Request, res: Response) {
    const userId = req.user!.userId;

    const workspaces = await this.workspaceService.getUserWorkspaces(userId);

    res.status(200).json(workspaces);
  }

  async getWorkspaceById(req: Request<WorkspaceParams>, res: Response) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspace = await this.workspaceService.getWorkspaceById(
      workspaceId,
      userId,
    );

    res.status(200).json(workspace);
  }

  async updateWorkspace(
    req: Request<WorkspaceParams, unknown, UpdateWorkspaceDto>,
    res: Response,
  ) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const workspace = await this.workspaceService.updateWorkspace(
      workspaceId,
      userId,
      req.body,
    );

    res.status(200).json(workspace);
  }
}

import { Request, Response } from "express";

import { CreateWorkspaceDto } from "../dto";
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

    const workspaces = await this.workspaceService.findUserWorkspaces(userId);

    res.status(200).json(workspaces);
  }
}

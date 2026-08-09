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
}

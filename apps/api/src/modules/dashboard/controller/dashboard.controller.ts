import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { DashboardService } from "../service";

export interface WorkspaceDashboardParams extends ParamsDictionary {
  workspaceId: string;
}

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async getWorkspaceDashboard(
    req: Request<WorkspaceDashboardParams>,
    res: Response,
  ) {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    const dashboard = await this.dashboardService.getWorkspaceDashboard(
      workspaceId,
      userId,
    );

    res.status(200).json(dashboard);
  }
}


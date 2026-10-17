import { Request, Response } from "express";

import { DashboardService } from "../service";
import { WorkspaceDashboardParams } from "../types";

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


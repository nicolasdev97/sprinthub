import { WorkspaceService } from "../../workspaces/service";
import { DashboardRepository } from "../repository";
import { WorkspaceDashboardDto } from "../dto";

export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async getWorkspaceDashboard(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceDashboardDto> {
    await this.workspaceService.getWorkspaceMemberByUser(workspaceId, userId);

    return this.dashboardRepository.getWorkspaceDashboard(workspaceId);
  }
}


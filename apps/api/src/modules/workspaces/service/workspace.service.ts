import { CreateWorkspaceDto } from "../dto";
import { WorkspaceRepository } from "../repository";

export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async createWorkspace(data: CreateWorkspaceDto, ownerId: string) {
    return this.workspaceRepository.createWorkspace(data, ownerId);
  }
}

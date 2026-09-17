import { ProjectStatus } from "@prisma/client";

export interface CreateProjectDto {
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
}

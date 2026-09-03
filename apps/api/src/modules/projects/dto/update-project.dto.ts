import { ProjectStatus } from "@prisma/client";

export interface UpdateProjectDto {
  name?: string;
  status?: ProjectStatus;
}

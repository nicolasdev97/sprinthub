import { ProjectStatus } from '@prisma/client';

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
}

import { ProjectStatus } from "@prisma/client";

export interface ProjectFilterParams {
  status?: ProjectStatus;
  archived?: boolean;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
  search?: string;
}

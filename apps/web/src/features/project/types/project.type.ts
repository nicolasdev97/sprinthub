export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  status: ProjectStatus;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  status: ProjectStatus;
}

export interface UpdateProjectRequest {
  name?: string;
  status?: ProjectStatus;
}

export interface ProjectQueryParams {
  search?: string;
  status?: ProjectStatus;
  archived?: boolean;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

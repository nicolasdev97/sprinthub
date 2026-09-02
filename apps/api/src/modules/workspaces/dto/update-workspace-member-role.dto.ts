import { WorkspaceRole } from "@prisma/client";

export interface UpdateWorkspaceMemberRoleDto {
  role: WorkspaceRole;
}

import { WorkspaceRole } from "@prisma/client";

export interface AddWorkspaceMemberDto {
  email: string;
  role: WorkspaceRole;
}

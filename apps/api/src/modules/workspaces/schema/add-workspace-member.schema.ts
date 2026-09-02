import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";

export const addWorkspaceMemberSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),

  role: z.enum([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]),
});

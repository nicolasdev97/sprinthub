import { z } from "zod";

export const updateWorkspaceMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

import { z } from "zod";

export const workspaceParamsSchema = z.object({
  workspaceId: z.uuid("Invalid workspace ID"),
});

export const workspaceMemberParamsSchema = z.object({
  workspaceId: z.uuid("Invalid workspace ID"),
  memberId: z.uuid("Invalid member ID"),
});


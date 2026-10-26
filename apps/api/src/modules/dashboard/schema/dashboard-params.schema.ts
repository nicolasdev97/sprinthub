import { z } from "zod";

export const workspaceDashboardParamsSchema = z.object({
  workspaceId: z.uuid("Invalid workspace ID"),
});


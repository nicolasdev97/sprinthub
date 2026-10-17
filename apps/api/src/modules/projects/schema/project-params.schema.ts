import { z } from "zod";

export const workspaceProjectParamsSchema = z.object({
  workspaceId: z.uuid("Invalid workspace ID"),
});

export const projectParamsSchema = z.object({
  projectId: z.uuid("Invalid project ID"),
});


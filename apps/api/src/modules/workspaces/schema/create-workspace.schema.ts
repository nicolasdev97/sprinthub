import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Workspace description must not exceed 500 characters")
    .optional(),
});

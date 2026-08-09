import { z } from "zod";

export const updateWorkspaceSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field is required",
  });

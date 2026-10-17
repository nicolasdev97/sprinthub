import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z
    .string()
    .trim()
    .max(1000, "Project description must not exceed 1000 characters")
    .nullable()
    .optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]),
});

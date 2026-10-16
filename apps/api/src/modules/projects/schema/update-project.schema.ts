import { z } from "zod";

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1, "Project name is required").optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Project description must not exceed 1000 characters")
      .optional(),
    status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    {
      message: "At least one field is required",
    },
  );

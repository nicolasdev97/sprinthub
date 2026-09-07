import { z } from "zod";

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Task title is required").optional(),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    dueDate: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.priority !== undefined ||
      data.dueDate !== undefined,
    {
      message: "At least one field is required",
    },
  );

import { z } from "zod";

export const taskFilterSchema = z.object({
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"])
    .optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),

  assigneeId: z.uuid().optional(),

  dueDate: z.string().datetime().optional(),
});

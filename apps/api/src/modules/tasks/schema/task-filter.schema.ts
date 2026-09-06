import { z } from "zod";

export const taskFilterSchema = z.object({
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"])
    .optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),

  assigneeId: z.uuid().optional(),

  dueDate: z.string().optional(),

  sortBy: z.enum(["createdAt", "dueDate", "priority"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),
});

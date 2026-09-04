import { z } from "zod";

export const updateTaskStatusSchema = z.object({
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
});

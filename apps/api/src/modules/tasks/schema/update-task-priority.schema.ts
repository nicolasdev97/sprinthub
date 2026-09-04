import { z } from "zod";

export const updateTaskPrioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

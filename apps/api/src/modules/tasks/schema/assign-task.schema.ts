import { z } from "zod";

export const assignTaskSchema = z.object({
  assigneeId: z.uuid(),
});

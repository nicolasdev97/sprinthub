import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]),
});

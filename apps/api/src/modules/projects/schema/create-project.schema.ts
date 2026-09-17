import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().min(1, "Project description is required"),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]),
});

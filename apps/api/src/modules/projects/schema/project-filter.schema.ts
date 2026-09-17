import { z } from "zod";

export const projectFilterSchema = z.object({
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]).optional(),

  archived: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sortBy: z.enum(["name", "createdAt"]).optional(),

  sortOrder: z.enum(["asc", "desc"]).optional(),

  search: z.string().optional(),
});

import { z } from "zod";

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),

    lastName: z.string().trim().min(1, "Last name is required"),
  })
  .partial()
  .refine(
    (data) => data.firstName !== undefined || data.lastName !== undefined,
    {
      message: "At least one field is required",
    },
  );

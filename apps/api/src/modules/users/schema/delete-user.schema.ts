import { z } from "zod";

export const deleteUserSchema = z.object({
  confirmationName: z.string().trim().min(1, "Confirmation name is required"),
});

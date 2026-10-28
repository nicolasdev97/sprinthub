import { z } from 'zod';

export const updateWorkspaceSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Workspace description must not exceed 500 characters')
      .nullable()
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'At least one field is required',
  });

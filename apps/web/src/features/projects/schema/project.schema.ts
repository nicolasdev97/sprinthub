import { z } from 'zod';

export const createProjectSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace is required'),
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Project description must not exceed 1000 characters')
    .optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED']),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(100, 'Project name must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Project description must not exceed 1000 characters')
    .optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED']),
});

export const createDeleteProjectConfirmSchema = (projectName: string) =>
  z.object({
    confirmationName: z
      .string()
      .trim()
      .refine((value) => value === projectName, {
        message: `Please type "${projectName}" to confirm deletion`,
      }),
  });

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
export type DeleteProjectConfirmFormValues = {
  confirmationName: string;
};

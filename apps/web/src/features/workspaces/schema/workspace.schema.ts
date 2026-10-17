import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Workspace description must not exceed 500 characters')
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Workspace description must not exceed 500 characters')
    .optional(),
});

export const addWorkspaceMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const createDeleteWorkspaceConfirmSchema = (workspaceName: string) =>
  z.object({
    confirmationName: z
      .string()
      .trim()
      .refine((value) => value === workspaceName, {
        message: `Please type "${workspaceName}" to confirm deletion`,
      }),
  });

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceFormValues = z.infer<typeof updateWorkspaceSchema>;
export type AddWorkspaceMemberFormValues = z.infer<typeof addWorkspaceMemberSchema>;
export type DeleteWorkspaceConfirmFormValues = {
  confirmationName: string;
};


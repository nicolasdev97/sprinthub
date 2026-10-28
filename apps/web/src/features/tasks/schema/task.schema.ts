import { z } from 'zod';

export const taskStatusEnum = z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Task title must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Task description must not exceed 2000 characters')
    .optional(),
  priority: taskPriorityEnum,
  status: taskStatusEnum,
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Task title must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Task description must not exceed 2000 characters')
    .optional(),
  dueDate: z.string().optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

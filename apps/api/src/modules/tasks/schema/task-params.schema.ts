import { z } from 'zod';

export const projectTaskParamsSchema = z.object({
  projectId: z.uuid('Invalid project ID'),
});

export const taskParamsSchema = z.object({
  taskId: z.uuid('Invalid task ID'),
});

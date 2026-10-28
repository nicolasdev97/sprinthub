import { z } from 'zod';

export const archiveProjectSchema = z.object({
  archived: z.boolean(),
});

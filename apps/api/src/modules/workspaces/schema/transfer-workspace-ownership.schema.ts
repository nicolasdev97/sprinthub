import { z } from 'zod';

export const transferWorkspaceOwnershipSchema = z.object({
  newOwnerId: z.string().uuid('Invalid new owner ID'),
});

export type TransferWorkspaceOwnershipDto = z.infer<typeof transferWorkspaceOwnershipSchema>;

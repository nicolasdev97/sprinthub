import { z } from 'zod';

export function createDeleteUserConfirmSchema(expectedFullName: string) {
  return z.object({
    confirmationName: z
      .string()
      .trim()
      .min(1, 'Please enter your full name')
      .refine((val) => val === expectedFullName, {
        message: `Must match "${expectedFullName}" exactly`,
      }),
  });
}

export type DeleteUserConfirmFormValues = {
  confirmationName: string;
};


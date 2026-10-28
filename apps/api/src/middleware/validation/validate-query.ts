import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

import { validateRequest } from './validate-request';

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    validateRequest({ query: schema })(req, res, next);
  };
}

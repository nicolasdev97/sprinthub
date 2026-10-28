import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

import { validateRequest } from './validate-request';

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    validateRequest({ params: schema })(req, res, next);
  };
}

import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

import { validateRequest } from './validate-request';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    validateRequest({ body: schema })(req, res, next);
  };
}

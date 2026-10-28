import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';

import { AppError } from '../../shared';

export interface RequestValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Enforces strict parsing on ZodObject schemas to reject unrecognized fields
 * (Defense against mass-assignment and parameter tampering attacks).
 */
export function ensureStrictSchema<T extends ZodSchema>(schema: T): T {
  if (schema instanceof z.ZodObject) {
    return schema.strict() as unknown as T;
  }
  return schema;
}

/**
 * Generic request validation middleware for body, query, and params.
 * Parses and replaces request inputs with sanitized/typed data and assigns req.validatedData.
 */
export function validateRequest(schemas: RequestValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const validated: { body?: unknown; query?: unknown; params?: unknown } = {};

    if (schemas.params) {
      const strictParams = ensureStrictSchema(schemas.params);
      const result = strictParams.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors.push(path ? `params.${path}: ${issue.message}` : `params: ${issue.message}`);
        });
      } else {
        if (result.data && typeof result.data === 'object') {
          Object.assign(req.params, result.data);
        }
        validated.params = result.data;
      }
    }

    if (schemas.query) {
      const strictQuery = ensureStrictSchema(schemas.query);
      const result = strictQuery.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors.push(path ? `query.${path}: ${issue.message}` : `query: ${issue.message}`);
        });
      } else {
        if (result.data && typeof result.data === 'object') {
          Object.assign(req.query, result.data);
        }
        req.validatedQuery = result.data;
        validated.query = result.data;
      }
    }

    if (schemas.body) {
      const strictBody = ensureStrictSchema(schemas.body);
      const result = strictBody.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors.push(path ? `body.${path}: ${issue.message}` : `body: ${issue.message}`);
        });
      } else {
        req.body = result.data;
        validated.body = result.data;
      }
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(', '), 400);
    }

    req.validatedData = validated;
    next();
  };
}

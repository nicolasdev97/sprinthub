import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

import { AppError } from "../../shared/errors";

export function validateQuery(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");

      throw new AppError(message, 400);
    }

    request.validatedQuery = result.data;

    next();
  };
}

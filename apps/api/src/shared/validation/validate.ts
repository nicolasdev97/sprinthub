import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

import { AppError } from "../errors";

export function validate(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");

      throw new AppError(message, 400);
    }

    request.body = result.data;

    next();
  };
}

import { NextFunction, Request, Response } from "express";

import { AppError } from "./AppError";

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
): Response {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return response.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}

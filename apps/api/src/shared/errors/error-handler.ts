import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

import { AppError } from './app-error';
import { logger } from '../logger';

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): Response {
  if (error instanceof AppError || (error as AppError).isOperational || error.name === 'AppError') {
    const statusCode = (error as AppError).statusCode || 400;
    return response.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(', ')
      : (error.meta?.target as string) || 'field';
    return response.status(409).json({
      success: false,
      message: `A record with this ${target} already exists`,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2023') {
    return response.status(400).json({
      success: false,
      message: 'Invalid identifier format',
    });
  }

  logger.error(`Internal server error: ${error.message}${error.stack ? `\n${error.stack}` : ''}`);

  return response.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}

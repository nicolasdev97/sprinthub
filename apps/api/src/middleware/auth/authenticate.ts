import { NextFunction, Request, Response } from 'express';

import { AppError, verifyToken } from '../../shared';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token =
    req.headers.authorization?.replace('Bearer ', '') ||
    (typeof req.query.token === 'string' ? req.query.token : undefined);

  if (!token) {
    throw new AppError('Authentication token not provided', 401);
  }

  const payload = verifyToken(token);

  req.user = payload;

  next();
}

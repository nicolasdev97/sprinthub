import { NextFunction, Request, Response } from "express";

import { AppError } from "../../shared/errors";
import { verifyToken } from "../../shared/utils";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError("Authentication token not provided", 401);
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Invalid authentication token", 401);
  }

  const payload = verifyToken(token);

  req.user = payload;

  next();
}

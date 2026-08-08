import { NextFunction, Request, Response } from "express";

import { AppError } from "../../shared/errors";
import { verifyToken } from "../../shared/utils";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token =
    req.cookies.accessToken ??
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new AppError("Authentication token not provided", 401);
  }

  const payload = verifyToken(token);

  req.user = payload;

  next();
}

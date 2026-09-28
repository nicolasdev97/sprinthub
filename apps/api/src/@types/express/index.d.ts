import { JwtPayload } from "../../shared";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      validatedQuery?: unknown;
    }
  }
}

export {};

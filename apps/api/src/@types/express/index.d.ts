import { JwtPayload } from "../../shared/utils";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      validatedQuery?: unknown;
    }
  }
}

export {};

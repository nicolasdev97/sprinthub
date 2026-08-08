import jwt, { JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
}

export function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1h",
  });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = jwt.verify(token, secret) as JsonWebTokenPayload;

  return {
    userId: payload.userId as string,
  };
}

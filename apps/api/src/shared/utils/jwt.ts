import jwt from "jsonwebtoken";

interface JwtPayload {
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

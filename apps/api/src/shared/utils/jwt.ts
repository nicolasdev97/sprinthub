import jwt, { JwtPayload as JsonWebTokenPayload } from 'jsonwebtoken';

import { AppError } from '../errors';

export interface JwtPayload {
  userId: string;
}

export function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '15m',
  });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const payload = jwt.verify(token, secret) as JsonWebTokenPayload;

    return {
      userId: payload.userId as string,
    };
  } catch {
    throw new AppError('Invalid or expired access token', 401);
  }
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../../../src/shared/utils/jwt';
import { AppError } from '../../../../src/shared/errors';

describe('JWT Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret-key-12345' };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a JWT token with userId payload and 15m expiration', () => {
      const payload = { userId: 'usr-123' };
      const expectedToken = 'signed.jwt.token';

      const signSpy = vi.spyOn(jwt, 'sign').mockReturnValue(expectedToken as never);

      const token = generateToken(payload);

      expect(signSpy).toHaveBeenCalledWith(payload, 'test-secret-key-12345', {
        expiresIn: '15m',
      });
      expect(token).toBe(expectedToken);
    });

    it('should throw an error if JWT_SECRET is missing', () => {
      delete process.env.JWT_SECRET;

      expect(() => generateToken({ userId: 'usr-123' })).toThrow('JWT_SECRET is not defined');
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for a valid token', () => {
      const token = 'valid.jwt.token';
      const decodedPayload = { userId: 'usr-123', iat: 123456, exp: 999999 };

      const verifySpy = vi.spyOn(jwt, 'verify').mockReturnValue(decodedPayload as never);

      const result = verifyToken(token);

      expect(verifySpy).toHaveBeenCalledWith(token, 'test-secret-key-12345');
      expect(result).toEqual({ userId: 'usr-123' });
    });

    it('should throw AppError with 401 if token is expired or invalid', () => {
      const token = 'invalid.or.expired.token';

      vi.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => verifyToken(token)).toThrow(AppError);
      try {
        verifyToken(token);
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Invalid or expired access token');
      }
    });

    it('should throw an error if JWT_SECRET is missing', () => {
      delete process.env.JWT_SECRET;

      expect(() => verifyToken('any.token')).toThrow('JWT_SECRET is not defined');
    });
  });
});

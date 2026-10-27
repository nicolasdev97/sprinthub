import { Request } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * - 15-minute sliding window
 * - 100 requests/window for public endpoints, up to 300 requests/window for authenticated clients
 * - Automatically skips health check endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: (req: Request) => {
    const isAuthenticated = Boolean(req.headers?.authorization);
    return isAuthenticated ? 300 : 100;
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  skip: (req: Request) => req.path === '/api/health' || req.path === '/health',
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

/**
 * Strict Rate Limiter for Sensitive Auth Endpoints
 * - 15-minute window
 * - Strict limit of 10 requests per IP
 * - Applied on /auth/register, /auth/login, /auth/refresh to mitigate brute force & credential stuffing
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 10, // 10 attempts per 15 minutes
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

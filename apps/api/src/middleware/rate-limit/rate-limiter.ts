import { Request } from 'express';
import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Global API Rate Limiter
 * - In production: 15-minute sliding window, 100 reqs for public endpoints, 300 reqs for authenticated
 * - In development: relaxed limit (5,000 reqs) to accommodate React StrictMode and Fast Refresh
 * - Automatically skips health check endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: (req: Request) => {
    if (isDevelopment) {
      return 5000;
    }
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
 * Strict Rate Limiter for Sensitive Auth Endpoints (Login & Registration)
 * - In production: 15-minute window, strict limit of 10 requests per IP to mitigate brute force & credential stuffing
 * - In development: relaxed limit (500 attempts) to enable rapid iterative development and testing
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isDevelopment ? 500 : 10,
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

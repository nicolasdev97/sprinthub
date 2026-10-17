import { Request } from "express";
import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: (req: Request) => {
    // 300 req/min for authenticated endpoints, 100 req/min for public endpoints (ADS Section 23)
    const isAuthenticated = Boolean(req.headers?.authorization);
    return isAuthenticated ? 300 : 100;
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  skip: (req: Request) => req.path === "/api/health" || req.path === "/health",
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  limit: 20, // 20 requests per 15 minutes for sensitive auth endpoints
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});


import express from "express";
import cookieParser from "cookie-parser";

import {
  helmetMiddleware,
  corsMiddleware,
  compressionMiddleware,
  apiRateLimiter,
  sanitizeInputs,
} from "./middleware";
import { errorHandler, requestLogger } from "./shared";
import router from "./routes";

const app = express();

// Defend against server banner fingerprinting
app.disable("x-powered-by");

// Trust first proxy hop if running behind reverse proxy (e.g., Nginx, Traefik, AWS ALB)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --------------- Global Security & Infrastructure Middlewares ---------------

// HTTP Security Headers via Helmet (CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff)
app.use(helmetMiddleware);

// Strict CORS with credentials and environment-driven allowed origins
app.use(corsMiddleware);

// Smart payload compression (skips Server-Sent Events /api/events)
app.use(compressionMiddleware);

// HTTP Request logging
app.use(requestLogger);

// Body parsing with strict payload limits to mitigate Denial of Service (DoS) attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Secure Cookie parser
app.use(cookieParser());

// Deep input sanitization to strip script markup, null bytes, and normalize emails
app.use(sanitizeInputs);

// Global API Rate Limiter
app.use(apiRateLimiter);

// Application routes
app.use(router);

// Centralized error handler
app.use(errorHandler);

export default app;

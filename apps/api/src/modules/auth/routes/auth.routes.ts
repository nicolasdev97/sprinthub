import { Router } from "express";

import { validate, authRateLimiter } from "../../../middleware";

import { AuthController } from "../controller";
import { AuthRepository } from "../repository";
import { registerSchema, loginSchema } from "../schema";
import { AuthService } from "../service";

export const authRouter = Router();

const authRepository = new AuthRepository();

const authService = new AuthService(authRepository);

const authController = new AuthController(authService);

// Strict rate limiting applied to credential-based endpoints to prevent brute force & credential stuffing
authRouter.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register.bind(authController),
);

authRouter.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController),
);

// Token refresh uses cryptographic HttpOnly cookie verification; not subject to brute-force rate limiter
authRouter.post(
  "/refresh",
  authController.refresh.bind(authController),
);

authRouter.post("/logout", authController.logout.bind(authController));

export default authRouter;

import { Router } from "express";

import { validate } from "../../../shared/validation";
import { authenticate } from "../../../middleware";

import { AuthController } from "../controller";
import { AuthRepository } from "../repository";
import { registerSchema, loginSchema } from "../schema";
import { AuthService } from "../service";

export const authRouter = Router();

const authRepository = new AuthRepository();

const authService = new AuthService(authRepository);

const authController = new AuthController(authService);

authRouter.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController),
);

authRouter.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController),
);

authRouter.post("/logout", authController.logout);

authRouter.get("/me", authenticate, (req, res) => {
  return res.status(200).json(req.user);
});

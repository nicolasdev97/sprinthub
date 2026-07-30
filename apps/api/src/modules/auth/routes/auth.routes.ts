import { Router } from "express";

import { validate } from "../../../shared/validation";
import { AuthController } from "../controller";
import { AuthRepository } from "../repository";
import { registerSchema } from "../schema";
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

import { Router } from "express";

import { AuthController } from "../controller";
import { AuthRepository } from "../repository";
import { AuthService } from "../service";

export const authRouter = Router();

const authRepository = new AuthRepository();

const authService = new AuthService(authRepository);

const authController = new AuthController(authService);

void authController;

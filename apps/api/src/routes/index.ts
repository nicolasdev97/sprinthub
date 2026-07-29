import { Router } from "express";

import { healthController } from "./health.controller";
import { authRouter } from "../modules/auth";

const router = Router();

router.get("/health", healthController);

router.use("/auth", authRouter);

export default router;

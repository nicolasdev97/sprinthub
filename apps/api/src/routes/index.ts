import { Router } from "express";

import { healthController } from "./health.controller";
import { authRouter } from "../modules/auth";
import { workspaceRouter } from "../modules/workspaces/routes";

const router = Router();

router.get("/health", healthController);

router.use("/auth", authRouter);
router.use("/workspaces", workspaceRouter);

export default router;

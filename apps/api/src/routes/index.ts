import { Router } from "express";

import { healthController } from "./health.controller";
import { authRouter } from "../modules/auth";
import { workspaceRouter } from "../modules/workspaces/routes";
import { projectRouter } from "../modules/projects/routes";
import { taskRouter } from "../modules/tasks/routes";

const router = Router();

router.get("/health", healthController);

router.use("/auth", authRouter);
router.use("/workspaces", workspaceRouter);
router.use("/", projectRouter);
router.use("/", taskRouter);

export default router;

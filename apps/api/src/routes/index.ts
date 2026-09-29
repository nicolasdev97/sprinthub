import { Router } from "express";

import { healthController } from "./health.controller";
import { authRouter } from "../modules/auth";
import { workspaceRouter } from "../modules/workspaces/routes";
import { projectRouter } from "../modules/projects/routes";
import { taskRouter } from "../modules/tasks/routes";
import { userRouter } from "../modules/users";
import { notificationRouter } from "../modules/notifications";

const router = Router();

const apiRouter = Router();

apiRouter.get("/health", healthController);

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/workspaces", workspaceRouter);
apiRouter.use("/", projectRouter);
apiRouter.use("/", taskRouter);
apiRouter.use("/notifications", notificationRouter);

router.use("/api", apiRouter);

export default router;

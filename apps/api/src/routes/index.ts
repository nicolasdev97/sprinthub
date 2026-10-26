import { Router } from "express";

import { healthController } from "./health.controller";
import { authRouter } from "../modules/auth";
import { workspaceRouter } from "../modules/workspaces";
import { projectRouter } from "../modules/projects";
import { taskRouter } from "../modules/tasks";
import { userRouter } from "../modules/users";
import { notificationRouter } from "../modules/notifications";
import { dashboardRouter } from "../modules/dashboard";
import { eventsRouter } from "../modules/events";

const router = Router();

const apiRouter = Router();

apiRouter.get("/health", healthController);

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/workspaces", workspaceRouter);
apiRouter.use("/", projectRouter);
apiRouter.use("/", taskRouter);
apiRouter.use("/", dashboardRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/events", eventsRouter);

router.use("/api", apiRouter);

export default router;

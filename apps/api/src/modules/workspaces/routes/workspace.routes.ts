import { Router } from "express";

import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";

import { WorkspaceController } from "../controller";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { WorkspaceRepository } from "../repository";
import { WorkspaceService } from "../service";

export const workspaceRouter = Router();

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository);
const workspaceController = new WorkspaceController(workspaceService);

workspaceRouter.post(
  "/",
  authenticate,
  validate(createWorkspaceSchema),
  workspaceController.createWorkspace.bind(workspaceController),
);

workspaceRouter.get(
  "/",
  authenticate,
  workspaceController.getUserWorkspaces.bind(workspaceController),
);

workspaceRouter.get(
  "/:workspaceId",
  authenticate,
  workspaceController.getWorkspaceById.bind(workspaceController),
);

workspaceRouter.patch(
  "/:workspaceId",
  authenticate,
  validate(updateWorkspaceSchema),
  workspaceController.updateWorkspace.bind(workspaceController),
);

export default workspaceRouter;

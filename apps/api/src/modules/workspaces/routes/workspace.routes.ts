import { Router } from "express";

import { authenticate, validate, validateQuery } from "../../../middleware";
import { WorkspaceController } from "../controller";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
  workspaceFilterSchema,
} from "../schema";
import { WorkspaceRepository } from "../repository";
import { WorkspaceService } from "../service";

import { NotificationRepository } from "../../notifications/repository";
import { NotificationService } from "../../notifications/service";

export const workspaceRouter = Router();

const workspaceRepository = new WorkspaceRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const workspaceService = new WorkspaceService(
  workspaceRepository,
  notificationService,
);

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
  validateQuery(workspaceFilterSchema),
  workspaceController.getWorkspaces.bind(workspaceController),
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

workspaceRouter.delete(
  "/:workspaceId",
  authenticate,
  workspaceController.deleteWorkspace.bind(workspaceController),
);

workspaceRouter.post(
  "/:workspaceId/members",
  authenticate,
  validate(addWorkspaceMemberSchema),
  workspaceController.addWorkspaceMember.bind(workspaceController),
);

workspaceRouter.get(
  "/:workspaceId/members",
  authenticate,
  workspaceController.getWorkspaceMembers.bind(workspaceController),
);

workspaceRouter.patch(
  "/:workspaceId/members/:memberId",
  authenticate,
  validate(updateWorkspaceMemberRoleSchema),
  workspaceController.updateWorkspaceMemberRole.bind(workspaceController),
);

workspaceRouter.delete(
  "/:workspaceId/members/:memberId",
  authenticate,
  workspaceController.removeWorkspaceMember.bind(workspaceController),
);

export default workspaceRouter;

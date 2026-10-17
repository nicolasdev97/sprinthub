import { Router } from "express";

import {
  authenticate,
  validate,
  validateParams,
  validateQuery,
} from "../../../middleware";
import { WorkspaceController } from "../controller";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
  workspaceFilterSchema,
  workspaceParamsSchema,
  workspaceMemberParamsSchema,
} from "../schema";
import { WorkspaceRepository } from "../repository";
import { WorkspaceService } from "../service";

import { NotificationRepository, NotificationService } from "../../notifications";

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
  validateParams(workspaceParamsSchema),
  workspaceController.getWorkspaceById.bind(workspaceController),
);

workspaceRouter.patch(
  "/:workspaceId",
  authenticate,
  validateParams(workspaceParamsSchema),
  validate(updateWorkspaceSchema),
  workspaceController.updateWorkspace.bind(workspaceController),
);

workspaceRouter.delete(
  "/:workspaceId",
  authenticate,
  validateParams(workspaceParamsSchema),
  workspaceController.deleteWorkspace.bind(workspaceController),
);

workspaceRouter.post(
  "/:workspaceId/members",
  authenticate,
  validateParams(workspaceParamsSchema),
  validate(addWorkspaceMemberSchema),
  workspaceController.addWorkspaceMember.bind(workspaceController),
);

workspaceRouter.get(
  "/:workspaceId/members",
  authenticate,
  validateParams(workspaceParamsSchema),
  workspaceController.getWorkspaceMembers.bind(workspaceController),
);

workspaceRouter.patch(
  "/:workspaceId/members/:memberId",
  authenticate,
  validateParams(workspaceMemberParamsSchema),
  validate(updateWorkspaceMemberRoleSchema),
  workspaceController.updateWorkspaceMemberRole.bind(workspaceController),
);

workspaceRouter.delete(
  "/:workspaceId/members/:memberId",
  authenticate,
  validateParams(workspaceMemberParamsSchema),
  workspaceController.removeWorkspaceMember.bind(workspaceController),
);

export default workspaceRouter;

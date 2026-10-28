import { Router } from 'express';

import {
  authenticate,
  requireWorkspaceRole,
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware';
import { WorkspaceController } from '../controller';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberRoleSchema,
  workspaceFilterSchema,
  workspaceParamsSchema,
  workspaceMemberParamsSchema,
  transferWorkspaceOwnershipSchema,
} from '../schema';
import { WorkspaceRepository } from '../repository';
import { WorkspaceService } from '../service';

import { NotificationRepository, NotificationService } from '../../notifications';

export const workspaceRouter = Router();

const workspaceRepository = new WorkspaceRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const workspaceService = new WorkspaceService(workspaceRepository, notificationService);

const workspaceController = new WorkspaceController(workspaceService);

workspaceRouter.post(
  '/',
  authenticate,
  validate(createWorkspaceSchema),
  workspaceController.createWorkspace.bind(workspaceController)
);

workspaceRouter.get(
  '/',
  authenticate,
  validateQuery(workspaceFilterSchema),
  workspaceController.getWorkspaces.bind(workspaceController)
);

workspaceRouter.get(
  '/:workspaceId',
  authenticate,
  validateParams(workspaceParamsSchema),
  requireWorkspaceRole('MEMBER'),
  workspaceController.getWorkspaceById.bind(workspaceController)
);

workspaceRouter.patch(
  '/:workspaceId',
  authenticate,
  validateParams(workspaceParamsSchema),
  requireWorkspaceRole('OWNER'),
  validate(updateWorkspaceSchema),
  workspaceController.updateWorkspace.bind(workspaceController)
);

workspaceRouter.delete(
  '/:workspaceId',
  authenticate,
  validateParams(workspaceParamsSchema),
  requireWorkspaceRole('OWNER'),
  workspaceController.deleteWorkspace.bind(workspaceController)
);

workspaceRouter.post(
  '/:workspaceId/transfer-ownership',
  authenticate,
  validateParams(workspaceParamsSchema),
  requireWorkspaceRole('OWNER'),
  validate(transferWorkspaceOwnershipSchema),
  workspaceController.transferWorkspaceOwnership.bind(workspaceController)
);

workspaceRouter.post(
  '/:workspaceId/members',
  authenticate,
  validateParams(workspaceParamsSchema),
  requireWorkspaceRole('ADMIN'),
  validate(addWorkspaceMemberSchema),
  workspaceController.addWorkspaceMember.bind(workspaceController)
);

workspaceRouter.get(
  '/:workspaceId/members',
  authenticate,
  validateParams(workspaceParamsSchema),
  requireWorkspaceRole('MEMBER'),
  workspaceController.getWorkspaceMembers.bind(workspaceController)
);

workspaceRouter.patch(
  '/:workspaceId/members/:memberId',
  authenticate,
  validateParams(workspaceMemberParamsSchema),
  requireWorkspaceRole('OWNER'),
  validate(updateWorkspaceMemberRoleSchema),
  workspaceController.updateWorkspaceMemberRole.bind(workspaceController)
);

workspaceRouter.delete(
  '/:workspaceId/members/:memberId',
  authenticate,
  validateParams(workspaceMemberParamsSchema),
  requireWorkspaceRole('MEMBER'),
  workspaceController.removeWorkspaceMember.bind(workspaceController)
);

export default workspaceRouter;

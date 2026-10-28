import { Router } from 'express';

import { authenticate, validateParams } from '../../../middleware';
import { NotificationRepository, NotificationService } from '../../notifications';
import { WorkspaceRepository, WorkspaceService } from '../../workspaces';
import { DashboardController } from '../controller';
import { DashboardRepository } from '../repository';
import { workspaceDashboardParamsSchema } from '../schema';
import { DashboardService } from '../service';
import { WorkspaceDashboardParams } from '../types';

export const dashboardRouter = Router();

const dashboardRepository = new DashboardRepository();
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository, notificationService);
const dashboardService = new DashboardService(dashboardRepository, workspaceService);
const dashboardController = new DashboardController(dashboardService);

dashboardRouter.get<WorkspaceDashboardParams>(
  '/workspaces/:workspaceId/dashboard',
  authenticate,
  validateParams(workspaceDashboardParamsSchema),
  dashboardController.getWorkspaceDashboard.bind(dashboardController)
);

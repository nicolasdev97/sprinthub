import { Router } from 'express';

import {
  authenticate,
  requireProjectAccess,
  requireWorkspaceRole,
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware';

import { ProjectController } from '../controller';
import {
  createProjectSchema,
  updateProjectSchema,
  archiveProjectSchema,
  projectFilterSchema,
  workspaceProjectParamsSchema,
  projectParamsSchema,
} from '../schema';
import { ProjectRepository } from '../repository';
import { ProjectService } from '../service';
import { WorkspaceRepository, WorkspaceService } from '../../workspaces';
import { ProjectParams, WorkspaceProjectParams } from '../types';

import { NotificationRepository, NotificationService } from '../../notifications';

export const projectRouter = Router();

const projectRepository = new ProjectRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository, notificationService);

const projectService = new ProjectService(projectRepository, workspaceService, notificationService);

const projectController = new ProjectController(projectService);

projectRouter.post<WorkspaceProjectParams>(
  '/workspaces/:workspaceId/projects',
  authenticate,
  validateParams(workspaceProjectParamsSchema),
  requireWorkspaceRole('ADMIN'),
  requireWorkspaceRole("ADMIN"),
  validate(createProjectSchema),
  projectController.createProject.bind(projectController)
);

projectRouter.get<WorkspaceProjectParams>(
  '/workspaces/:workspaceId/projects',
  authenticate,
  validateParams(workspaceProjectParamsSchema),
  requireWorkspaceRole('MEMBER'),
  requireWorkspaceRole("MEMBER"),
  validateQuery(projectFilterSchema),
  projectController.getProjects.bind(projectController)
);

projectRouter.get<ProjectParams>(
  '/projects/:projectId',
  authenticate,
  validateParams(projectParamsSchema),
  requireProjectAccess("MEMBER"),
  requireProjectAccess('MEMBER'),
  projectController.getProjectById.bind(projectController)
);

projectRouter.patch<ProjectParams>(
  '/projects/:projectId',
  authenticate,
  validateParams(projectParamsSchema),
  requireProjectAccess('ADMIN'),
  requireProjectAccess("ADMIN"),
  validate(updateProjectSchema),
  projectController.updateProject.bind(projectController)
);

projectRouter.delete<ProjectParams>(
  '/projects/:projectId',
  authenticate,
  validateParams(projectParamsSchema),
  requireProjectAccess("ADMIN"),
  requireProjectAccess('ADMIN'),
  projectController.deleteProject.bind(projectController)
);

projectRouter.patch<ProjectParams>(
  '/projects/:projectId/archive',
  authenticate,
  validateParams(projectParamsSchema),
  requireProjectAccess('ADMIN'),
  requireProjectAccess("ADMIN"),
  validate(archiveProjectSchema),
  projectController.archiveProject.bind(projectController)
);

export default projectRouter;


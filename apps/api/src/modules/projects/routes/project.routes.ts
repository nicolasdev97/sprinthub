import { Router } from "express";

import {
  authenticate,
  validate,
  validateParams,
  validateQuery,
} from "../../../middleware";

import { ProjectController } from "../controller";
import {
  createProjectSchema,
  updateProjectSchema,
  projectFilterSchema,
  workspaceProjectParamsSchema,
  projectParamsSchema,
} from "../schema";
import { ProjectRepository } from "../repository";
import { ProjectService } from "../service";
import { WorkspaceService } from "../../workspaces/service";
import { WorkspaceRepository } from "../../workspaces/repository";
import { ProjectParams, WorkspaceProjectParams } from "../types";

import { NotificationRepository } from "../../notifications/repository";
import { NotificationService } from "../../notifications/service";

export const projectRouter = Router();

const projectRepository = new ProjectRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(
  workspaceRepository,
  notificationService,
);

const projectService = new ProjectService(
  projectRepository,
  workspaceService,
  notificationService,
);

const projectController = new ProjectController(projectService);

projectRouter.post<WorkspaceProjectParams>(
  "/workspaces/:workspaceId/projects",
  authenticate,
  validateParams(workspaceProjectParamsSchema),
  validate(createProjectSchema),
  projectController.createProject.bind(projectController),
);

projectRouter.get<WorkspaceProjectParams>(
  "/workspaces/:workspaceId/projects",
  authenticate,
  validateParams(workspaceProjectParamsSchema),
  validateQuery(projectFilterSchema),
  projectController.getProjects.bind(projectController),
);

projectRouter.get<ProjectParams>(
  "/projects/:projectId",
  authenticate,
  validateParams(projectParamsSchema),
  projectController.getProjectById.bind(projectController),
);

projectRouter.patch<ProjectParams>(
  "/projects/:projectId",
  authenticate,
  validateParams(projectParamsSchema),
  validate(updateProjectSchema),
  projectController.updateProject.bind(projectController),
);

projectRouter.delete<ProjectParams>(
  "/projects/:projectId",
  authenticate,
  validateParams(projectParamsSchema),
  projectController.deleteProject.bind(projectController),
);

projectRouter.patch<ProjectParams>(
  "/projects/:projectId/archive",
  authenticate,
  validateParams(projectParamsSchema),
  projectController.archiveProject.bind(projectController),
);

projectRouter.patch<ProjectParams>(
  "/projects/:projectId/unarchive",
  authenticate,
  validateParams(projectParamsSchema),
  projectController.unarchiveProject.bind(projectController),
);

export default projectRouter;

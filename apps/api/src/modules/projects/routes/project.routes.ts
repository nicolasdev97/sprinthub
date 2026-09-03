import { Router } from "express";

import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";

import { ProjectController } from "../controller";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { ProjectRepository } from "../repository";
import { ProjectService } from "../service";
import { WorkspaceService } from "../../workspaces/service";
import { WorkspaceRepository } from "../../workspaces/repository";
import { ProjectParams, WorkspaceProjectParams } from "../types";

export const projectRouter = Router();

const projectRepository = new ProjectRepository();

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository);

const projectService = new ProjectService(projectRepository, workspaceService);

const projectController = new ProjectController(projectService);

projectRouter.post<WorkspaceProjectParams>(
  "/workspaces/:workspaceId/projects",
  authenticate,
  validate(createProjectSchema),
  projectController.createProject.bind(projectController),
);

projectRouter.get<WorkspaceProjectParams>(
  "/workspaces/:workspaceId/projects",
  authenticate,
  projectController.getProjects.bind(projectController),
);

projectRouter.get<ProjectParams>(
  "/projects/:projectId",
  authenticate,
  projectController.getProjectById.bind(projectController),
);

projectRouter.patch<ProjectParams>(
  "/projects/:projectId",
  authenticate,
  validate(updateProjectSchema),
  projectController.updateProject.bind(projectController),
);

projectRouter.delete<ProjectParams>(
  "/projects/:projectId",
  authenticate,
  projectController.deleteProject.bind(projectController),
);

projectRouter.patch(
  "/projects/:projectId/archive",
  authenticate,
  projectController.archiveProject.bind(projectController),
);

export default projectRouter;

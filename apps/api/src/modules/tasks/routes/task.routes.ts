import { Router } from "express";

import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validation";

import { TaskController } from "../controller";
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
} from "../schema";
import { TaskRepository } from "../repository";
import { TaskService } from "../service";
import { WorkspaceService } from "../../workspaces/service";
import { WorkspaceRepository } from "../../workspaces/repository";
import { ProjectRepository } from "../../projects/repository";
import { CreateTaskDto } from "../dto";
import { ProjectTaskParams, TaskParams } from "../types";

export const taskRouter = Router();

const taskRepository = new TaskRepository();

const projectRepository = new ProjectRepository();

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository);

const taskService = new TaskService(
  taskRepository,
  projectRepository,
  workspaceService,
);

const taskController = new TaskController(taskService);

taskRouter.post<
  ProjectTaskParams,
  unknown,
  Omit<CreateTaskDto, "projectId" | "createdById" | "status">
>(
  "/projects/:projectId/tasks",
  authenticate,
  validate(createTaskSchema),
  taskController.createTask.bind(taskController),
);

taskRouter.get<ProjectTaskParams>(
  "/projects/:projectId/tasks",
  authenticate,
  taskController.getTasks.bind(taskController),
);

taskRouter.get<TaskParams>(
  "/tasks/:taskId",
  authenticate,
  taskController.getTaskById.bind(taskController),
);

taskRouter.patch<TaskParams>(
  "/tasks/:taskId",
  authenticate,
  validate(updateTaskSchema),
  taskController.updateTask.bind(taskController),
);

taskRouter.delete<TaskParams>(
  "/tasks/:taskId",
  authenticate,
  taskController.deleteTask.bind(taskController),
);

taskRouter.patch<TaskParams>(
  "/tasks/:taskId/assign",
  authenticate,
  validate(assignTaskSchema),
  taskController.assignTask.bind(taskController),
);

export default taskRouter;

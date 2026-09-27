import { Router } from "express";

import { authenticate, validate, validateQuery } from "../../../middleware";

import { TaskController } from "../controller";
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
  taskFilterSchema,
} from "../schema";
import { TaskRepository } from "../repository";
import { TaskService } from "../service";
import { WorkspaceService } from "../../workspaces/service";
import { WorkspaceRepository } from "../../workspaces/repository";
import { ProjectRepository } from "../../projects/repository";
import { CreateTaskDto } from "../dto";
import { ProjectTaskParams, TaskParams } from "../types";

import { NotificationRepository } from "../../notifications/repository";
import { NotificationService } from "../../notifications/service";

export const taskRouter = Router();

const taskRepository = new TaskRepository();

const projectRepository = new ProjectRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(
  workspaceRepository,
  notificationService,
);

const taskService = new TaskService(
  taskRepository,
  projectRepository,
  workspaceService,
  notificationService,
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
  validateQuery(taskFilterSchema),
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

taskRouter.patch<TaskParams>(
  "/tasks/:taskId/status",
  authenticate,
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus.bind(taskController),
);

taskRouter.patch<TaskParams>(
  "/tasks/:taskId/priority",
  authenticate,
  validate(updateTaskPrioritySchema),
  taskController.updateTaskPriority.bind(taskController),
);

export default taskRouter;

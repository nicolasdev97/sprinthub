import { Router } from 'express';

import {
  authenticate,
  requireProjectAccess,
  requireTaskAccess,
  validate,
  validateParams,
  validateQuery,
} from '../../../middleware';

import { TaskController } from '../controller';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  updateTaskStatusSchema,
  updateTaskPrioritySchema,
  taskFilterSchema,
  projectTaskParamsSchema,
  taskParamsSchema,
} from '../schema';
import { TaskRepository } from '../repository';
import { TaskService } from '../service';
import { WorkspaceRepository, WorkspaceService } from '../../workspaces';
import { ProjectRepository, ProjectService } from '../../projects';
import { CreateTaskDto } from '../dto';
import { ProjectTaskParams, TaskParams } from '../types';

import { NotificationRepository, NotificationService } from '../../notifications';

export const taskRouter = Router();

const taskRepository = new TaskRepository();

const projectRepository = new ProjectRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const workspaceRepository = new WorkspaceRepository();
const workspaceService = new WorkspaceService(workspaceRepository, notificationService);

const projectService = new ProjectService(projectRepository, workspaceService, notificationService);

const taskService = new TaskService(
  taskRepository,
  projectService,
  workspaceService,
  notificationService
);

const taskController = new TaskController(taskService);

taskRouter.post<
  ProjectTaskParams,
  unknown,
  Omit<CreateTaskDto, 'projectId' | 'createdById' | 'status'>
>(
  '/projects/:projectId/tasks',
  authenticate,
  validateParams(projectTaskParamsSchema),
  requireProjectAccess('MEMBER'),
  requireProjectAccess("MEMBER"),
  validate(createTaskSchema),
  taskController.createTask.bind(taskController)
);

taskRouter.get<ProjectTaskParams>(
  '/projects/:projectId/tasks',
  authenticate,
  validateParams(projectTaskParamsSchema),
  requireProjectAccess('MEMBER'),
  requireProjectAccess("MEMBER"),
  validateQuery(taskFilterSchema),
  taskController.getTasks.bind(taskController)
);

taskRouter.get<TaskParams>(
  '/tasks/:taskId',
  authenticate,
  validateParams(taskParamsSchema),
  requireTaskAccess("MEMBER"),
  requireTaskAccess('MEMBER'),
  taskController.getTaskById.bind(taskController)
);

taskRouter.patch<TaskParams>(
  '/tasks/:taskId',
  authenticate,
  validateParams(taskParamsSchema),
  requireTaskAccess('MEMBER'),
  requireTaskAccess("MEMBER"),
  validate(updateTaskSchema),
  taskController.updateTask.bind(taskController)
);

taskRouter.delete<TaskParams>(
  '/tasks/:taskId',
  authenticate,
  validateParams(taskParamsSchema),
  requireTaskAccess("MEMBER"),
  requireTaskAccess('MEMBER'),
  taskController.deleteTask.bind(taskController)
);

taskRouter.patch<TaskParams>(
  '/tasks/:taskId/assign',
  authenticate,
  validateParams(taskParamsSchema),
  requireTaskAccess('MEMBER'),
  requireTaskAccess("MEMBER"),
  validate(assignTaskSchema),
  taskController.assignTask.bind(taskController)
);

taskRouter.patch<TaskParams>(
  '/tasks/:taskId/status',
  authenticate,
  validateParams(taskParamsSchema),
  requireTaskAccess('MEMBER'),
  requireTaskAccess("MEMBER"),
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus.bind(taskController)
);

taskRouter.patch<TaskParams>(
  '/tasks/:taskId/priority',
  authenticate,
  validateParams(taskParamsSchema),
  requireTaskAccess('MEMBER'),
  requireTaskAccess("MEMBER"),
  validate(updateTaskPrioritySchema),
  taskController.updateTaskPriority.bind(taskController)
);

export default taskRouter;


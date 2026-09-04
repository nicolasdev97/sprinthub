import { Request, Response } from "express";

import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  UpdateTaskStatusDto,
  UpdateTaskPriorityDto,
} from "../dto";
import { TaskService } from "../service";
import { ProjectTaskParams, TaskParams } from "../types";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  async getTasks(req: Request<ProjectTaskParams>, res: Response) {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const tasks = await this.taskService.getTasks(projectId, userId);

    res.status(200).json(tasks);
  }

  async createTask(
    req: Request<
      ProjectTaskParams,
      unknown,
      Omit<CreateTaskDto, "projectId" | "createdById" | "status">
    >,
    res: Response,
  ) {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const task = await this.taskService.createTask(req.body, projectId, userId);

    res.status(201).json(task);
  }

  async getTaskById(req: Request<TaskParams>, res: Response) {
    const { taskId } = req.params;
    const userId = req.user.userId;

    const task = await this.taskService.getTaskById(taskId, userId);

    res.status(200).json(task);
  }

  async updateTask(
    req: Request<TaskParams, unknown, UpdateTaskDto>,
    res: Response,
  ) {
    const { taskId } = req.params;
    const userId = req.user.userId;

    const task = await this.taskService.updateTask(taskId, userId, req.body);

    res.status(200).json(task);
  }

  async deleteTask(req: Request<TaskParams>, res: Response) {
    const { taskId } = req.params;
    const userId = req.user.userId;

    await this.taskService.deleteTask(taskId, userId);

    res.status(204).send();
  }

  async assignTask(
    req: Request<TaskParams, unknown, AssignTaskDto>,
    res: Response,
  ) {
    const { taskId } = req.params;

    const task = await this.taskService.assignTask(taskId, req.body);

    res.status(200).json(task);
  }

  async updateTaskStatus(
    req: Request<TaskParams, unknown, UpdateTaskStatusDto>,
    res: Response,
  ) {
    const { taskId } = req.params;

    const task = await this.taskService.updateTaskStatus(taskId, req.body);

    res.status(200).json(task);
  }

  async updateTaskPriority(
    req: Request<TaskParams, unknown, UpdateTaskPriorityDto>,
    res: Response,
  ) {
    const { taskId } = req.params;

    const task = await this.taskService.updateTaskPriority(taskId, req.body);

    res.status(200).json(task);
  }
}

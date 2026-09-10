import { TaskStatus, WorkspaceRole } from "@prisma/client";

import { AppError } from "../../../shared/errors";
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  UpdateTaskStatusDto,
  UpdateTaskPriorityDto,
} from "../dto";
import { TaskRepository } from "../repository";
import { WorkspaceService } from "../../workspaces/service";
import { ProjectRepository } from "../../projects/repository";

import { TaskFilterParams } from "../types";

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async createTask(
    data: Omit<CreateTaskDto, "projectId" | "createdById" | "status">,
    projectId: string,
    userId: string,
  ) {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    if (project.archived) {
      throw new AppError("Archived projects cannot receive new tasks", 400);
    }

    await this.workspaceService.getWorkspaceMemberByUser(
      project.workspaceId,
      userId,
    );

    const existingTask = await this.taskRepository.getTaskByTitle(
      projectId,
      data.title,
    );

    if (existingTask) {
      throw new AppError("Task title already exists in this project", 409);
    }

    const taskData: CreateTaskDto = {
      ...data,
      projectId,
      createdById: userId,
      status: TaskStatus.TODO,
    };

    return this.taskRepository.createTask(taskData);
  }

  async getTasks(
    projectId: string,
    userId: string,
    filters?: TaskFilterParams,
  ) {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMemberByUser(
      project.workspaceId,
      userId,
    );

    return this.taskRepository.getTasks(projectId, filters);
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const project = await this.projectRepository.getProjectById(task.projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMemberByUser(
      project.workspaceId,
      userId,
    );

    return task;
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const project = await this.projectRepository.getProjectById(task.projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMemberByUser(
      project.workspaceId,
      userId,
    );

    return this.taskRepository.updateTask(taskId, data);
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const project = await this.projectRepository.getProjectById(task.projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember =
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        userId,
      );

    const canDelete =
      task.createdById === userId ||
      workspaceMember.role === WorkspaceRole.ADMIN ||
      workspaceMember.role === WorkspaceRole.OWNER;

    if (!canDelete) {
      throw new AppError("Forbidden", 403);
    }

    await this.taskRepository.deleteTask(taskId);
  }

  async assignTask(taskId: string, data: AssignTaskDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const project = await this.projectRepository.getProjectById(task.projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    if (data.assigneeId !== null) {
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        data.assigneeId,
      );
    }

    return this.taskRepository.assignTask(taskId, data.assigneeId);
  }

  async updateTaskStatus(taskId: string, data: UpdateTaskStatusDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const completedAt = data.status === TaskStatus.DONE ? new Date() : null;

    return this.taskRepository.updateTaskStatus(
      taskId,
      data.status,
      completedAt,
    );
  }

  async updateTaskPriority(taskId: string, data: UpdateTaskPriorityDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return this.taskRepository.updateTaskPriority(taskId, data.priority);
  }
}

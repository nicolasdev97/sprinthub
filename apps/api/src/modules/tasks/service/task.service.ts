import { TaskStatus, WorkspaceRole } from "@prisma/client";

import { AppError } from "../../../shared";
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

import { NotificationService } from "../../notifications";

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceService: WorkspaceService,
    private readonly notificationService: NotificationService,
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

    if (data.assigneeId) {
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        data.assigneeId,
      );
    }

    const taskData: CreateTaskDto = {
      ...data,
      projectId,
      createdById: userId,
      status: TaskStatus.TODO,
    };

    const task = await this.taskRepository.createTask(taskData);

    if (data.assigneeId) {
      await this.notificationService.createNotification(
        data.assigneeId,
        "Task assigned",
        "You have been assigned a task.",
      );
    }

    return task;
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

    if (data.title) {
      const existingTask = await this.taskRepository.getTaskByTitle(
        task.projectId,
        data.title,
      );

      if (existingTask && existingTask.id !== taskId) {
        throw new AppError("Task title already exists in this project", 409);
      }
    }

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

    const updatedTask = await this.taskRepository.assignTask(
      taskId,
      data.assigneeId,
    );

    if (data.assigneeId !== null) {
      await this.notificationService.createNotification(
        data.assigneeId,
        "Task assigned",
        "You have been assigned a task.",
      );
    }

    return updatedTask;
  }

  async updateTaskStatus(taskId: string, data: UpdateTaskStatusDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const completedAt = data.status === TaskStatus.DONE ? new Date() : null;

    const updatedTask = await this.taskRepository.updateTaskStatus(
      taskId,
      data.status,
      completedAt,
    );

    if (task.assigneeId) {
      await this.notificationService.createNotification(
        task.assigneeId,
        "Task status changed",
        "The status of your assigned task has changed.",
      );
    }

    return updatedTask;
  }

  async updateTaskPriority(taskId: string, data: UpdateTaskPriorityDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const updatedTask = await this.taskRepository.updateTaskPriority(
      taskId,
      data.priority,
    );

    if (task.assigneeId) {
      await this.notificationService.createNotification(
        task.assigneeId,
        "Task priority changed",
        "The priority of your assigned task has changed.",
      );
    }

    return updatedTask;
  }
}

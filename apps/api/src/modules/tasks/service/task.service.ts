import { TaskStatus, WorkspaceRole } from "@prisma/client";

import { AppError } from "../../../shared/errors";
import { CreateTaskDto, UpdateTaskDto } from "../dto";
import { TaskRepository } from "../repository";
import { WorkspaceService } from "../../workspaces/service";
import { ProjectRepository } from "../../projects/repository";

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async getTasks(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMember(project.workspaceId, userId);

    return this.taskRepository.findMany(projectId);
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const project = await this.projectRepository.findById(task.projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMember(project.workspaceId, userId);

    return task;
  }

  async createTask(
    data: Omit<CreateTaskDto, "projectId" | "createdById" | "status">,
    projectId: string,
    userId: string,
  ) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    if (project.archived) {
      throw new AppError("Archived projects cannot receive new tasks", 400);
    }

    await this.workspaceService.getWorkspaceMember(project.workspaceId, userId);

    const taskData: CreateTaskDto = {
      ...data,
      projectId,
      createdById: userId,
      status: TaskStatus.TODO,
    };

    return this.taskRepository.create(taskData);
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskDto) {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const project = await this.projectRepository.findById(task.projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await this.workspaceService.getWorkspaceMember(project.workspaceId, userId);

    return this.taskRepository.update(taskId, data);
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const project = await this.projectRepository.findById(task.projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const workspaceMember = await this.workspaceService.getWorkspaceMember(
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

    await this.taskRepository.delete(taskId);
  }
}

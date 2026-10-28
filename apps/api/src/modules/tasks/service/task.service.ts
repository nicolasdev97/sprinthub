import { TaskStatus, WorkspaceRole } from '@prisma/client';

import { AppError } from '../../../shared';
import {
  CreateTaskDto,
  UpdateTaskDto,
  AssignTaskDto,
  UpdateTaskStatusDto,
  UpdateTaskPriorityDto,
} from '../dto';
import { TaskRepository } from '../repository';
import { WorkspaceService } from '../../workspaces';
import { ProjectService } from '../../projects';

import { TaskFilterParams } from '../types';

import { NotificationService } from '../../notifications';
import { eventsService } from '../../events';

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectService: ProjectService,
    private readonly workspaceService: WorkspaceService,
    private readonly notificationService: NotificationService
  ) {}

  async createTask(
    data: Omit<CreateTaskDto, 'projectId' | 'createdById' | 'status'>,
    projectId: string,
    userId: string
  ) {
    const project = await this.projectService.getProjectEntityById(projectId);

    await this.workspaceService.getWorkspaceMemberByUser(project.workspaceId, userId, 403);

    if (project.archived) {
      throw new AppError('Archived projects cannot receive new tasks', 400);
    }

    const existingTask = await this.taskRepository.getTaskByTitle(projectId, data.title);

    if (existingTask) {
      throw new AppError('Task title already exists in this project', 409);
    }

    if (data.assigneeId) {
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        data.assigneeId,
        403
      );
    }

    const taskData: CreateTaskDto = {
      ...data,
      projectId,
      createdById: userId,
      status: TaskStatus.TODO,
    };

    const task = await this.taskRepository.createTask(taskData);

    eventsService.broadcast({
      type: 'TASK_MUTATED',
      workspaceId: project.workspaceId,
      projectId,
      taskId: task.id,
      action: 'created',
    });

    if (data.assigneeId) {
      await this.notificationService.createNotification(
        data.assigneeId,
        'Task assigned',
        `You have been assigned to task "${task.title}".<!--link:/workspaces/${project.workspaceId}/projects/${projectId}/tasks?taskId=${task.id}-->`
      );
    }

    return task;
  }

  async getTasks(projectId: string, userId: string, filters?: TaskFilterParams) {
    const project = await this.projectService.getProjectEntityById(projectId);

    await this.workspaceService.getWorkspaceMemberByUser(project.workspaceId, userId, 403);

    return this.taskRepository.getTasks(projectId, filters);
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await this.projectService.getProjectEntityById(task.projectId);

    await this.workspaceService.getWorkspaceMemberByUser(project.workspaceId, userId, 403);

    return task;
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await this.projectService.getProjectEntityById(task.projectId);

    await this.workspaceService.getWorkspaceMemberByUser(project.workspaceId, userId, 403);

    if (project.archived) {
      throw new AppError('Cannot update tasks in an archived project', 400);
    }

    if (data.title) {
      const existingTask = await this.taskRepository.getTaskByTitle(task.projectId, data.title);

      if (existingTask && existingTask.id !== taskId) {
        throw new AppError('Task title already exists in this project', 409);
      }
    }

    const updated = await this.taskRepository.updateTask(taskId, data);

    eventsService.broadcast({
      type: 'TASK_MUTATED',
      workspaceId: project.workspaceId,
      projectId: task.projectId,
      taskId,
      action: 'updated',
    });

    return updated;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await this.projectService.getProjectEntityById(task.projectId);

    const workspaceMember = await this.workspaceService.getWorkspaceMemberByUser(
      project.workspaceId,
      userId,
      403
    );

    const canDelete =
      task.createdById === userId ||
      workspaceMember.role === WorkspaceRole.ADMIN ||
      workspaceMember.role === WorkspaceRole.OWNER;

    if (!canDelete) {
      throw new AppError('Forbidden', 403);
    }

    if (project.archived) {
      throw new AppError('Cannot delete tasks in an archived project', 400);
    }

    await this.taskRepository.deleteTask(taskId);

    eventsService.broadcast({
      type: 'TASK_MUTATED',
      workspaceId: project.workspaceId,
      projectId: task.projectId,
      taskId,
      action: 'deleted',
    });
  }

  async assignTask(taskId: string, userId: string, data: AssignTaskDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await this.projectService.getProjectEntityById(task.projectId);

    const workspaceMember = await this.workspaceService.getWorkspaceMemberByUser(
      project.workspaceId,
      userId,
      403
    );

    if (
      workspaceMember.role !== WorkspaceRole.OWNER &&
      workspaceMember.role !== WorkspaceRole.ADMIN
    ) {
      throw new AppError('Forbidden', 403);
    }

    if (project.archived) {
      throw new AppError('Cannot assign tasks in an archived project', 400);
    }

    if (data.assigneeId !== null) {
      await this.workspaceService.getWorkspaceMemberByUser(
        project.workspaceId,
        data.assigneeId,
        403
      );
    }

    const hasAssigneeChanged = task.assigneeId !== data.assigneeId;

    const updatedTask = await this.taskRepository.assignTask(taskId, data.assigneeId);

    if (hasAssigneeChanged && data.assigneeId !== null) {
      const project = await this.projectService.getProjectEntityById(task.projectId);
      await this.notificationService.createNotification(
        data.assigneeId,
        'Task assigned',
        `You have been assigned to task "${task.title}".<!--link:/workspaces/${project.workspaceId}/projects/${task.projectId}/tasks?taskId=${taskId}-->`
      );
    }

    eventsService.broadcast({
      type: 'TASK_MUTATED',
      workspaceId: project.workspaceId,
      projectId: task.projectId,
      taskId,
      action: 'updated',
    });

    return updatedTask;
  }

  async updateTaskStatus(taskId: string, userId: string, data: UpdateTaskStatusDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await this.projectService.getProjectEntityById(task.projectId);

    await this.workspaceService.getWorkspaceMemberByUser(project.workspaceId, userId, 403);

    if (project.archived) {
      throw new AppError('Cannot update task status in an archived project', 400);
    }

    const hasStatusChanged = task.status !== data.status;
    const completedAt = hasStatusChanged
      ? data.status === TaskStatus.DONE
        ? new Date()
        : null
      : task.completedAt;

    const updatedTask = await this.taskRepository.updateTaskStatus(
      taskId,
      data.status,
      completedAt
    );

    if (hasStatusChanged && task.assigneeId) {
      await this.notificationService.createNotification(
        task.assigneeId,
        'Task status changed',
        `The status of task "${task.title}" has changed to ${data.status}.<!--link:/workspaces/${project.workspaceId}/projects/${task.projectId}/tasks?taskId=${taskId}-->`
      );
    }

    eventsService.broadcast({
      type: 'TASK_MUTATED',
      workspaceId: project.workspaceId,
      projectId: task.projectId,
      taskId,
      action: 'updated',
    });

    return updatedTask;
  }

  async updateTaskPriority(taskId: string, userId: string, data: UpdateTaskPriorityDto) {
    const task = await this.taskRepository.getTaskById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await this.projectService.getProjectEntityById(task.projectId);

    await this.workspaceService.getWorkspaceMemberByUser(project.workspaceId, userId, 403);

    if (project.archived) {
      throw new AppError('Cannot update task priority in an archived project', 400);
    }

    const hasPriorityChanged = task.priority !== data.priority;

    const updatedTask = await this.taskRepository.updateTaskPriority(taskId, data.priority);

    if (hasPriorityChanged && task.assigneeId) {
      await this.notificationService.createNotification(
        task.assigneeId,
        'Task priority changed',
        `The priority of task "${task.title}" has changed to ${data.priority}.<!--link:/workspaces/${project.workspaceId}/projects/${task.projectId}/tasks?taskId=${taskId}-->`
      );
    }

    eventsService.broadcast({
      type: 'TASK_MUTATED',
      workspaceId: project.workspaceId,
      projectId: task.projectId,
      taskId,
      action: 'updated',
    });

    return updatedTask;
  }
}

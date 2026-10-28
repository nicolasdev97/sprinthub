import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStatus, TaskPriority, WorkspaceRole } from '@prisma/client';
import { TaskService } from '../../../../src/modules/tasks/service/task.service';
import { TaskRepository } from '../../../../src/modules/tasks/repository';
import { ProjectService } from '../../../../src/modules/projects';
import { WorkspaceService } from '../../../../src/modules/workspaces';
import { NotificationService } from '../../../../src/modules/notifications';
import { eventsService } from '../../../../src/modules/events';

vi.mock('../../../../src/modules/events', () => ({
  eventsService: {
    broadcast: vi.fn(),
    emitToUser: vi.fn(),
  },
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: any;
  let mockProjectService: any;
  let mockWorkspaceService: any;
  let mockNotificationService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskRepository = {
      createTask: vi.fn(),
      getTasks: vi.fn(),
      getTaskById: vi.fn(),
      getTaskByTitle: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      updateTaskStatus: vi.fn(),
      updateTaskPriority: vi.fn(),
      assignTask: vi.fn(),
    };

    mockProjectService = {
      getProjectEntityById: vi.fn(),
    };

    mockWorkspaceService = {
      getWorkspaceMemberByUser: vi.fn(),
    };

    mockNotificationService = {
      createNotification: vi.fn(),
    };

    taskService = new TaskService(
      mockTaskRepository,
      mockProjectService,
      mockWorkspaceService,
      mockNotificationService
    );
  });

  describe('createTask', () => {
    const projectId = 'proj-1';
    const userId = 'usr-author';
    const workspaceId = 'ws-1';

    it('should throw 400 if project is archived', async () => {
      mockProjectService.getProjectEntityById.mockResolvedValue({
        id: projectId,
        workspaceId,
        archived: true,
      });
      mockWorkspaceService.getWorkspaceMemberByUser.mockResolvedValue({
        id: 'mem-1',
        role: WorkspaceRole.MEMBER,
      });

      await expect(
        taskService.createTask(
          { title: 'New Task', priority: TaskPriority.MEDIUM },
          projectId,
          userId
        )
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Archived projects cannot receive new tasks',
      });
      expect(mockTaskRepository.createTask).not.toHaveBeenCalled();
    });

    it('should throw 409 if task title already exists in the project', async () => {
      mockProjectService.getProjectEntityById.mockResolvedValue({
        id: projectId,
        workspaceId,
        archived: false,
      });
      mockWorkspaceService.getWorkspaceMemberByUser.mockResolvedValue({
        id: 'mem-1',
        role: WorkspaceRole.MEMBER,
      });
      mockTaskRepository.getTaskByTitle.mockResolvedValue({
        id: 'existing-task',
        title: 'Duplicate Task',
      });

      await expect(
        taskService.createTask(
          { title: 'Duplicate Task', priority: TaskPriority.HIGH },
          projectId,
          userId
        )
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Task title already exists in this project',
      });
    });

    it('should create task with TODO status, broadcast event and return task', async () => {
      mockProjectService.getProjectEntityById.mockResolvedValue({
        id: projectId,
        workspaceId,
        archived: false,
      });
      mockWorkspaceService.getWorkspaceMemberByUser.mockResolvedValue({
        id: 'mem-1',
        role: WorkspaceRole.MEMBER,
      });
      mockTaskRepository.getTaskByTitle.mockResolvedValue(null);

      const createdTask = {
        id: 'task-100',
        title: 'New Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId,
        createdById: userId,
      };
      mockTaskRepository.createTask.mockResolvedValue(createdTask);

      const result = await taskService.createTask(
        { title: 'New Task', priority: TaskPriority.MEDIUM },
        projectId,
        userId
      );

      expect(mockTaskRepository.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          projectId,
          createdById: userId,
          status: TaskStatus.TODO,
        })
      );
      expect(eventsService.broadcast).toHaveBeenCalledWith({
        type: 'TASK_MUTATED',
        workspaceId,
        projectId,
        taskId: 'task-100',
        action: 'created',
      });
      expect(result).toEqual(createdTask);
    });
  });

  describe('deleteTask', () => {
    it('should throw 403 if requester is not author, admin, or owner', async () => {
      const task = {
        id: 'task-1',
        projectId: 'proj-1',
        createdById: 'usr-creator',
      };
      mockTaskRepository.getTaskById.mockResolvedValue(task);
      mockProjectService.getProjectEntityById.mockResolvedValue({
        id: 'proj-1',
        workspaceId: 'ws-1',
        archived: false,
      });
      mockWorkspaceService.getWorkspaceMemberByUser.mockResolvedValue({
        role: WorkspaceRole.MEMBER,
      });

      await expect(taskService.deleteTask('task-1', 'usr-unauthorized')).rejects.toMatchObject({
        statusCode: 403,
      });
      expect(mockTaskRepository.deleteTask).not.toHaveBeenCalled();
    });

    it('should allow deletion by author, delete task and broadcast event', async () => {
      const task = {
        id: 'task-1',
        projectId: 'proj-1',
        createdById: 'usr-author',
      };
      mockTaskRepository.getTaskById.mockResolvedValue(task);
      mockProjectService.getProjectEntityById.mockResolvedValue({
        id: 'proj-1',
        workspaceId: 'ws-1',
        archived: false,
      });
      mockWorkspaceService.getWorkspaceMemberByUser.mockResolvedValue({
        role: WorkspaceRole.MEMBER,
      });

      await taskService.deleteTask('task-1', 'usr-author');

      expect(mockTaskRepository.deleteTask).toHaveBeenCalledWith('task-1');
      expect(eventsService.broadcast).toHaveBeenCalledWith({
        type: 'TASK_MUTATED',
        workspaceId: 'ws-1',
        projectId: 'proj-1',
        taskId: 'task-1',
        action: 'deleted',
      });
    });
  });
});

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { TaskStatus, TaskPriority, WorkspaceRole } from '@prisma/client';
import app from '../../src/app';
import { prisma } from '../../src/database';
import { truncateDatabase, disconnectDatabase } from './helpers/db.helper';
import {
  createTestUser,
  createTestWorkspace,
  createTestProject,
  addMemberToWorkspace,
} from './helpers/auth.helper';

describe('Tasks, Projects & IDOR Defense Integration Tests', () => {
  beforeEach(async () => {
    await truncateDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /api/projects/:projectId/tasks', () => {
    it('should create a task with TODO status and return 201', async () => {
      const owner = await createTestUser();
      const assignee = await createTestUser();

      const ws = await createTestWorkspace(owner.user.id);
      await addMemberToWorkspace(ws.id, assignee.user.id, WorkspaceRole.MEMBER);
      const project = await createTestProject(ws.id);

      const payload = {
        title: 'Implement Integration Test Coverage',
        description: 'Comprehensive Supertest specs',
        priority: TaskPriority.HIGH,
        assigneeId: assignee.user.id,
      };

      const response = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set(owner.authHeader)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(payload.title);
      expect(response.body.status).toBe(TaskStatus.TODO);
      expect(response.body.priority).toBe(TaskPriority.HIGH);
      expect(response.body.assigneeId).toBe(assignee.user.id);

      const taskInDb = await prisma.task.findUnique({
        where: { id: response.body.id },
      });
      expect(taskInDb).not.toBeNull();
      expect(taskInDb?.projectId).toBe(project.id);
    });

    it('should forbid user outside workspace from creating tasks in the project', async () => {
      const owner = await createTestUser();
      const outsider = await createTestUser();

      const ws = await createTestWorkspace(owner.user.id);
      const project = await createTestProject(ws.id);

      const response = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set(outsider.authHeader)
        .send({
          title: 'Intruder Task',
          priority: TaskPriority.MEDIUM,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/tasks/:taskId/status and PATCH /api/tasks/:taskId/priority', () => {
    it('should update task status to IN_PROGRESS and DONE', async () => {
      const user = await createTestUser();
      const ws = await createTestWorkspace(user.user.id);
      const project = await createTestProject(ws.id);

      const task = await prisma.task.create({
        data: {
          title: 'Status Transition Test',
          projectId: project.id,
          createdById: user.user.id,
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
        },
      });

      const responseInProgress = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .set(user.authHeader)
        .send({ status: TaskStatus.IN_PROGRESS });

      expect(responseInProgress.status).toBe(200);
      expect(responseInProgress.body.status).toBe(TaskStatus.IN_PROGRESS);

      const responseDone = await request(app)
        .patch(`/api/tasks/${task.id}/status`)
        .set(user.authHeader)
        .send({ status: TaskStatus.DONE });

      expect(responseDone.status).toBe(200);
      expect(responseDone.body.status).toBe(TaskStatus.DONE);
    });

    it('should update task priority to CRITICAL', async () => {
      const user = await createTestUser();
      const ws = await createTestWorkspace(user.user.id);
      const project = await createTestProject(ws.id);

      const task = await prisma.task.create({
        data: {
          title: 'Priority Transition Test',
          projectId: project.id,
          createdById: user.user.id,
          status: TaskStatus.TODO,
          priority: TaskPriority.LOW,
        },
      });

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/priority`)
        .set(user.authHeader)
        .send({ priority: TaskPriority.CRITICAL });

      expect(response.status).toBe(200);
      expect(response.body.priority).toBe(TaskPriority.CRITICAL);
    });
  });

  describe('Anti-IDOR Security Defenses', () => {
    it('should forbid member of Workspace A from accessing or mutating tasks in Workspace B', async () => {
      const userA = await createTestUser();
      const userB = await createTestUser();

      await createTestWorkspace(userA.user.id, 'Workspace Alpha');
      const wsB = await createTestWorkspace(userB.user.id, 'Workspace Beta');

      const projectB = await createTestProject(wsB.id, 'Secret Project Beta');

      const taskB = await prisma.task.create({
        data: {
          title: 'Sensitive Task in Beta',
          projectId: projectB.id,
          createdById: userB.user.id,
          status: TaskStatus.TODO,
          priority: TaskPriority.HIGH,
        },
      });

      // User A attempts to read Task B
      const getResponse = await request(app).get(`/api/tasks/${taskB.id}`).set(userA.authHeader);

      expect(getResponse.status).toBe(403);

      // User A attempts to update status of Task B
      const patchResponse = await request(app)
        .patch(`/api/tasks/${taskB.id}/status`)
        .set(userA.authHeader)
        .send({ status: TaskStatus.DONE });

      expect(patchResponse.status).toBe(403);

      // User A attempts to delete Task B
      const deleteResponse = await request(app)
        .delete(`/api/tasks/${taskB.id}`)
        .set(userA.authHeader);

      expect(deleteResponse.status).toBe(403);

      // Verify task in DB remains untouched
      const taskAfterAttempt = await prisma.task.findUnique({
        where: { id: taskB.id },
      });
      expect(taskAfterAttempt?.status).toBe(TaskStatus.TODO);
    });
  });
});

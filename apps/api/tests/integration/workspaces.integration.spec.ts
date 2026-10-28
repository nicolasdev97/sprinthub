import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { WorkspaceRole } from '@prisma/client';
import app from '../../src/app';
import { prisma } from '../../src/database';
import { truncateDatabase, disconnectDatabase } from './helpers/db.helper';
import { createTestUser, createTestWorkspace, addMemberToWorkspace } from './helpers/auth.helper';

describe('Workspaces & RBAC Integration Tests (/api/workspaces)', () => {
  beforeEach(async () => {
    await truncateDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /api/workspaces', () => {
    it('should create workspace, assign creator as OWNER, and return 201', async () => {
      const { user, authHeader } = await createTestUser();

      const payload = {
        name: 'SprintHub Dev Team',
        description: 'Core development workspace',
      };

      const response = await request(app)
        .post('/api/workspaces')
        .set(authHeader)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(payload.name);
      expect(response.body.ownerId).toBe(user.id);

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: response.body.id,
            userId: user.id,
          },
        },
      });

      expect(membership).not.toBeNull();
      expect(membership?.role).toBe(WorkspaceRole.OWNER);
    });

    it('should return 401 if request is unauthenticated', async () => {
      const response = await request(app)
        .post('/api/workspaces')
        .send({ name: 'Anonymous WS' });

      expect(response.status).toBe(401);
    });

    it('should return 409 if workspace name already exists', async () => {
      const { user, authHeader } = await createTestUser();
      await createTestWorkspace(user.id, 'Duplicate Name');

      const response = await request(app)
        .post('/api/workspaces')
        .set(authHeader)
        .send({ name: 'Duplicate Name' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/workspaces', () => {
    it('should return only workspaces where user has membership', async () => {
      const userA = await createTestUser();
      const userB = await createTestUser();

      const wsA = await createTestWorkspace(userA.user.id, 'Workspace A');
      await createTestWorkspace(userB.user.id, 'Workspace B');

      const response = await request(app)
        .get('/api/workspaces')
        .set(userA.authHeader);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(wsA.id);
    });
  });

  describe('POST /api/workspaces/:workspaceId/members', () => {
    it('should allow ADMIN to add a new member and return 201', async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();
      const targetUser = await createTestUser();

      const ws = await createTestWorkspace(owner.user.id);
      await addMemberToWorkspace(ws.id, admin.user.id, WorkspaceRole.ADMIN);

      const response = await request(app)
        .post(`/api/workspaces/${ws.id}/members`)
        .set(admin.authHeader)
        .send({
          email: targetUser.user.email,
          role: 'MEMBER',
        });

      expect(response.status).toBe(201);
      expect(response.body.userId).toBe(targetUser.user.id);
      expect(response.body.role).toBe(WorkspaceRole.MEMBER);
    });

    it('should forbid MEMBER from adding new members and return 403', async () => {
      const owner = await createTestUser();
      const regularMember = await createTestUser();
      const targetUser = await createTestUser();

      const ws = await createTestWorkspace(owner.user.id);
      await addMemberToWorkspace(ws.id, regularMember.user.id, WorkspaceRole.MEMBER);

      const response = await request(app)
        .post(`/api/workspaces/${ws.id}/members`)
        .set(regularMember.authHeader)
        .send({
          email: targetUser.user.email,
          role: 'MEMBER',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Insufficient workspace permissions');
    });
  });

  describe('PATCH /api/workspaces/:workspaceId/members/:memberId', () => {
    it('should allow OWNER to update a member role to ADMIN and return 200', async () => {
      const owner = await createTestUser();
      const member = await createTestUser();
      const ws = await createTestWorkspace(owner.user.id);
      const membership = await addMemberToWorkspace(ws.id, member.user.id, WorkspaceRole.MEMBER);

      const response = await request(app)
        .patch(`/api/workspaces/${ws.id}/members/${membership.id}`)
        .set(owner.authHeader)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe(WorkspaceRole.ADMIN);
    });

    it('should forbid ADMIN from updating member roles and return 403', async () => {
      const owner = await createTestUser();
      const admin = await createTestUser();
      const member = await createTestUser();
      const ws = await createTestWorkspace(owner.user.id);

      await addMemberToWorkspace(ws.id, admin.user.id, WorkspaceRole.ADMIN);
      const membership = await addMemberToWorkspace(ws.id, member.user.id, WorkspaceRole.MEMBER);

      const response = await request(app)
        .patch(`/api/workspaces/${ws.id}/members/${membership.id}`)
        .set(admin.authHeader)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/workspaces/:workspaceId/transfer-ownership', () => {
    it('should atomically transfer ownership and degrade former owner to ADMIN', async () => {
      const owner = await createTestUser();
      const candidate = await createTestUser();
      const ws = await createTestWorkspace(owner.user.id);
      await addMemberToWorkspace(ws.id, candidate.user.id, WorkspaceRole.ADMIN);

      const response = await request(app)
        .post(`/api/workspaces/${ws.id}/transfer-ownership`)
        .set(owner.authHeader)
        .send({ newOwnerId: candidate.user.id });

      expect(response.status).toBe(200);

      const updatedWs = await prisma.workspace.findUnique({
        where: { id: ws.id },
      });
      expect(updatedWs?.ownerId).toBe(candidate.user.id);

      const oldOwnerMembership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: ws.id,
            userId: owner.user.id,
          },
        },
      });
      expect(oldOwnerMembership?.role).toBe(WorkspaceRole.ADMIN);

      const newOwnerMembership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: ws.id,
            userId: candidate.user.id,
          },
        },
      });
      expect(newOwnerMembership?.role).toBe(WorkspaceRole.OWNER);
    });

    it('should reject transfer ownership if candidate is not a member of the workspace', async () => {
      const owner = await createTestUser();
      const stranger = await createTestUser();
      const ws = await createTestWorkspace(owner.user.id);

      const response = await request(app)
        .post(`/api/workspaces/${ws.id}/transfer-ownership`)
        .set(owner.authHeader)
        .send({ newOwnerId: stranger.user.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('must be a member');
    });
  });
});


import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  requireWorkspaceRole,
  requireProjectAccess,
} from '../../../src/middleware/rbac/rbac.middleware';
import { prisma } from '../../../src/database';
import { AppError } from '../../../src/shared/errors';

describe('RBAC Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.restoreAllMocks();
    req = {
      user: { userId: 'usr-1' },
      params: {},
      query: {},
      body: {},
    };
    res = {};
    next = vi.fn();
  });

  describe('requireWorkspaceRole', () => {
    it('should throw 401 if req.user is missing', async () => {
      delete req.user;
      req.params = { workspaceId: 'ws-1' };

      const middleware = requireWorkspaceRole('MEMBER');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should throw 400 if workspaceId is missing from params, query, and body', async () => {
      const middleware = requireWorkspaceRole('MEMBER');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Workspace ID is required');
    });

    it('should throw 404 if workspace does not exist', async () => {
      req.params = { workspaceId: 'non-existent' };
      vi.spyOn(prisma.workspace, 'findUnique').mockResolvedValue(null as never);

      const middleware = requireWorkspaceRole('MEMBER');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Workspace not found');
    });

    it('should throw 403 if user is not a member of the workspace', async () => {
      req.params = { workspaceId: 'ws-1' };
      vi.spyOn(prisma.workspace, 'findUnique').mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-other',
      } as never);
      vi.spyOn(prisma.workspaceMember, 'findUnique').mockResolvedValue(null as never);

      const middleware = requireWorkspaceRole('MEMBER');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden: You are not a member of this workspace');
    });

    it('should throw 403 if user role rank is lower than required minRole', async () => {
      req.params = { workspaceId: 'ws-1' };
      vi.spyOn(prisma.workspace, 'findUnique').mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-other',
      } as never);
      vi.spyOn(prisma.workspaceMember, 'findUnique').mockResolvedValue({
        id: 'mem-1',
        workspaceId: 'ws-1',
        userId: 'usr-1',
        role: 'MEMBER',
      } as never);

      // Requires ADMIN, but user is MEMBER
      const middleware = requireWorkspaceRole('ADMIN');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('Insufficient workspace permissions');
    });

    it('should call next() and attach workspaceId and workspaceMember when authorized', async () => {
      req.params = { workspaceId: 'ws-1' };
      vi.spyOn(prisma.workspace, 'findUnique').mockResolvedValue({
        id: 'ws-1',
        ownerId: 'usr-1',
      } as never);
      const member = {
        id: 'mem-1',
        workspaceId: 'ws-1',
        userId: 'usr-1',
        role: 'OWNER',
      };
      vi.spyOn(prisma.workspaceMember, 'findUnique').mockResolvedValue(member as never);

      const middleware = requireWorkspaceRole('ADMIN');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.workspaceId).toBe('ws-1');
      expect(req.workspaceMember).toEqual(member);
    });
  });

  describe('requireProjectAccess', () => {
    it('should throw 404 with IDOR protection if project does not belong to contextual workspace', async () => {
      req.params = { projectId: 'proj-1', workspaceId: 'ws-context-a' };
      vi.spyOn(prisma.project, 'findUnique').mockResolvedValue({
        id: 'proj-1',
        workspaceId: 'ws-different-b',
      } as never);

      const middleware = requireProjectAccess('MEMBER');
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = (next as any).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(404);
    });
  });
});

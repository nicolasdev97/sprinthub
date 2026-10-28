import { NextFunction, Request, Response } from 'express';
import { WorkspaceRole } from '@prisma/client';

import { prisma } from '../../database';
import { AppError } from '../../shared';

export type RoleLevel = WorkspaceRole | 'VIEWER';

const ROLE_HIERARCHY: Record<RoleLevel, number> = {
  OWNER: 40,
  ADMIN: 30,
  MEMBER: 20,
  VIEWER: 10,
};

/**
 * Middleware: Verify user membership and role hierarchy in the requested workspace.
 * Resolves workspaceId from req.params, req.query, or req.body.
 */
export function requireWorkspaceRole(minRole: RoleLevel = 'MEMBER') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const rawWorkspaceId =
        req.params.workspaceId || req.query.workspaceId || req.body?.workspaceId;
      const workspaceId = typeof rawWorkspaceId === 'string' ? rawWorkspaceId : undefined;

      if (!workspaceId) {
        throw new AppError('Workspace ID is required', 400);
      }

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, ownerId: true },
      });

      if (!workspace) {
        throw new AppError('Workspace not found', 404);
      }

      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (!member) {
        throw new AppError('Forbidden: You are not a member of this workspace', 403);
      }

      const userRank = ROLE_HIERARCHY[member.role as RoleLevel] ?? 0;
      const requiredRank = ROLE_HIERARCHY[minRole] ?? 0;

      if (userRank < requiredRank) {
        throw new AppError('Forbidden: Insufficient workspace permissions for this action', 403);
      }

      req.workspaceId = workspaceId;
      req.workspaceMember = member;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware: Verify project access and workspace membership with IDOR prevention.
 * Resolves projectId from req.params, req.query, or req.body.
 */
export function requireProjectAccess(minRole: RoleLevel = 'MEMBER') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const rawProjectId = req.params.projectId || req.query.projectId || req.body?.projectId;
      const projectId = typeof rawProjectId === 'string' ? rawProjectId : undefined;

      if (!projectId) {
        throw new AppError('Project ID is required', 400);
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new AppError('Project not found', 404);
      }

      // IDOR defense: If contextual workspaceId is also provided, ensure project belongs to it
      const contextualWorkspaceId = req.params.workspaceId || req.query.workspaceId;
      if (
        contextualWorkspaceId &&
        typeof contextualWorkspaceId === 'string' &&
        project.workspaceId !== contextualWorkspaceId
      ) {
        throw new AppError('Project not found', 404);
      }

      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: project.workspaceId,
            userId,
          },
        },
      });

      if (!member) {
        throw new AppError('Forbidden: You are not a member of this project workspace', 403);
      }

      const userRank = ROLE_HIERARCHY[member.role as RoleLevel] ?? 0;
      const requiredRank = ROLE_HIERARCHY[minRole] ?? 0;

      if (userRank < requiredRank) {
        throw new AppError('Forbidden: Insufficient permissions for this project action', 403);
      }

      req.project = project;
      req.workspaceId = project.workspaceId;
      req.workspaceMember = member;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware: Verify task access, project parentage, and workspace permissions with IDOR prevention.
 * Resolves taskId from req.params.taskId.
 */
export function requireTaskAccess(minRole: RoleLevel = 'MEMBER') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('Authentication required', 401);
      }

      const taskId = req.params.taskId;
      if (!taskId || typeof taskId !== 'string') {
        throw new AppError('Task ID is required', 400);
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      });

      if (!task || !task.project) {
        throw new AppError('Task not found', 404);
      }

      // IDOR defense: If contextual projectId is also provided, verify strict ownership
      const contextualProjectId = req.params.projectId || req.query.projectId;
      if (
        contextualProjectId &&
        typeof contextualProjectId === 'string' &&
        task.projectId !== contextualProjectId
      ) {
        throw new AppError('Task not found', 404);
      }

      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: task.project.workspaceId,
            userId,
          },
        },
      });

      if (!member) {
        throw new AppError('Forbidden: You are not a member of this task workspace', 403);
      }

      const userRank = ROLE_HIERARCHY[member.role as RoleLevel] ?? 0;
      const requiredRank = ROLE_HIERARCHY[minRole] ?? 0;

      if (userRank < requiredRank) {
        throw new AppError('Forbidden: Insufficient permissions for this task action', 403);
      }

      req.task = task;
      req.project = task.project;
      req.workspaceId = task.project.workspaceId;
      req.workspaceMember = member;

      next();
    } catch (error) {
      next(error);
    }
  };
}

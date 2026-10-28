import { prisma } from '../../../src/database';
import { hashPassword, generateToken } from '../../../src/shared';
import { WorkspaceRole, ProjectStatus } from '@prisma/client';

let userCounter = 0;

export async function createTestUser(overrides: Partial<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}> = {}) {
  userCounter++;
  const firstName = overrides.firstName ?? `Test`;
  const lastName = overrides.lastName ?? `User${userCounter}`;
  const email = overrides.email ?? `user_${userCounter}_${Date.now()}@example.com`;
  const rawPassword = overrides.password ?? 'Secret123!';
  const passwordHash = await hashPassword(rawPassword);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
    },
  });

  const token = generateToken({ userId: user.id });

  return {
    user,
    token,
    rawPassword,
    authHeader: { Authorization: `Bearer ${token}` },
  };
}

export async function createTestWorkspace(ownerId: string, name?: string) {
  const wsName = name ?? `Workspace_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const workspace = await prisma.workspace.create({
    data: {
      name: wsName,
      ownerId,
      members: {
        create: {
          userId: ownerId,
          role: WorkspaceRole.OWNER,
          joinedAt: new Date(),
        },
      },
    },
    include: {
      members: true,
    },
  });

  return workspace;
}

export async function addMemberToWorkspace(workspaceId: string, userId: string, role: WorkspaceRole = WorkspaceRole.MEMBER) {
  return prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId,
      role,
      joinedAt: new Date(),
    },
  });
}

export async function createTestProject(workspaceId: string, name?: string) {
  return prisma.project.create({
    data: {
      workspaceId,
      name: name ?? `Project_${Date.now()}`,
      status: ProjectStatus.PLANNING,
    },
  });
}


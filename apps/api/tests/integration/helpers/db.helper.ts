import { prisma } from '../../../src/database';

export async function truncateDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Task", "Project", "WorkspaceMember", "Workspace", "RefreshToken", "Notification", "User" CASCADE;
  `);
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}


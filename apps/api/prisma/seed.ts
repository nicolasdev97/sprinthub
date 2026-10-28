import { PrismaClient, WorkspaceRole, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting SprintHub database seed...');

  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // 1. Create Default Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sprinthub.dev' },
    update: { passwordHash },
    create: {
      email: 'admin@sprinthub.dev',
      firstName: 'Jane',
      lastName: 'Admin',
      passwordHash,
    },
  });

  const devUser = await prisma.user.upsert({
    where: { email: 'dev@sprinthub.dev' },
    update: { passwordHash },
    create: {
      email: 'dev@sprinthub.dev',
      firstName: 'Alex',
      lastName: 'Developer',
      passwordHash,
    },
  });

  console.log(`👤 Users seeded:`);
  console.log(`   - Admin:     ${adminUser.email} (Password: Password123!)`);
  console.log(`   - Developer: ${devUser.email} (Password: Password123!)`);

  // 2. Create Default Workspace
  let workspace = await prisma.workspace.findUnique({
    where: { name: 'SprintHub Engineering' },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'SprintHub Engineering',
        description: 'Primary engineering workspace for core platform development and sprint tracking.',
        ownerId: adminUser.id,
        members: {
          create: [
            {
              userId: adminUser.id,
              role: WorkspaceRole.OWNER,
              joinedAt: new Date(),
            },
            {
              userId: devUser.id,
              role: WorkspaceRole.MEMBER,
              joinedAt: new Date(),
            },
          ],
        },
      },
    });
  }

  console.log(`🏢 Workspace seeded: ${workspace.name} (ID: ${workspace.id})`);

  // 3. Create Default Project
  let project = await prisma.project.findFirst({
    where: {
      workspaceId: workspace.id,
      name: 'Core Platform Roadmap',
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Core Platform Roadmap',
        description: 'Tracking major platform milestones, security hardening, and releases.',
        status: ProjectStatus.ACTIVE,
      },
    });
  }

  console.log(`📁 Project seeded: ${project.name} (ID: ${project.id})`);

  // 4. Seed Tasks across Kanban statuses
  const tasksData = [
    {
      title: 'Automated Testing Suite (Unit, Integration & E2E)',
      description: 'Achieve 100% critical flow coverage across API and Web clients.',
      status: TaskStatus.DONE,
      priority: TaskPriority.CRITICAL,
      assigneeId: adminUser.id,
      completedAt: new Date(),
    },
    {
      title: 'OpenAPI 3.0 & Swagger UI Integration',
      description: 'Serve interactive API documentation at /api/docs with Zod and Prisma parity.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: devUser.id,
      completedAt: new Date(),
    },
    {
      title: 'Docker Compose Multi-Container Orchestration',
      description: 'Configure production-ready container builds for API, Web, and PostgreSQL.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: devUser.id,
    },
    {
      title: 'Real-time Cross-Tab Event Synchronization',
      description: 'Validate Server-Sent Events (SSE) reconnect resiliency and cache eviction.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: devUser.id,
    },
    {
      title: 'Enterprise Audit Logs and Activity Streams',
      description: 'Design immutable activity logging for workspace and task operations.',
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.LOW,
      assigneeId: null,
    },
  ];

  for (const task of tasksData) {
    const existing = await prisma.task.findFirst({
      where: {
        projectId: project.id,
        title: task.title,
      },
    });

    if (!existing) {
      await prisma.task.create({
        data: {
          projectId: project.id,
          createdById: adminUser.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assigneeId: task.assigneeId,
          completedAt: task.completedAt ?? null,
        },
      });
    }
  }

  console.log(`📋 Sample Kanban tasks seeded: ${tasksData.length} items`);

  // 5. Seed Notification
  const existingNotification = await prisma.notification.findFirst({
    where: { userId: devUser.id },
  });

  if (!existingNotification) {
    await prisma.notification.create({
      data: {
        userId: devUser.id,
        title: 'Welcome to SprintHub!',
        message: 'You have been added to the SprintHub Engineering workspace.',
        isRead: false,
      },
    });
  }

  console.log('🔔 Notifications seeded.');
  console.log('✅ SprintHub database seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

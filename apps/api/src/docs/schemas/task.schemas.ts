export const taskSchemas = {
  TaskStatus: {
    type: 'string',
    enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
    example: 'IN_PROGRESS',
  },
  TaskPriority: {
    type: 'string',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  },
  Task: {
    type: 'object',
    required: ['id', 'projectId', 'title', 'status', 'priority', 'createdAt', 'updatedAt'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      projectId: {
        type: 'string',
        format: 'uuid',
        example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      },
      createdById: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      assigneeId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      title: {
        type: 'string',
        example: 'Implement OpenAPI 3.0 Interactive Documentation',
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Setup Swagger UI on /api/docs with full request/response schemas.',
      },
      status: {
        $ref: '#/components/schemas/TaskStatus',
      },
      priority: {
        $ref: '#/components/schemas/TaskPriority',
      },
      dueDate: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2026-11-01T18:00:00.000Z',
      },
      completedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: null,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-28T12:00:00.000Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-28T12:00:00.000Z',
      },
      assignee: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'uuid', example: '4fa85f64-5717-4562-b3fc-2c963f66afa6' },
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
        },
      },
      createdBy: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string', format: 'uuid', example: '4fa85f64-5717-4562-b3fc-2c963f66afa6' },
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
        },
      },
    },
  },
  CreateTaskRequest: {
    type: 'object',
    required: ['title', 'priority'],
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        example: 'Implement OpenAPI 3.0 Interactive Documentation',
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Setup Swagger UI on /api/docs with full request/response schemas.',
      },
      assigneeId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      priority: {
        $ref: '#/components/schemas/TaskPriority',
      },
      dueDate: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2026-11-01T18:00:00.000Z',
      },
    },
  },
  UpdateTaskRequest: {
    type: 'object',
    description: 'At least one field is required',
    properties: {
      title: {
        type: 'string',
        minLength: 1,
        example: 'Refactor Task Schema to support OpenAPI',
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Updated task description',
      },
      dueDate: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2026-11-05T18:00:00.000Z',
      },
    },
  },
  AssignTaskRequest: {
    type: 'object',
    required: ['assigneeId'],
    properties: {
      assigneeId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
        description: 'User ID of the member to assign, or null to unassign',
      },
    },
  },
  UpdateTaskStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        $ref: '#/components/schemas/TaskStatus',
      },
    },
  },
  UpdateTaskPriorityRequest: {
    type: 'object',
    required: ['priority'],
    properties: {
      priority: {
        $ref: '#/components/schemas/TaskPriority',
      },
    },
  },
};

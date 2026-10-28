export const projectSchemas = {
  ProjectStatus: {
    type: 'string',
    enum: ['PLANNING', 'ACTIVE', 'COMPLETED'],
    example: 'ACTIVE',
  },
  Project: {
    type: 'object',
    required: ['id', 'workspaceId', 'name', 'status', 'archived', 'createdAt', 'updatedAt'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      },
      workspaceId: {
        type: 'string',
        format: 'uuid',
        example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      },
      name: {
        type: 'string',
        example: 'SprintHub Web & API',
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Core platform monorepo containing API and Web frontend.',
      },
      status: {
        $ref: '#/components/schemas/ProjectStatus',
      },
      archived: {
        type: 'boolean',
        example: false,
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
    },
  },
  CreateProjectRequest: {
    type: 'object',
    required: ['name', 'status'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        example: 'SprintHub Web & API',
      },
      description: {
        type: 'string',
        maxLength: 1000,
        nullable: true,
        example: 'Core platform monorepo containing API and Web frontend.',
      },
      status: {
        $ref: '#/components/schemas/ProjectStatus',
      },
    },
  },
  UpdateProjectRequest: {
    type: 'object',
    description: 'At least one field is required',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        example: 'SprintHub Web & API - Refactored',
      },
      description: {
        type: 'string',
        maxLength: 1000,
        nullable: true,
        example: 'Updated project description',
      },
      status: {
        $ref: '#/components/schemas/ProjectStatus',
      },
    },
  },
  ArchiveProjectRequest: {
    type: 'object',
    required: ['archived'],
    properties: {
      archived: {
        type: 'boolean',
        example: true,
      },
    },
  },
};

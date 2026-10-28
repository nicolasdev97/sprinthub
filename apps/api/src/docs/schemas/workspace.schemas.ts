export const workspaceSchemas = {
  WorkspaceRole: {
    type: 'string',
    enum: ['OWNER', 'ADMIN', 'MEMBER'],
    example: 'OWNER',
  },
  Workspace: {
    type: 'object',
    required: ['id', 'ownerId', 'name', 'createdAt', 'updatedAt'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      },
      ownerId: {
        type: 'string',
        format: 'uuid',
        example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      name: {
        type: 'string',
        example: 'Engineering Core',
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Main workspace for core engineering and development sprints.',
      },
      role: {
        $ref: '#/components/schemas/WorkspaceRole',
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
  WorkspaceMember: {
    type: 'object',
    required: ['id', 'workspaceId', 'userId', 'role', 'joinedAt', 'user'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'b5f00e99-0d32-4e94-b2c6-3023bf73f8e5',
      },
      workspaceId: {
        type: 'string',
        format: 'uuid',
        example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      role: {
        $ref: '#/components/schemas/WorkspaceRole',
      },
      joinedAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-28T12:00:00.000Z',
      },
      user: {
        type: 'object',
        required: ['id', 'firstName', 'lastName', 'email'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
          },
          firstName: {
            type: 'string',
            example: 'Jane',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane.doe@example.com',
          },
        },
      },
    },
  },
  CreateWorkspaceRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        example: 'Engineering Core',
      },
      description: {
        type: 'string',
        maxLength: 500,
        nullable: true,
        example: 'Main workspace for core engineering and development sprints.',
      },
    },
  },
  UpdateWorkspaceRequest: {
    type: 'object',
    description: 'At least one field is required',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        example: 'Engineering Core - EMEA',
      },
      description: {
        type: 'string',
        maxLength: 500,
        nullable: true,
        example: 'Updated workspace description',
      },
    },
  },
  AddWorkspaceMemberRequest: {
    type: 'object',
    required: ['email', 'role'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'colleague@example.com',
      },
      role: {
        type: 'string',
        enum: ['ADMIN', 'MEMBER'],
        example: 'MEMBER',
      },
    },
  },
  UpdateWorkspaceMemberRoleRequest: {
    type: 'object',
    required: ['role'],
    properties: {
      role: {
        type: 'string',
        enum: ['ADMIN', 'MEMBER'],
        example: 'ADMIN',
      },
    },
  },
  TransferWorkspaceOwnershipRequest: {
    type: 'object',
    required: ['newOwnerId'],
    properties: {
      newOwnerId: {
        type: 'string',
        format: 'uuid',
        example: '5fa85f64-5717-4562-b3fc-2c963f66afa7',
        description: 'UUID of an active workspace member to become the new owner',
      },
    },
  },
};


export const userSchemas = {
  UserProfile: {
    type: 'object',
    required: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'updatedAt'],
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
  UpdateUserRequest: {
    type: 'object',
    description: 'At least one field is required',
    properties: {
      firstName: {
        type: 'string',
        example: 'Jane',
        description: 'Updated first name',
      },
      lastName: {
        type: 'string',
        example: 'Smith',
        description: 'Updated last name',
      },
    },
  },
  DeleteUserRequest: {
    type: 'object',
    required: ['confirmationName'],
    properties: {
      confirmationName: {
        type: 'string',
        example: 'Jane Doe',
        description: 'User full name required to verify intentional account deletion',
      },
    },
  },
};


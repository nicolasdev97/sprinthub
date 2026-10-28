export const usersPaths = {
  '/api/users/me': {
    get: {
      tags: ['Users'],
      summary: 'Get current user profile',
      description: 'Retrieves the authenticated user information.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Current user profile retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfile',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'User not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    patch: {
      tags: ['Users'],
      summary: 'Update current user profile',
      description: 'Updates personal details (firstName, lastName) for the authenticated user.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateUserRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User profile updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserProfile',
              },
            },
          },
        },
        400: {
          description: 'Validation error (no fields provided or invalid formats)',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete current user account',
      description:
        'Deletes the user account permanently. Requires exact confirmation name matching user full name.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/DeleteUserRequest',
            },
          },
        },
      },
      responses: {
        204: {
          description: 'User account permanently deleted',
        },
        400: {
          description: 'Confirmation name does not match user name or validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
};

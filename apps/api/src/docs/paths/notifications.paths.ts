export const notificationsPaths = {
  '/api/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'Get user notifications',
      description:
        'Retrieves in-app notifications for the authenticated user, ordered by creation date descending.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of notifications',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Notification',
                },
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
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
  '/api/notifications/{notificationId}/read': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark notification as read',
      description:
        'Sets isRead=true for the target notification belonging to the authenticated user.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'notificationId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      responses: {
        200: {
          description: 'Notification marked as read',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Notification',
              },
            },
          },
        },
        400: {
          description: 'Validation error (invalid notificationId format)',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
            },
          },
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Notification not found or does not belong to user',
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

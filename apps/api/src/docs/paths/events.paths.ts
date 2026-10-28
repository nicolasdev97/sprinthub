export const eventsPaths = {
  '/api/events': {
    get: {
      tags: ['Notifications'],
      summary: 'Subscribe to real-time events (SSE)',
      description:
        'Establishes a persistent Server-Sent Events (SSE) connection for instant live notifications, task status updates, and workspace events.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'SSE stream established',
          content: {
            'text/event-stream': {
              schema: {
                type: 'string',
                example:
                  'data: {"type":"CONNECTED","userId":"4fa85f64-5717-4562-b3fc-2c963f66afa6"}\n\n',
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
};

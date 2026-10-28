export const notificationSchemas = {
  Notification: {
    type: 'object',
    required: ['id', 'userId', 'title', 'message', 'isRead', 'createdAt'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '5fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '4fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      title: {
        type: 'string',
        example: 'Task Assigned',
      },
      message: {
        type: 'string',
        example: "You have been assigned to task 'Implement OpenAPI Documentation'",
      },
      isRead: {
        type: 'boolean',
        example: false,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-28T12:00:00.000Z',
      },
    },
  },
};

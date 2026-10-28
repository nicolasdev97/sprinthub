export const tasksPaths = {
  '/api/projects/{projectId}/tasks': {
    post: {
      tags: ['Tasks'],
      summary: 'Create a new task',
      description: 'Creates a task within a project. Requires MEMBER access to the project.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'projectId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateTaskRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Task created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Task',
              },
            },
          },
        },
        400: {
          description: 'Validation error',
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
        403: {
          description: 'Forbidden - User is not a member of this project',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        409: {
          description: 'Task title must be unique within the project',
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
    get: {
      tags: ['Tasks'],
      summary: 'List tasks in project',
      description:
        'Retrieves all tasks in the specified project, supporting filters by status, priority, assignee, due date, sorting, and search.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'projectId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: {
            $ref: '#/components/schemas/TaskStatus',
          },
        },
        {
          name: 'priority',
          in: 'query',
          required: false,
          schema: {
            $ref: '#/components/schemas/TaskPriority',
          },
        },
        {
          name: 'assigneeId',
          in: 'query',
          required: false,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
        {
          name: 'dueDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date-time',
          },
        },
        {
          name: 'sortBy',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['createdAt', 'dueDate', 'priority', 'title'],
          },
        },
        {
          name: 'sortOrder',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
          },
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        200: {
          description: 'List of tasks',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Task',
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
        403: {
          description: 'Forbidden',
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
  '/api/tasks/{taskId}': {
    get: {
      tags: ['Tasks'],
      summary: 'Get task by ID',
      description: 'Retrieves task details including creator and assignee. Requires MEMBER access.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'taskId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      responses: {
        200: {
          description: 'Task details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Task',
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
        403: {
          description: 'Forbidden - User cannot access this task',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Task not found',
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
      tags: ['Tasks'],
      summary: 'Update task',
      description: 'Updates task title, description, or due date. Requires MEMBER access.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'taskId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateTaskRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Task updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Task',
              },
            },
          },
        },
        400: {
          description: 'Validation error',
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
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Task not found',
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
      tags: ['Tasks'],
      summary: 'Delete task',
      description: 'Permanently deletes a task. Requires MEMBER access.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'taskId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      responses: {
        204: {
          description: 'Task deleted successfully',
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
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Task not found',
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
  '/api/tasks/{taskId}/assign': {
    patch: {
      tags: ['Tasks'],
      summary: 'Assign or unassign task',
      description:
        'Sets or clears the assignee for the specified task. Emits a notification to the assignee if changed.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'taskId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AssignTaskRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Task assignee updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Task',
              },
            },
          },
        },
        400: {
          description: 'Assignee is not a member of the workspace or validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
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
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Task not found',
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
  '/api/tasks/{taskId}/status': {
    patch: {
      tags: ['Tasks'],
      summary: 'Update task status',
      description:
        'Moves task between statuses (BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE). Sets completedAt when moving to DONE.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'taskId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateTaskStatusRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Task status updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Task',
              },
            },
          },
        },
        400: {
          description: 'Validation error (invalid status)',
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
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Task not found',
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
  '/api/tasks/{taskId}/priority': {
    patch: {
      tags: ['Tasks'],
      summary: 'Update task priority',
      description: 'Changes task priority (LOW, MEDIUM, HIGH, CRITICAL).',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'taskId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateTaskPriorityRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Task priority updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Task',
              },
            },
          },
        },
        400: {
          description: 'Validation error (invalid priority)',
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
        403: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Task not found',
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

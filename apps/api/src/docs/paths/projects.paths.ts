export const projectsPaths = {
  '/api/workspaces/{workspaceId}/projects': {
    post: {
      tags: ['Projects'],
      summary: 'Create a new project',
      description:
        'Creates a project inside the specified workspace. Requires ADMIN or OWNER role in the workspace.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'workspaceId',
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
              $ref: '#/components/schemas/CreateProjectRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Project created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
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
          description: 'Forbidden - Insufficient permissions in workspace',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        409: {
          description: 'Project with this name already exists in workspace',
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
      tags: ['Projects'],
      summary: 'List projects in workspace',
      description:
        'Retrieves all projects in the workspace with optional filtering by status, archived state, sorting and search.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'workspaceId',
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
            $ref: '#/components/schemas/ProjectStatus',
          },
        },
        {
          name: 'archived',
          in: 'query',
          required: false,
          schema: {
            type: 'boolean',
          },
        },
        {
          name: 'sortBy',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['name', 'createdAt'],
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
          description: 'List of projects',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Project',
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
  '/api/projects/{projectId}': {
    get: {
      tags: ['Projects'],
      summary: 'Get project by ID',
      description: 'Retrieves project details. Requires at least MEMBER role in parent workspace.',
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
      responses: {
        200: {
          description: 'Project details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
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
          description: 'Forbidden - User does not have access to this project',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Project not found',
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
      tags: ['Projects'],
      summary: 'Update project',
      description:
        'Updates project fields (name, description, status). Requires ADMIN or OWNER role.',
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
              $ref: '#/components/schemas/UpdateProjectRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Project updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
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
          description: 'Forbidden - Requires ADMIN or OWNER role',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Project not found',
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
      tags: ['Projects'],
      summary: 'Delete project',
      description:
        'Deletes project and cascades delete for its tasks. Requires ADMIN or OWNER role.',
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
      responses: {
        204: {
          description: 'Project deleted successfully',
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
          description: 'Forbidden - Requires ADMIN or OWNER role',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Project not found',
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
  '/api/projects/{projectId}/archive': {
    patch: {
      tags: ['Projects'],
      summary: 'Archive or unarchive project',
      description: 'Toggles project archived status. Requires ADMIN or OWNER role.',
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
              $ref: '#/components/schemas/ArchiveProjectRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Project archived state updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
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
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Project not found',
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

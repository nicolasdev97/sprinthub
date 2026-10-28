export const workspacesPaths = {
  '/api/workspaces': {
    post: {
      tags: ['Workspaces'],
      summary: 'Create a new workspace',
      description: 'Creates a workspace and assigns the authenticated user as OWNER.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateWorkspaceRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Workspace created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Workspace',
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
        409: {
          description: 'Workspace name already exists',
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
      tags: ['Workspaces'],
      summary: 'List user workspaces',
      description:
        'Retrieves all workspaces where the authenticated user is owner or member, with optional sorting and search.',
      security: [{ bearerAuth: [] }],
      parameters: [
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
          description: 'List of workspaces',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Workspace',
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
  '/api/workspaces/{workspaceId}': {
    get: {
      tags: ['Workspaces'],
      summary: 'Get workspace by ID',
      description: 'Retrieves workspace details. Requires at least MEMBER role.',
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
      responses: {
        200: {
          description: 'Workspace details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Workspace',
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
          description: 'Forbidden - User is not a member of this workspace',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Workspace not found',
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
      tags: ['Workspaces'],
      summary: 'Update workspace',
      description: 'Updates workspace details. Requires OWNER role.',
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
              $ref: '#/components/schemas/UpdateWorkspaceRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Workspace updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Workspace',
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
          description: 'Forbidden - Only OWNER can update workspace',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Workspace not found',
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
      tags: ['Workspaces'],
      summary: 'Delete workspace',
      description: 'Cascades delete for workspace and related projects/tasks. Requires OWNER role.',
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
      responses: {
        204: {
          description: 'Workspace deleted successfully',
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
          description: 'Forbidden - Only OWNER can delete workspace',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        404: {
          description: 'Workspace not found',
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
  '/api/workspaces/{workspaceId}/members': {
    get: {
      tags: ['Workspaces'],
      summary: 'List workspace members',
      description: 'Retrieves all members of the specified workspace. Requires MEMBER role.',
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
      responses: {
        200: {
          description: 'List of members',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/WorkspaceMember',
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
    post: {
      tags: ['Workspaces'],
      summary: 'Add member to workspace',
      description:
        'Invites or adds a user by email with ADMIN or MEMBER role. Requires ADMIN or OWNER role.',
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
              $ref: '#/components/schemas/AddWorkspaceMemberRequest',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Member added successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WorkspaceMember',
              },
            },
          },
        },
        400: {
          description: 'Validation error or user already a member',
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
      },
    },
  },
  '/api/workspaces/{workspaceId}/members/{memberId}': {
    patch: {
      tags: ['Workspaces'],
      summary: 'Update workspace member role',
      description: 'Changes a member role between ADMIN and MEMBER. Requires OWNER role.',
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
          name: 'memberId',
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
              $ref: '#/components/schemas/UpdateWorkspaceMemberRoleRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Member role updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WorkspaceMember',
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
          description: 'Forbidden - Only OWNER can alter roles',
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
      tags: ['Workspaces'],
      summary: 'Remove member or leave workspace',
      description:
        'Removes a member from the workspace, or allows a member to leave. Workspace owner cannot be removed.',
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
          name: 'memberId',
          in: 'path',
          required: true,
          schema: {
            $ref: '#/components/schemas/UuidParam',
          },
        },
      ],
      responses: {
        204: {
          description: 'Member removed or left workspace',
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
          description: 'Forbidden - Insufficient permissions to remove this member',
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
  '/api/workspaces/{workspaceId}/transfer-ownership': {
    post: {
      tags: ['Workspaces'],
      summary: 'Transfer workspace ownership',
      description:
        'Transfers OWNER role to another active member. Previous owner retains ADMIN role. Requires current OWNER.',
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
              $ref: '#/components/schemas/TransferWorkspaceOwnershipRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Ownership transferred successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Workspace',
              },
            },
          },
        },
        400: {
          description: 'Target user is not a valid workspace member or validation error',
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
          description: 'Forbidden - Only OWNER can transfer ownership',
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

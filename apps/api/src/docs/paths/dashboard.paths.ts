export const dashboardPaths = {
  '/api/workspaces/{workspaceId}/dashboard': {
    get: {
      tags: ['Metrics'],
      summary: 'Get workspace dashboard metrics',
      description:
        'Calculates project, task, and completion metrics for the given workspace. Requires MEMBER access.',
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
          description: 'Workspace metrics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WorkspaceDashboardMetrics',
              },
            },
          },
        },
        400: {
          description: 'Validation error (invalid workspaceId format)',
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
          description: 'Forbidden - User does not have access to this workspace',
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
};

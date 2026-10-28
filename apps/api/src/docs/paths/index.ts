import { authPaths } from './auth.paths';
import { usersPaths } from './users.paths';
import { workspacesPaths } from './workspaces.paths';
import { projectsPaths } from './projects.paths';
import { tasksPaths } from './tasks.paths';
import { dashboardPaths } from './dashboard.paths';
import { notificationsPaths } from './notifications.paths';
import { eventsPaths } from './events.paths';

export const healthPaths = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Service health check',
      description: 'Confirms that SprintHub API is running and able to serve incoming requests.',
      responses: {
        200: {
          description: 'API is running and healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'message'],
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'SprintHub API is running',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const allPaths = {
  ...healthPaths,
  ...authPaths,
  ...usersPaths,
  ...workspacesPaths,
  ...projectsPaths,
  ...tasksPaths,
  ...dashboardPaths,
  ...notificationsPaths,
  ...eventsPaths,
};

export const dashboardSchemas = {
  WorkspaceDashboardMetrics: {
    type: 'object',
    required: ['totalProjects', 'activeProjects', 'pendingTasks', 'completedTasks', 'overdueTasks'],
    properties: {
      totalProjects: {
        type: 'integer',
        example: 5,
        description: 'Total number of projects within the workspace',
      },
      activeProjects: {
        type: 'integer',
        example: 3,
        description: 'Number of projects in ACTIVE status',
      },
      pendingTasks: {
        type: 'integer',
        example: 14,
        description: 'Number of tasks currently pending or in progress',
      },
      completedTasks: {
        type: 'integer',
        example: 28,
        description: 'Number of completed tasks (DONE status)',
      },
      overdueTasks: {
        type: 'integer',
        example: 2,
        description: 'Number of tasks that have passed their due date without being completed',
      },
    },
  },
};

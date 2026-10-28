import { allSchemas } from './schemas';
import { allPaths } from './paths';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SprintHub REST API',
    version: '1.0.0',
    description:
      'SprintHub Enterprise API documentation. Built with Node.js, Express, TypeScript, Prisma, and PostgreSQL. Adheres to Controller -> Service -> Repository architectural patterns with strict RBAC contextual security.',
    contact: {
      name: 'SprintHub Engineering Team',
      url: 'https://github.com/nicolaspalacio/sprinthub',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment API Server',
    },
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'API health and readiness verification',
    },
    {
      name: 'Auth',
      description:
        'Authentication endpoints: registration, login, token refresh, and session revocation',
    },
    {
      name: 'Users',
      description: 'User profile management and account deletion',
    },
    {
      name: 'Workspaces',
      description:
        'Workspace lifecycle, member roles (OWNER, ADMIN, MEMBER), and ownership transfer',
    },
    {
      name: 'Projects',
      description: 'Project management, filtering, and archival within workspaces',
    },
    {
      name: 'Tasks',
      description:
        'Task board and Kanban operations: assignment, status progression, and priority updates',
    },
    {
      name: 'Metrics',
      description: 'Aggregated analytics and workspace dashboard metrics',
    },
    {
      name: 'Notifications',
      description: 'In-app notification management and real-time Server-Sent Events (SSE)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token issued upon login or token refresh.',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly cookie utilized by the token refresh workflow.',
      },
    },
    schemas: allSchemas,
  },
  paths: allPaths,
};

export default openApiSpec;

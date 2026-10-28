import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import { openApiSpec } from '../../../src/docs/openapi';

describe('Swagger & OpenAPI Documentation Module', () => {
  it('should expose the raw OpenAPI 3.0 JSON specification at /api/docs.json', async () => {
    const response = await request(app).get('/api/docs.json');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.info.title).toBe('SprintHub REST API');
    expect(response.body.paths).toHaveProperty('/api/auth/login');
    expect(response.body.paths).toHaveProperty('/api/workspaces');
    expect(response.body.paths).toHaveProperty('/api/tasks/{taskId}');
  });

  it('should expose the interactive Swagger UI at /api/docs', async () => {
    const response = await request(app).get('/api/docs/');

    // Swagger UI serves HTML on /api/docs/ (or 301 redirect from /api/docs to /api/docs/)
    expect([200, 301]).toContain(response.status);
    if (response.status === 200) {
      expect(response.text).toContain('swagger-ui');
    }
  });

  it('should properly configure bearerAuth and cookieAuth security schemes', () => {
    expect(openApiSpec.components.securitySchemes).toHaveProperty('bearerAuth');
    expect(openApiSpec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
    expect(openApiSpec.components.securitySchemes).toHaveProperty('cookieAuth');
    expect(openApiSpec.components.securitySchemes.cookieAuth.name).toBe('refreshToken');
  });

  it('should declare all core resource tags', () => {
    const tagNames = openApiSpec.tags.map((t) => t.name);
    expect(tagNames).toEqual(
      expect.arrayContaining([
        'Auth',
        'Users',
        'Workspaces',
        'Projects',
        'Tasks',
        'Metrics',
        'Notifications',
        'Health',
      ])
    );
  });
});

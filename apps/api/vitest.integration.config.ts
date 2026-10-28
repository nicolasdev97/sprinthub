import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/sprinthub_test',
      JWT_SECRET: 'test-jwt-secret-key-for-integration-tests-only',
      JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-key-for-integration',
      NODE_ENV: 'test',
    },
    include: ['tests/integration/**/*.integration.spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    clearMocks: true,
  },
});

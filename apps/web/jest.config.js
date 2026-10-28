const path = require('path');
const nextJest = require('next/jest');

const reactPath = path.dirname(require.resolve('react'));
const reactDomPath = path.dirname(require.resolve('react-dom'));

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react$': reactPath,
    '^react-dom$': reactDomPath,
    '^react-dom/(.*)$': `${reactDomPath}/$1`,
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.spec.[jt]s?(x)',
    '<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);

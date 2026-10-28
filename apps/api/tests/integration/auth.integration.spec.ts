import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database';
import { truncateDatabase, disconnectDatabase } from './helpers/db.helper';
import { createTestUser } from './helpers/auth.helper';

describe('Auth Integration Tests (/api/auth)', () => {
  beforeEach(async () => {
    await truncateDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return 201', async () => {
      const payload = {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        password: 'Password123!',
      };

      const response = await request(app).post('/api/auth/register').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(payload.email);
      expect(response.body.firstName).toBe(payload.firstName);
      expect(response.body.lastName).toBe(payload.lastName);
      expect(response.body).not.toHaveProperty('passwordHash');

      const userInDb = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      expect(userInDb).not.toBeNull();
      expect(userInDb?.passwordHash).not.toBe(payload.password);
    });

    it('should reject registration when validation fails and return 400', async () => {
      const invalidPayload = {
        firstName: '',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app).post('/api/auth/register').send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('body.');
    });

    it('should reject registration with duplicate email and return 409', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      const duplicatePayload = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'Password123!',
      };

      const response = await request(app).post('/api/auth/register').send(duplicatePayload);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return 200 with tokens and HttpOnly cookie', async () => {
      const email = 'login.user@example.com';
      const rawPassword = 'ValidPassword123!';
      await createTestUser({ email, password: rawPassword });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: rawPassword });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(email);
      expect(response.body.user).not.toHaveProperty('passwordHash');

      const cookies = response.headers['set-cookie'] || [];
      const hasRefreshTokenCookie = cookies.some((c: string) => c.includes('refreshToken='));
      const hasSessionCookie = cookies.some((c: string) => c.includes('sprinthub_session='));

      expect(hasRefreshTokenCookie).toBe(true);
      expect(hasSessionCookie).toBe(true);
    });

    it('should reject login with wrong password and return 401', async () => {
      const email = 'login.user2@example.com';
      await createTestUser({ email, password: 'CorrectPassword123!' });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'WrongPassword999!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should reject login for non-existent user and return 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return a new access token when a valid refresh token cookie is provided', async () => {
      const { user, rawPassword } = await createTestUser();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: rawPassword });

      const cookies = loginRes.headers['set-cookie'];

      const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body).toHaveProperty('accessToken');
    });

    it('should return 401 if refresh token cookie is missing', async () => {
      const response = await request(app).post('/api/auth/refresh');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should revoke refresh token in database, clear cookies, and return 204', async () => {
      const { user, rawPassword } = await createTestUser();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: rawPassword });

      const cookies = loginRes.headers['set-cookie'];

      const tokensBefore = await prisma.refreshToken.count({
        where: { userId: user.id },
      });
      expect(tokensBefore).toBe(1);

      const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookies);

      expect(logoutRes.status).toBe(204);

      const tokensAfter = await prisma.refreshToken.count({
        where: { userId: user.id },
      });
      expect(tokensAfter).toBe(0);

      const responseCookies = logoutRes.headers['set-cookie'] || [];
      expect(responseCookies.some((c: string) => c.includes('refreshToken=;'))).toBe(true);
    });
  });
});

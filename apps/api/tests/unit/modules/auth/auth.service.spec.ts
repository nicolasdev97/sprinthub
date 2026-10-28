import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../../../src/modules/auth/service/auth.service';

import { AppError } from '../../../../src/shared/errors';
import * as shared from '../../../../src/shared';

vi.mock('../../../../src/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../src/shared')>();
  return {
    ...actual,
    hashPassword: vi.fn(),
    comparePassword: vi.fn(),
    generateToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    hashRefreshToken: vi.fn(),
  };
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthRepository = {
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
      createRefreshToken: vi.fn(),
      getRefreshTokenByHash: vi.fn(),
      deleteRefreshToken: vi.fn(),
    };

    authService = new AuthService(mockAuthRepository);
  });

  describe('register', () => {
    const registerDto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should throw 409 if user email already exists', async () => {
      mockAuthRepository.getUserByEmail.mockResolvedValue({ id: 'usr-1' });

      await expect(authService.register(registerDto)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already exists',
      });
      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });

    it('should hash password and create a user successfully', async () => {
      mockAuthRepository.getUserByEmail.mockResolvedValue(null);
      vi.mocked(shared.hashPassword).mockResolvedValue('hashed-pass' as never);
      mockAuthRepository.createUser.mockResolvedValue({
        id: 'usr-new',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        passwordHash: 'hashed-pass',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.register(registerDto);

      expect(shared.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith({
        ...registerDto,
        passwordHash: 'hashed-pass',
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('usr-new');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should throw 401 if user does not exist', async () => {
      mockAuthRepository.getUserByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('should throw 401 if password does not match', async () => {
      mockAuthRepository.getUserByEmail.mockResolvedValue({
        id: 'usr-1',
        passwordHash: 'hashed-pw',
      });
      vi.mocked(shared.comparePassword).mockResolvedValue(false as never);

      await expect(authService.login(loginDto)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should generate tokens and return user without passwordHash upon valid credentials', async () => {
      const user = {
        id: 'usr-1',
        email: loginDto.email,
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed-pw',
      };
      mockAuthRepository.getUserByEmail.mockResolvedValue(user);
      vi.mocked(shared.comparePassword).mockResolvedValue(true as never);
      vi.mocked(shared.generateToken).mockReturnValue('mock-access-token');
      vi.mocked(shared.generateRefreshToken).mockReturnValue('mock-refresh-token');
      vi.mocked(shared.hashRefreshToken).mockReturnValue('mock-refresh-hash');

      const result = await authService.login(loginDto);

      expect(shared.generateToken).toHaveBeenCalledWith({ userId: user.id });
      expect(mockAuthRepository.createRefreshToken).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('refreshAccessToken', () => {
    it('should throw 401 if refresh token is not found in database', async () => {
      vi.mocked(shared.hashRefreshToken).mockReturnValue('hash-1');
      mockAuthRepository.getRefreshTokenByHash.mockResolvedValue(null);

      await expect(authService.refreshAccessToken('tok-1')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw 401 if refresh token is expired', async () => {
      vi.mocked(shared.hashRefreshToken).mockReturnValue('hash-1');
      const expiredDate = new Date(Date.now() - 100000);
      mockAuthRepository.getRefreshTokenByHash.mockResolvedValue({
        id: 'rt-1',
        expiresAt: expiredDate,
      });

      await expect(authService.refreshAccessToken('tok-1')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should generate a new access token if refresh token is valid', async () => {
      vi.mocked(shared.hashRefreshToken).mockReturnValue('hash-1');
      const futureDate = new Date(Date.now() + 100000);
      mockAuthRepository.getRefreshTokenByHash.mockResolvedValue({
        id: 'rt-1',
        userId: 'usr-1',
        expiresAt: futureDate,
      });
      vi.mocked(shared.generateToken).mockReturnValue('new-access-token');

      const result = await authService.refreshAccessToken('tok-1');

      expect(result.accessToken).toBe('new-access-token');
    });
  });

  describe('logout', () => {
    it('should delete refresh token when found', async () => {
      vi.mocked(shared.hashRefreshToken).mockReturnValue('hash-1');
      mockAuthRepository.getRefreshTokenByHash.mockResolvedValue({
        id: 'rt-1',
      });

      await authService.logout('tok-1');

      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith('rt-1');
    });

    it('should throw 401 if refresh token is not in database', async () => {
      vi.mocked(shared.hashRefreshToken).mockReturnValue('hash-1');
      mockAuthRepository.getRefreshTokenByHash.mockResolvedValue(null);

      await expect(authService.logout('tok-1')).rejects.toThrow(AppError);
    });
  });
});

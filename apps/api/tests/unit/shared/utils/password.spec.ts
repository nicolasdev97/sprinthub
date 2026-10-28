import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from '../../../../src/shared/utils/password';

describe('Password Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password with 10 salt rounds', async () => {
      const plainPassword = 'SuperSecretPassword123!';
      const expectedHash = '$2b$10$hashedstringexample';

      const hashSpy = vi
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => expectedHash as never);

      const result = await hashPassword(plainPassword);

      expect(hashSpy).toHaveBeenCalledWith(plainPassword, 10);
      expect(result).toBe(expectedHash);
    });
  });

  describe('comparePassword', () => {
    it('should return true if password matches hash', async () => {
      const plainPassword = 'SuperSecretPassword123!';
      const hash = '$2b$10$hashedstringexample';

      const compareSpy = vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true as never);

      const result = await comparePassword(plainPassword, hash);

      expect(compareSpy).toHaveBeenCalledWith(plainPassword, hash);
      expect(result).toBe(true);
    });

    it('should return false if password does not match hash', async () => {
      const plainPassword = 'WrongPassword';
      const hash = '$2b$10$hashedstringexample';

      const compareSpy = vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false as never);

      const result = await comparePassword(plainPassword, hash);

      expect(compareSpy).toHaveBeenCalledWith(plainPassword, hash);
      expect(result).toBe(false);
    });
  });
});

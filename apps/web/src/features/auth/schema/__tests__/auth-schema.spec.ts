import { loginSchema, registerSchema } from '../auth.schema';

describe('Auth Zod Schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid email and password', () => {
      const valid = {
        email: 'user@example.com',
        password: 'Password123!',
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('should trim and lowercase email', () => {
      const input = {
        email: '  USER@DOMAIN.COM  ',
        password: 'secretPassword',
      };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@domain.com');
      }
    });

    it('should reject invalid email format', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'password',
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject empty fields', () => {
      const result = loginSchema.safeParse({ email: '', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should accept valid registration values when passwords match', () => {
      const valid = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123',
        confirmPassword: 'SecurePassword123',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject when password is less than 8 characters', () => {
      const invalid = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'short',
        confirmPassword: 'short',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessages = result.error.issues.map((i) => i.message);
        expect(errorMessages).toContain('Password must be at least 8 characters');
      }
    });

    it('should reject when confirmPassword does not match password', () => {
      const mismatched = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123',
        confirmPassword: 'DifferentPassword123',
      };
      const result = registerSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmIssue = result.error.issues.find((i) => i.path.includes('confirmPassword'));
        expect(confirmIssue?.message).toBe('Passwords do not match');
      }
    });
  });
});


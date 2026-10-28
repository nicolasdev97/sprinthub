import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeHtml, normalizeEmail } from '../../../../src/shared/utils/sanitizer';

describe('Sanitizer Utilities', () => {
  describe('sanitizeText', () => {
    it('should strip HTML and XML tags from string', () => {
      const malicious = '<script>alert("XSS")</script>Hello <b>World</b><img src=x onerror=alert(1)>';
      const clean = sanitizeText(malicious);
      expect(clean).toBe('alert("XSS")Hello World');
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
    });

    it('should remove null bytes', () => {
      const input = 'hello\0world';
      expect(sanitizeText(input)).toBe('helloworld');
    });

    it('should strip javascript: pseudo-protocols and trim whitespace', () => {
      const input = '  javascript:alert("hacked")  ';
      expect(sanitizeText(input)).toBe('alert("hacked")');
    });

    it('should return non-string input unchanged', () => {
      expect(sanitizeText(123 as any)).toBe(123);
      expect(sanitizeText(null as any)).toBe(null);
    });
  });

  describe('sanitizeHtml', () => {
    it('should strip dangerous tags including their body', () => {
      const input = '<p>Normal text</p><script>alert("hack")</script><iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert("hack")');
      expect(result).not.toContain('<iframe');
      expect(result).toContain('<p>Normal text</p>');
    });

    it('should strip inline event handlers', () => {
      const input = '<div onclick="doEvil()" onmouseover=\'stealCookies()\' onerror=alert(1)>Click me</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('onerror');
      expect(result).toContain('<div>Click me</div>');
    });
  });

  describe('normalizeEmail', () => {
    it('should trim and lowercase email address', () => {
      expect(normalizeEmail('  USER@Domain.COM  ')).toBe('user@domain.com');
      expect(normalizeEmail('Test.Account+tag@GMAIL.com')).toBe('test.account+tag@gmail.com');
    });

    it('should return non-string inputs safely', () => {
      expect(normalizeEmail(undefined as any)).toBe(undefined);
    });
  });
});

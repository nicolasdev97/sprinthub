import { NextFunction, Request, Response } from 'express';

import { normalizeEmail, sanitizeText } from '../../shared/utils/sanitizer';

function sanitizeDeep<T>(value: T, keyName?: string): T {
  if (typeof value === 'string') {
    if (keyName && keyName.toLowerCase().includes('email')) {
      return normalizeEmail(value) as unknown as T;
    }
    // Do not sanitize passwords (passwords must retain literal special characters like <, >, &)
    if (keyName && keyName.toLowerCase().includes('password')) {
      return value.replace(/\0/g, '') as unknown as T;
    }
    return sanitizeText(value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item, keyName)) as unknown as T;
  }

  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const cleanObject: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      cleanObject[key] = sanitizeDeep(val, key);
    }
    return cleanObject as unknown as T;
  }

  return value;
}

/**
 * Pre-validation middleware that deeply cleans inputs in req.body and req.query,
 * removing null-byte injection, stripping malicious HTML/script tags, and normalizing emails.
 */
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeDeep(req.body);
    }

    // In Express 5, req.query is a getter; mutate properties directly instead of reassigning req.query
    if (req.query && typeof req.query === 'object') {
      for (const [key, val] of Object.entries(req.query)) {
        req.query[key] = sanitizeDeep(val, key) as Request['query'][string];
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Strips HTML and XML tags from a string, strips null bytes, and trims whitespace.
 * Prevents persistent XSS and markup injection in text fields.
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  return (
    input
      // Remove null bytes
      .replace(/\0/g, '')
      // Strip HTML/XML tags
      .replace(/<\/?[^>]+(>|$)/gi, '')
      // Strip common dangerous JS pseudo-protocols if left unbracketed
      .replace(/javascript:/gi, '')
      .trim()
  );
}

/**
 * Sanitizes rich or multiline text by stripping executable script/iframe/object tags
 * while preserving safe characters.
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  return (
    input
      .replace(/\0/g, '')
      // Strip script, style, iframe, object, embed, applet tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      // Strip inline event handlers like onload=, onerror=, onclick=
      .replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      // Strip javascript: URLs
      .replace(/javascript:[^"'\s]*/gi, '')
      .trim()
  );
}

/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return email;
  }

  return email.trim().toLowerCase();
}

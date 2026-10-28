export const SESSION_COOKIE_NAME = 'sprinthub_session';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const DEFAULT_AUTHENTICATED_REDIRECT = '/dashboard';

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Checks whether the lightweight client session indicator cookie is present.
 * Note: The actual refreshToken is stored in an HttpOnly cookie managed by the API,
 * while the short-lived accessToken is kept strictly in memory to mitigate XSS theft.
 */
export function hasClientSessionCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.cookie
    .split(';')
    .some((item) => item.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
}

/**
 * Sets the client-side session indicator cookie with secure attributes.
 */
export function setClientSessionCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const isSecure =
    (typeof window !== 'undefined' && window.location.protocol === 'https:') ||
    process.env.NODE_ENV === 'production';

  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${SESSION_COOKIE_NAME}=active; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;
}

/**
 * Clears the client-side session indicator cookie immediately.
 */
export function clearClientSessionCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const isSecure =
    (typeof window !== 'undefined' && window.location.protocol === 'https:') ||
    process.env.NODE_ENV === 'production';

  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
}

/**
 * Validates and sanitizes a redirect path to prevent Open Redirect vulnerabilities.
 * Only allows internal relative paths starting with a single `/` and not pointing to auth pages.
 */
export function getSafeRedirectPath(
  redirectParam: string | null | undefined,
  fallback: string = DEFAULT_AUTHENTICATED_REDIRECT
): string {
  if (!redirectParam || typeof redirectParam !== 'string') {
    return fallback;
  }

  const trimmed = redirectParam.trim();

  // Must start with a single slash and not be a protocol-relative URL (e.g. //evil.com)
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  // Prevent redirect loops back into guest auth routes
  if (trimmed.startsWith('/login') || trimmed.startsWith('/register')) {
    return fallback;
  }

  return trimmed;
}


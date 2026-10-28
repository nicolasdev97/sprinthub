import { NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_AUTHENTICATED_REDIRECT,
  getSafeRedirectPath,
  SESSION_COOKIE_NAME,
} from '@/features/auth/utils/session-cookie';

const PROTECTED_ROUTE_PREFIXES = ['/workspaces', '/projects', '/tasks', '/dashboard', '/profile'];
const AUTH_GUEST_ROUTES = ['/login', '/register'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isGuestAuthRoute(pathname: string): boolean {
  return AUTH_GUEST_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function hasActiveSessionCookie(request: NextRequest): boolean {
  const sessionIndicator = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return sessionIndicator === 'active';
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = hasActiveSessionCookie(request);

  // 1. Protect private application routes: redirect unauthenticated users to /login?redirect=<original_url>
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    const originalDestination = `${pathname}${search}`;
    loginUrl.searchParams.set('redirect', originalDestination);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Prevent authenticated users from visiting /login or /register
  if (isGuestAuthRoute(pathname) && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetPath = getSafeRedirectPath(redirectParam, DEFAULT_AUTHENTICATED_REDIRECT);
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (.png, .jpg, .jpeg, .gif, .svg, .webp, .ico)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
};

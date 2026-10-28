import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { clearClientSessionCookie } from '@/features/auth/utils/session-cookie';
import { ApiErrorResponse, normalizeApiError } from '@/shared/errors';

type AccessTokenListener = (token: string | null) => void;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

const DEFAULT_API_URL = 'http://localhost:3001/api';
const REQUEST_TIMEOUT_MS = 15_000;

const AUTH_BYPASS_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

let accessToken: string | null = null;
const listeners = new Set<AccessTokenListener>();

let isRefreshing = false;
let isRedirectingToLogin = false;
let failedRequestsQueue: QueuedRequest[] = [];

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  if (token) {
    isRedirectingToLogin = false;
  }
  listeners.forEach((listener) => listener(token));
};

export const subscribeAccessToken = (listener: AccessTokenListener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

function processQueue(error: unknown, token: string | null = null): void {
  failedRequestsQueue.forEach((pending) => {
    if (error || !token) {
      pending.reject(error);
    } else {
      pending.resolve(token);
    }
  });

  failedRequestsQueue = [];
}

function shouldBypassRefresh(url?: string): boolean {
  if (!url) return false;
  return AUTH_BYPASS_PATHS.some((path) => url.includes(path));
}

function handleUnauthorizedSessionExpiry(): void {
  clearClientSessionCookie();
  setAccessToken(null);

  if (typeof window === 'undefined' || isRedirectingToLogin) {
    return;
  }

  const { pathname, search } = window.location;
  const isPublicOrAuthRoute =
    pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register');

  if (!isPublicOrAuthRoute) {
    isRedirectingToLogin = true;
    const redirectTarget = encodeURIComponent(`${pathname}${search}`);
    window.location.replace(`/login?redirect=${redirectTarget}`);
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    `[httpClient] NEXT_PUBLIC_API_URL is not defined. Falling back to "${DEFAULT_API_URL}".`
  );
}

export const httpClient = axios.create({
  baseURL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

httpClient.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(normalizeApiError(error))
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldBypassRefresh(originalRequest.url)
    ) {
      return Promise.reject(normalizeApiError(error));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject });
      }).then((newToken) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return httpClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<{ accessToken: string }>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true, timeout: REQUEST_TIMEOUT_MS }
      );

      const newToken = response.data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return httpClient(originalRequest);
    } catch (refreshError) {
      const normalized = normalizeApiError(refreshError);
      handleUnauthorizedSessionExpiry();
      processQueue(normalized, null);
      return Promise.reject(normalized);
    } finally {
      isRefreshing = false;
    }
  }
);

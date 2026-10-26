import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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
let failedRequestsQueue: QueuedRequest[] = [];

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
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
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return httpClient(originalRequest);
        })
        .catch((queueError) => Promise.reject(normalizeApiError(queueError)));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await httpClient.post<{ accessToken: string }>('/auth/refresh');
      const newAccessToken = response.data.accessToken;

      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return httpClient(originalRequest);
    } catch (refreshError) {
      const normalizedRefreshError = normalizeApiError(refreshError);
      setAccessToken(null);
      processQueue(normalizedRefreshError, null);

      return Promise.reject(normalizedRefreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

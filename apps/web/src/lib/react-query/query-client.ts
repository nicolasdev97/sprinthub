import { QueryClient } from '@tanstack/react-query';

import { AppApiError, normalizeApiError } from '@/shared/errors';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppApiError;
  }
}

const MAX_QUERY_RETRIES = 2;

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false;
  }

  const apiError = normalizeApiError(error);

  if (apiError.statusCode >= 400 && apiError.statusCode < 500) {
    return false;
  }

  return apiError.isNetworkError || apiError.isServerError;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: shouldRetryQuery,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export const queryClient = createQueryClient();

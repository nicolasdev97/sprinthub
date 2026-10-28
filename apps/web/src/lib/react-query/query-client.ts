import { QueryClient } from '@tanstack/react-query';

import { AppApiError, normalizeApiError } from '@/shared/errors';
import { deletedEntities } from '@/shared/utils';

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

  // Never retry client errors (404 Not Found, 403 Forbidden, 401 Unauthorized, etc.)
  if (apiError.statusCode >= 400 && apiError.statusCode < 500) {
    return false;
  }

  return apiError.isNetworkError || apiError.isServerError;
}

function shouldRefetchOnWindowFocusOrReconnect(query: {
  queryKey: readonly unknown[];
  state: { data: unknown; error: unknown; status: string };
}): boolean {
  // Never refetch queries associated with deleted entities
  if (deletedEntities.isQueryKeyDeleted(query.queryKey)) {
    return false;
  }

  // Never refetch queries whose data has been explicitly set to null
  if (query.state.data === null) {
    return false;
  }

  // Never refetch queries that resulted in a 404 Not Found
  if (query.state.error) {
    const apiError = normalizeApiError(query.state.error);
    if (
      apiError.statusCode === 404 ||
      apiError.statusCode === 403 ||
      apiError.message.toLowerCase().includes('not found') ||
      apiError.message.toLowerCase().includes('forbidden') ||
      apiError.message.toLowerCase().includes('not a member')
    ) {
      return false;
    }
  }

  return true;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: shouldRefetchOnWindowFocusOrReconnect,
        refetchOnReconnect: shouldRefetchOnWindowFocusOrReconnect,
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

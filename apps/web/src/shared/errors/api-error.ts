import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

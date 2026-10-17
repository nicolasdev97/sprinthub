import axios from 'axios';

export type FieldErrors = Record<string, string[]>;

export interface BackendValidationIssue {
  field?: string;
  path?: (string | number)[];
  message: string;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
  errors?: FieldErrors | BackendValidationIssue[] | string[];
}

export class AppApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: FieldErrors;
  public readonly rawErrors?: ApiErrorResponse['errors'];
  public readonly isNetworkError: boolean;

  constructor({
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    errors,
    rawErrors,
    isNetworkError = false,
  }: {
    message: string;
    statusCode?: number;
    code?: string;
    errors?: FieldErrors;
    rawErrors?: ApiErrorResponse['errors'];
    isNetworkError?: boolean;
  }) {
    super(message);
    this.name = 'AppApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.rawErrors = rawErrors;
    this.isNetworkError = isNetworkError;

    Object.setPrototypeOf(this, AppApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isValidationError(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  get isConflict(): boolean {
    return this.statusCode === 409;
  }

  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

function normalizeFieldErrors(rawErrors?: ApiErrorResponse['errors']): FieldErrors | undefined {
  if (!rawErrors) return undefined;

  if (!Array.isArray(rawErrors) && typeof rawErrors === 'object') {
    return rawErrors as FieldErrors;
  }

  if (Array.isArray(rawErrors)) {
    const fieldMap: FieldErrors = {};

    for (const item of rawErrors) {
      if (typeof item === 'string') {
        fieldMap._form = [...(fieldMap._form ?? []), item];
      } else if (item && typeof item === 'object' && 'message' in item) {
        const key =
          item.field ||
          (Array.isArray(item.path) && item.path.length > 0 ? item.path.join('.') : '_form');
        fieldMap[key] = [...(fieldMap[key] ?? []), item.message];
      }
    }

    return Object.keys(fieldMap).length > 0 ? fieldMap : undefined;
  }

  return undefined;
}

function resolveStatusCodeName(status?: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'TOO_MANY_REQUESTS';
    default:
      return status && status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR';
  }
}

export function normalizeApiError(error: unknown): AppApiError {
  if (error instanceof AppApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED';
      return new AppApiError({
        message: isTimeout
          ? 'Request timed out. Please check your connection and try again.'
          : 'Unable to connect to the server. Please check your internet connection.',
        statusCode: 0,
        code: isTimeout ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
        isNetworkError: true,
      });
    }

    const message =
      data?.message ||
      (status === 401
        ? 'Your session has expired or you are not authorized.'
        : status === 403
          ? 'You do not have permission to perform this action.'
          : status === 404
            ? 'The requested resource was not found.'
            : status === 429
              ? 'Too many requests. Please wait a moment and try again.'
              : status && status >= 500
                ? 'An internal server error occurred. Please try again later.'
                : error.message || 'An unexpected error occurred.');

    return new AppApiError({
      message,
      statusCode: status ?? 500,
      code: data?.code ?? resolveStatusCodeName(status),
      errors: normalizeFieldErrors(data?.errors),
      rawErrors: data?.errors,
      isNetworkError: false,
    });
  }

  if (error instanceof Error) {
    return new AppApiError({
      message: error.message || 'An unexpected error occurred.',
      statusCode: 500,
      code: 'CLIENT_ERROR',
    });
  }

  return new AppApiError({
    message: 'An unexpected error occurred.',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
  });
}

export function isAppApiError(error: unknown): error is AppApiError {
  return error instanceof AppApiError;
}

export function getApiErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}

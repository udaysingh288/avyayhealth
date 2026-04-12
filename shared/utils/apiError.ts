/** Centralized API error handling. */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Convert any caught error into a user-friendly message. */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Session expired. Please log in again.';
    if (error.status === 403) return 'Access denied.';
    if (error.status >= 500) return 'Something went wrong on our end. Please try again.';
    return error.message;
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'No internet connection. Please check your connection and try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

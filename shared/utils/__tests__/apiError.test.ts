import { describe, it, expect } from 'vitest';
import { ApiError, handleApiError } from '../apiError';

describe('ApiError', () => {
  it('creates an error with status and message', () => {
    const error = new ApiError(404, 'Not found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not found');
  });

  it('has name set to ApiError', () => {
    const error = new ApiError(500, 'Server error');
    expect(error.name).toBe('ApiError');
  });

  it('is an instance of Error', () => {
    const error = new ApiError(400, 'Bad request');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('handleApiError', () => {
  it('returns session expired message for 401', () => {
    const error = new ApiError(401, 'Unauthorized');
    expect(handleApiError(error)).toBe('Session expired. Please log in again.');
  });

  it('returns access denied message for 403', () => {
    const error = new ApiError(403, 'Forbidden');
    expect(handleApiError(error)).toBe('Access denied.');
  });

  it('returns server error message for 500', () => {
    const error = new ApiError(500, 'Internal Server Error');
    expect(handleApiError(error)).toBe('Something went wrong on our end. Please try again.');
  });

  it('returns server error message for 502', () => {
    const error = new ApiError(502, 'Bad Gateway');
    expect(handleApiError(error)).toBe('Something went wrong on our end. Please try again.');
  });

  it('returns server error message for 503', () => {
    const error = new ApiError(503, 'Service Unavailable');
    expect(handleApiError(error)).toBe('Something went wrong on our end. Please try again.');
  });

  it('returns the error message for other ApiError status codes', () => {
    const error = new ApiError(422, 'Invalid patient ID');
    expect(handleApiError(error)).toBe('Invalid patient ID');
  });

  it('returns internet connection message for fetch failures', () => {
    const error = new TypeError('Failed to fetch');
    expect(handleApiError(error)).toBe(
      'No internet connection. Please check your connection and try again.',
    );
  });

  it('returns the message for generic Error instances', () => {
    const error = new Error('Something broke');
    expect(handleApiError(error)).toBe('Something broke');
  });

  it('returns generic fallback for non-Error values', () => {
    expect(handleApiError('string error')).toBe('Something went wrong. Please try again.');
    expect(handleApiError(42)).toBe('Something went wrong. Please try again.');
    expect(handleApiError(null)).toBe('Something went wrong. Please try again.');
    expect(handleApiError(undefined)).toBe('Something went wrong. Please try again.');
  });
});

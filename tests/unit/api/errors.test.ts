import { describe, it, expect } from 'vitest';
import {
  ApiError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  parseApiError,
} from '../../../src/api/errors';

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('creates error with correct properties', () => {
      const error = new ApiError(500, 'server_error', 'api_error', 'Internal error');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('server_error');
      expect(error.type).toBe('api_error');
      expect(error.message).toBe('Internal error');
      expect(error.name).toBe('ApiError');
    });

    it('is instanceof Error', () => {
      const error = new ApiError(500, 'server_error', 'api_error', 'Internal error');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('RateLimitError', () => {
    it('creates error with retry after', () => {
      const error = new RateLimitError(60);

      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
    });

    it('accepts custom message', () => {
      const error = new RateLimitError(30, 'Too many requests');

      expect(error.retryAfter).toBe(30);
      expect(error.message).toBe('Too many requests');
    });
  });

  describe('NotFoundError', () => {
    it('creates error with default message', () => {
      const error = new NotFoundError();

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('accepts custom message', () => {
      const error = new NotFoundError('Project not found');

      expect(error.message).toBe('Project not found');
    });
  });

  describe('ValidationError', () => {
    it('creates error with validation errors array', () => {
      const errors = [
        { field: 'name', message: 'Required' },
        { field: 'email', message: 'Invalid format' },
      ];
      const error = new ValidationError(errors);

      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    it('creates error with default message', () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('AuthorizationError', () => {
    it('creates error with default message', () => {
      const error = new AuthorizationError();

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access forbidden');
      expect(error.name).toBe('AuthorizationError');
    });
  });
});

describe('parseApiError', () => {
  it('returns RateLimitError for 429', () => {
    const error = parseApiError(429, { error: 'Rate limited' }, 60);

    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(60);
  });

  it('returns NotFoundError for 404', () => {
    const error = parseApiError(404, { error: 'Not found' });

    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('returns AuthenticationError for 401', () => {
    const error = parseApiError(401, { error: 'Invalid token' });

    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Invalid token');
  });

  it('returns AuthorizationError for 403', () => {
    const error = parseApiError(403, { error: 'Forbidden' });

    expect(error).toBeInstanceOf(AuthorizationError);
  });

  it('returns ValidationError for 400', () => {
    const error = parseApiError(400, { error: 'Invalid data' });

    expect(error).toBeInstanceOf(ValidationError);
  });

  it('returns generic ApiError for unknown status', () => {
    const error = parseApiError(500, { message: 'Server error' });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(500);
  });

  it('handles missing error data', () => {
    const error = parseApiError(500, null);

    expect(error.message).toBe('Unknown API error');
  });
});

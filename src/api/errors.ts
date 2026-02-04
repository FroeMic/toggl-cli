export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public type: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class RateLimitError extends ApiError {
  constructor(
    public retryAfter: number,
    message: string = 'Rate limit exceeded'
  ) {
    super(429, 'rate_limit_exceeded', 'rate_limit_error', message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, 'not_found', 'not_found_error', message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(
    public errors: Array<{ field: string; message: string }>,
    message: string = 'Validation error'
  ) {
    super(400, 'validation_error', 'validation_error', message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'authentication_error', 'authentication_error', message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(403, 'authorization_error', 'authorization_error', message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

interface TogglApiErrorResponse {
  error?: string;
  message?: string;
  tip?: string;
}

export function parseApiError(
  statusCode: number,
  data: unknown,
  retryAfter?: number
): ApiError {
  const errorData = data as TogglApiErrorResponse;
  const message =
    errorData?.error || errorData?.message || 'Unknown API error';

  if (statusCode === 429) {
    return new RateLimitError(retryAfter || 60, message);
  }

  if (statusCode === 404) {
    return new NotFoundError(message);
  }

  if (statusCode === 401) {
    return new AuthenticationError(message);
  }

  if (statusCode === 403) {
    return new AuthorizationError(message);
  }

  if (statusCode === 400) {
    // Toggl returns simple error strings for validation errors
    return new ValidationError([], message);
  }

  return new ApiError(statusCode, 'api_error', 'api_error', message);
}

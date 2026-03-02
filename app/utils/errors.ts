import type { ApiErrorResponse } from '~/shared/types/api';

export class AppClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AppClientError';
    this.statusCode = statusCode;
  }
}

export const parseApiError = (error: unknown): ApiErrorResponse => {
  if (typeof error === 'object' && error !== null && 'statusCode' in error && 'error' in error) {
    return error as ApiErrorResponse;
  }

  return {
    success: false,
    error: 'Something went wrong. Please try again.',
    statusCode: 500
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppClientError) {
    return error.message;
  }

  return parseApiError(error).error;
};

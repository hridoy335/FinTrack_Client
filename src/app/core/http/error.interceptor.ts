import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApiResponse } from '../models';

/** Maps HTTP / API failures to a plain Error with a user-facing message. */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => throwError(() => toAppError(err)))
  );

export function toAppError(err: unknown): Error {
  if (err instanceof Error && !(err instanceof HttpErrorResponse)) {
    return err;
  }

  if (err instanceof HttpErrorResponse) {
    const body = err.error as ApiResponse<unknown> | string | null;

    if (body && typeof body === 'object' && typeof body.message === 'string' && body.message) {
      return new Error(body.message);
    }

    if (err.status === 0) {
      return new Error('Cannot reach the server. Is the API running?');
    }

    if (err.status === 401) {
      return new Error('Session expired. Please sign in again.');
    }

    if (err.status >= 500) {
      return new Error('Server error. Please try again later.');
    }

    return new Error(err.message || 'Request failed.');
  }

  return new Error('Something went wrong.');
}

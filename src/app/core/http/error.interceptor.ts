import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApiResponse } from '../api.model';

const GENERIC_CONFLICT =
  'The request conflicts with the current state.';

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
    const apiMessage =
      body && typeof body === 'object' && typeof body.message === 'string' && body.message.trim()
        ? body.message.trim()
        : null;

    // Login failures must show credentials message, not "session expired".
    if (err.status === 401 && isAuthLoginRequest(err.url)) {
      return new Error(apiMessage || 'Invalid email or password.');
    }

    // Prefer specific API messages (e.g. duplicate email).
    if (apiMessage && !isGenericConflictMessage(apiMessage)) {
      return new Error(apiMessage);
    }

    if (err.status === 0) {
      return new Error('Cannot reach the server. Is the API running?');
    }

    if (err.status === 404) {
      return new Error(
        'API not found. Start the backend on http://localhost:5027 (http launch profile).'
      );
    }

    if (err.status === 401) {
      return new Error('Session expired. Please sign in again.');
    }

    if (err.status === 409) {
      return new Error(meaningfulConflictMessage(err.url, apiMessage));
    }

    if (err.status >= 500) {
      return new Error('Server error. Please try again later.');
    }

    return new Error(apiMessage || err.message || 'Request failed.');
  }

  return new Error('Something went wrong.');
}

function isAuthLoginRequest(url: string | null): boolean {
  return !!url && /\/api\/Auths\/login\b/i.test(url);
}

function isGenericConflictMessage(message: string): boolean {
  return message === GENERIC_CONFLICT || /conflicts with the current state/i.test(message);
}

function meaningfulConflictMessage(url: string | null, apiMessage: string | null): string {
  if (apiMessage && !isGenericConflictMessage(apiMessage)) {
    return apiMessage;
  }

  if (url && /\/api\/UserInfos\b/i.test(url)) {
    return 'An account with this email already exists. Please sign in or use a different email.';
  }

  if (url && /\/api\/Auths\/google\b/i.test(url)) {
    return 'This email is already linked to a different Google account. Sign in with your existing account instead.';
  }

  if (url && /\/api\/Coas\b/i.test(url)) {
    return 'This account cannot be changed right now because it is linked to other records.';
  }

  return 'This action cannot be completed because it conflicts with existing data.';
}

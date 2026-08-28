import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

function isApiRequest(url: string): boolean {
  if (url.startsWith('/api')) {
    return true;
  }

  const base = environment.apiBaseUrl;
  return !!base && url.startsWith(base);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const isApi = isApiRequest(req.url);
  const isPublic = /\/api\/Auths\//.test(req.url) || /\/api\/UserInfos$/.test(req.url);

  const authReq =
    token && isApi && !isPublic
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !isApi || isPublic) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap(() =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${auth.accessToken()}` }
            })
          )
        ),
        catchError(() => {
          auth.logout();
          return throwError(() => error);
        })
      );
    })
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthPath =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/logout');

      if (error.status === 401 && !isAuthPath) {
        return authService.refresh().pipe(
          switchMap((response) => {
            if (response?.data?.accessToken) {
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.data.accessToken}`,
                },
              });
              return next(retryReq);
            }
            authService.logout().subscribe();
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            authService.logout().subscribe();
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};

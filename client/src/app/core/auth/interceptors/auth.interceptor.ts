import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

const AUTH_SKIP_URLS = ['auth/refresh', 'auth/login', 'auth/logout'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthUrl = AUTH_SKIP_URLS.some((url) => req.url.includes(url));

      if (error.status === 401 && !isAuthUrl) {
        // refreshToken() race condition'ı kendi içinde yönetir
        return authService.refreshToken(() => next(authReq));
      }

      return throwError(() => error);
    }),
  );
};

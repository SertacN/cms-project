import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 hatası ve istek refresh/login/logout değilse otomatik refresh dene
      if (
        error.status === 401 &&
        !req.url.includes('auth/refresh') &&
        !req.url.includes('auth/login') &&
        !req.url.includes('auth/logout')
      ) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Başarılı ise asıl isteği tekrar dene
            return next(authReq);
          }),
          catchError((refreshError) => {
            // Refresh de başarısızsa logout yap
            authService.logout().subscribe();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

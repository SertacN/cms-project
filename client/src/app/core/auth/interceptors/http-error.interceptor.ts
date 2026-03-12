import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 403:
          toast.error('Bu işlem için yetkiniz yok');
          break;
        case 500:
        case 502:
        case 503:
          toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
          break;
      }
      return throwError(() => error);
    }),
  );
};

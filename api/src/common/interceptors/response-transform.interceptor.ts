import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceResponse } from 'src/common/types';

export interface TransformedResponse<TData> {
  success: true;
  message: string;
  data?: TData;
  meta?: object;
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<TData>
  implements NestInterceptor<ServiceResponse<TData>, TransformedResponse<TData>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<ServiceResponse<TData>>,
  ): Observable<TransformedResponse<TData>> {
    return next.handle().pipe(
      map((response) => ({
        success: true as const,
        ...response,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

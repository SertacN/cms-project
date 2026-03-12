import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Default Page = 1, Limit = 10
    const page = Math.max(Number(request.query.page) || 1, 1);
    const limit = Math.min(Number(request.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    request.pagination = {
      page,
      limit,
      skip,
      take: limit,
    };

    return next.handle().pipe(
      map((response) => {
        if (!response?.meta?.total) return response;

        return {
          ...response,
          meta: {
            ...response.meta,
            page,
            limit,
            totalPages: Math.ceil(response.meta.total / limit),
          },
        };
      }),
    );
  }
}

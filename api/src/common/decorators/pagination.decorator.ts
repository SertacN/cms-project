import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Pagination } from '../types';

export const PaginationParam = createParamDecorator((_: unknown, ctx: ExecutionContext): Pagination => {
  const request = ctx.switchToHttp().getRequest();
  return request.pagination;
});

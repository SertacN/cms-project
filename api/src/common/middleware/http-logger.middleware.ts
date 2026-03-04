import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const ms = Date.now() - start;
      const message = `${method} ${originalUrl} ${statusCode} +${ms}ms`;

      // 5xx → AllExceptionsFilter zaten detaylı logluyor, burada tekrar etme
      if (statusCode >= 500) return;

      if (statusCode >= 400) {
        this.logger.warn!(message, 'HTTP');
      } else {
        this.logger.log!(message, 'HTTP');
      }
    });

    next();
  }
}

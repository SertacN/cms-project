import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, type LoggerService } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    this.logger.error('Unhandled exception', {
      status,
      method: request.method,
      url: request.originalUrl,
      body: request.body,
      query: request.query,
      params: request.params,
      message: exception instanceof Error ? exception.message : JSON.stringify(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      success: false,
      message,
    });
  }
}

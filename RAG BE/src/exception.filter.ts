import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  NotFoundException
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status, message;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        message = response['message'] || response;
      } else {
        message = response;
      }
    } else if (exception instanceof NotFoundException) {
      status = 404;
      message = 'Resource Not Found';
    } else if (exception instanceof Error) {
      status = 400;
      message = exception.message || exception.name;
    } else {
      status = 500;
      message = 'Internal Server Error';
    }

    if (exception instanceof Error && !(exception instanceof NotFoundException)) {
      this.logger.error(`HTTP Status: ${status} Error Message: ${message}`, exception.stack);
    } else {
      this.logger.error(`HTTP Status: ${status} Error Message: ${message}`);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message
    });
  }
}

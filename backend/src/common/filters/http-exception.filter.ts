import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent: any = exception.getResponse();

      message = exception.message;
      code = exception.name
        .replace('Exception', '')
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()
        .replace(/^_/, '');

      if (typeof resContent === 'object' && resContent !== null) {
        if (resContent.message) {
          if (Array.isArray(resContent.message)) {
            code = 'VALIDATION_ERROR';
            message = 'Invalid input data';
            details = resContent.message;
          } else {
            message = resContent.message;
          }
        }
        if (resContent.code) {
          code = resContent.code;
        }
        if (resContent.details) {
          details = resContent.details;
        }
      }
    } else {
      // Log unhandled error for debug
      console.error('Unhandled Exception:', exception);
      // Optional check for Prisma DB errors
      if (exception?.code) {
        code = `DATABASE_ERROR_${exception.code}`;
        message = 'Database operation failed';
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }
}

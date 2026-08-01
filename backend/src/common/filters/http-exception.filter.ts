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
      
      // Xử lý lỗi validation từ Prisma Client
      if (exception?.name === 'PrismaClientValidationError') {
        status = HttpStatus.BAD_REQUEST;
        code = 'VALIDATION_ERROR';
        message = 'Dữ liệu truyền vào truy vấn cơ sở dữ liệu không hợp lệ.';
      } else if (exception?.code) {
        status = HttpStatus.BAD_REQUEST;
        code = `DATABASE_ERROR_${exception.code}`;
        message = 'Thao tác cơ sở dữ liệu thất bại.';
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

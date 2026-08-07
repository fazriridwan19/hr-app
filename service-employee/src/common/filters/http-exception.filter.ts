import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (
      typeof exceptionResponse === "object" &&
      exceptionResponse !== null &&
      "meta" in (exceptionResponse as Record<string, unknown>)
    ) {
      response.status(status).json(exceptionResponse);
      return;
    }

    let message: string | string[] = exception.message;
    if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      if (resp.message) {
        message = resp.message as string | string[];
      }
    }

    const messageStr = Array.isArray(message) ? message.join(", ") : message;

    const errorResponse = {
      meta: {
        code: status,
        message: messageStr,
      },
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${messageStr}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}

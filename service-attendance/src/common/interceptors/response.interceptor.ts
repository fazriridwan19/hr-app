import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  public constructor(
    private readonly reflector: Reflector,
    private readonly excludePaths: string[] = [],
  ) {}

  public async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<any> {
    const defaultMessageResponse: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      203: 'NonAuthoritativeInfo',
      204: 'NoContent',
      205: 'ResetContent',
      206: 'PartialContent',
    };

    return next
      .handle()
      .pipe(
        catchError((error) => {
          const statusCode =
            error instanceof HttpException
              ? error.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;

          let message =
            error?.message ?? error?.response?.message ?? 'Unexpected error';

          if (message.includes('numeric string is expected')) {
            message = 'Invalid request data';
          }

          return throwError(
            () =>
              new HttpException(
                {
                  meta: {
                    code: statusCode,
                    message: message,
                  },
                },
                statusCode,
              ),
          );
        }),
      )
      .toPromise()
      .then(async (body) => {
        if (body instanceof StreamableFile) {
          return of(body);
        }
        if (body === undefined) {
          return of({ message: null });
        }

        const request = context.switchToHttp().getRequest<Request>();
        if (this.excludePaths.includes(request.url)) {
          return of(body);
        }

        const status =
          this.reflector.get<number>('__httpCode__', context.getHandler()) ||
          (request.method === 'POST' ? 201 : 200);

        let messageResponse: string | null =
          defaultMessageResponse[status] ?? null;

        if (body.messageResponse !== undefined) {
          messageResponse = body.messageResponse;
          delete body.messageResponse;
        }

        let metaBody: Record<string, unknown>;
        if (body.pagination !== undefined) {
          metaBody = {
            code: status,
            message: messageResponse,
            totalData: body.pagination.totalData,
            totalPage: body.pagination.totalPage,
            limit: body.pagination.limit,
            offset: body.pagination.offset,
          };
          delete body.pagination;
        } else if (body.totalData !== undefined) {
          metaBody = {
            code: status,
            message: messageResponse,
            totalData: body.totalData,
          };
          delete body.totalData;
        } else {
          metaBody = {
            code: status,
            message: messageResponse,
          };
        }

        return of({
          meta: metaBody,
          data: body.data !== undefined ? body.data : body,
        });
      });
  }
}

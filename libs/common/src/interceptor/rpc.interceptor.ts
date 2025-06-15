import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable()
export class RpcInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const resp = {
          status: 'success',
          data,
        };
        console.log('RpcInterceptor', resp);

        return resp;
      }),
      catchError((error) => {
        const resp = {
          status: 'error',
          error,
        };
        console.log('RpcInterceptor', resp);

        return throwError(() => new RpcException(error));
      }),
    );
  }
}

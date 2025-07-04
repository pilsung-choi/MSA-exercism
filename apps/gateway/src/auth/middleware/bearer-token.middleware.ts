import { constructMetadata, USER_SERVICE, UserMicroservice } from '@app/common';
import {
  Inject,
  Injectable,
  NestMiddleware,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { NextFunction, Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware, OnModuleInit {
  authService: UserMicroservice.AuthServiceClient;
  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroservice: ClientGrpc,
  ) {}
  onModuleInit() {
    this.authService =
      this.userMicroservice.getService<UserMicroservice.AuthServiceClient>(
        'AuthService',
      );
  }
  async use(req: Request, res: Response, next: NextFunction) {
    // 1) Raw토큰 가져오기
    const token = this.getRawToken(req);

    if (!token) {
      next();
      return;
    }

    // 2) User Auth에 토큰 던지기
    const payload = await this.verifyToken(token);

    // 3) req.user payload 붙이기
    req.user = payload;
    next();
  }

  getRawToken(req: Request): string | null {
    const authHeader = req.headers['authorization'];
    return authHeader;
  }

  async verifyToken(token: string) {
    const result = await lastValueFrom(
      this.authService.parseBearerToken(
        {
          token,
        },
        constructMetadata(BearerTokenMiddleware.name, 'verifyToken'),
      ),
    );

    return result;
  }
}

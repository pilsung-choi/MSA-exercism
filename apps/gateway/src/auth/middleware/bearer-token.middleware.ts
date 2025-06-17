import { USER_SERVICE } from '@app/common';
import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroservice: ClientProxy,
  ) {}
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
      this.userMicroservice.send(
        { cmd: 'parse_bearer_token' },
        {
          token,
        },
      ),
    );

    if (result.status === 'error') {
      throw new UnauthorizedException('토큰 정보가 잘못됐습니다.');
    }

    return result.data;
  }
}

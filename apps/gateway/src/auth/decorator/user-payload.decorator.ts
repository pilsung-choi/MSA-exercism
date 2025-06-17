import { UserPayloadDto } from '@app/common';
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const UserPayload = createParamDecorator<UserPayloadDto>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const { user } = request;

    if (!user) {
      throw new InternalServerErrorException('TokenGuard가 없어요');
    }
    return user;
  },
);

import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { USER_SERVICE } from '@app/common';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, token: string) {
    // 1) 사용자 정보 가져오기
    const user = await this.getUserFromToken(token);
    console.log(user);
    // 2) 상품 정보 가져오기

    // 3) 총 금액 계산하기
    // 4) 금액 검증하기 - total이 맞는지
    // 5) 주문 생성하기 - db에 넣기
    // 6) 결제 시도하기
    // 7) 주문 상태 업데이트하기
    // 8) 결과 반환하기
  }

  async getUserFromToken(token: string) {
    // 1) User MS : JWT 토큰 검증
    const tokenRes = await lastValueFrom(
      this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
    );

    if (tokenRes.status === 'error') {
      throw new PaymentCancelledException(tokenRes);
    }

    // 2) User MS : 사용자 정보 가져오기
    const userId = tokenRes?.data?.sub;
    const userRes = await lastValueFrom(
      this.userService.send({ cmd: 'get_user_info' }, { userId }),
    );

    if (userRes.status === 'error') {
      throw new PaymentCancelledException(userRes);
    }

    return userRes.data;
  }
}

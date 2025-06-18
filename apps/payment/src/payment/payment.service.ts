import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE, NotificationMicroservice } from '@app/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentService implements OnModuleInit {
  private notificationService: NotificationMicroservice.NotificationServiceClient;
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationService =
      this.notificationMicroservice.getService<NotificationMicroservice.NotificationServiceClient>(
        'NotificationService',
      );
  }

  async makePayment(payload: MakePaymentDto) {
    let paymentId;

    try {
      const result = await this.paymentRepo.save(payload);

      paymentId = result.id;

      await this.processPayment();

      await this.updatePaymentStatus(result.id, PaymentStatus.approved);

      // notification 보내기
      this.sendNotification(payload.orderId, payload.userEmail);

      return this.paymentRepo.findOneBy({ id: result.id });
    } catch (e) {
      if (paymentId) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
      }
      throw e;
    }
  }

  async processPayment() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    await this.paymentRepo.update(
      {
        id,
      },
      {
        paymentStatus: status,
      },
    );
  }

  async sendNotification(orderId: string, to: string) {
    const resp = await lastValueFrom(
      this.notificationService.sendPaymentNotification({
        to,
        orderId,
      }),
    );
  }
}

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationStatus, Notification } from './entity/notification.entity';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Order } from 'apps/order/src/order/entity/order.entity';
import {
  constructMetadata,
  ORDER_SERVICE,
  OrderMicroservice,
} from '@app/common';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class NotificationService implements OnModuleInit {
  private orderService: OrderMicroservice.OrderServiceClient;
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    // @Inject(ORDER_SERVICE)
    // private readonly orderService: ClientProxy<Order>,
    @Inject(ORDER_SERVICE)
    private readonly orderMicroservice: ClientGrpc,
  ) {}
  onModuleInit() {
    this.orderService =
      this.orderMicroservice.getService<OrderMicroservice.OrderServiceClient>(
        'OrderService',
      );
  }

  async sendPaymentNotification(
    data: SendPaymentNotificationDto,
    metadata: Metadata,
  ) {
    const notification = await this.createNotification(data.to);

    await this.sendEmail();

    await this.updateNotificationStatus(
      notification._id.toString(),
      NotificationStatus.sent,
    );

    this.sendDeliveryStartedMessage(data.orderId, metadata);

    return this.notificationModel.findById(notification._id);
  }

  sendDeliveryStartedMessage(id: string, metadata: Metadata) {
    this.orderService.deliveryStarted(
      {
        id,
      },
      constructMetadata(
        NotificationService.name,
        'sendDeliveryStartedMessage',
        metadata,
      ),
    );
  }

  async updateNotificationStatus(id: string, status: NotificationStatus) {
    return this.notificationModel.findByIdAndUpdate(id, { status });
  }

  async sendEmail() {
    await new Promise((reslove) => setTimeout(reslove, 1000));
  }

  async createNotification(to: string) {
    return this.notificationModel.create({
      from: 'ps@codefactory.ai',
      to: to,
      subject: '배송이 시작됐습니다.',
      content: `${to}님 주문하신 물건이 배송이 시작됐습니다.`,
    });
  }
}

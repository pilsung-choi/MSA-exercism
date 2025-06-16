import { Inject, Injectable } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NotificationStatus, Notification } from './entity/notification.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Order } from 'apps/order/src/order/entity/order.entity';
import { ORDER_SERVICE } from '@app/common';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @Inject(ORDER_SERVICE)
    private readonly orderService: ClientProxy<Order>,
  ) {}

  async sendPaymentNotification(data: SendPaymentNotificationDto) {
    const notification = await this.createNotification(data.to);

    await this.sendEmail();

    await this.updateNotificationStatus(
      notification._id.toString(),
      NotificationStatus.sent,
    );

    this.sendDeliveryStartedMessage(data.orderId);

    return this.notificationModel.findById(notification._id);
  }

  sendDeliveryStartedMessage(id: string) {
    this.orderService.emit(
      { cmd: 'delivery_started' },
      {
        id,
      },
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

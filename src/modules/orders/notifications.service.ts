import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Telegraf } from 'telegraf';
import { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';
import { User } from '@modules/users';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  /** Отправить сообщение пользователю по tgId */
  async sendMessage(tgId: string, text: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(tgId, text);
    } catch {
      // пользователь мог заблокировать бота — не ломаем приложение
    }
  }

  /** Уведомить клиента, что заказ готов */
  async notifyCustomerReady(order: Order): Promise<void> {
    if (!order.user?.tgId) return;
    await this.sendMessage(
      order.user.tgId,
      `Ваш заказ #${order.id} готов! Подходите к стойке.`,
    );
  }

  /** Каждые 2 минуты напоминать баристам о неподтверждённых заказах */
  @Cron('*/2 * * * *')
  async remindBaristasAboutPendingOrders(): Promise<void> {
    const pendingCount = await this.orders.count({
      where: { status: OrderStatus.Created },
    });
    if (pendingCount === 0) return;

    const baristas = await this.users
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.code = :code', { code: 'BARISTA' })
      .andWhere('user.tgId IS NOT NULL')
      .getMany();

    const text = `⚠️ ${pendingCount} заказ(ов) ожидают подтверждения.`;
    for (const barista of baristas) {
      await this.sendMessage(barista.tgId!, text);
    }
  }
}

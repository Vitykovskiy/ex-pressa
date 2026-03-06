import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderItemAddon } from './order-item-addon.entity';
import { OrderStatus } from './order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { TimeSlot } from './time-slot.entity';
import { NotificationsService } from './notifications.service';
import { Cart, CartItem, CartItemAddon } from '@modules/cart';
import { ProductPrice } from '@modules/catalog';

/** Допустимые переходы статусов */
const STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.Created]: OrderStatus.Confirmed,
  [OrderStatus.Confirmed]: OrderStatus.Ready,
  [OrderStatus.Ready]: OrderStatus.Closed,
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(OrderItemAddon)
    private readonly orderItemAddons: Repository<OrderItemAddon>,
    @InjectRepository(Cart)
    private readonly carts: Repository<Cart>,
    @InjectRepository(ProductPrice)
    private readonly prices: Repository<ProductPrice>,
    @InjectRepository(TimeSlot)
    private readonly timeSlots: Repository<TimeSlot>,
    private readonly notifications: NotificationsService,
  ) {}

  async createFromCart(userId: number, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.carts.findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        items: { product: true, addons: { addon: true } },
      },
    });

    if (!cart) throw new NotFoundException('Корзина не найдена');
    if (!cart.user.isConfirmed) {
      throw new BadRequestException(
        'Аккаунт не подтверждён. Обратитесь к баристе.',
      );
    }
    if (!cart.items?.length) throw new BadRequestException('Корзина пуста');

    const slot = await this.timeSlots.findOne({
      where: { id: dto.timeSlotId, isActive: true },
    });
    if (!slot) throw new NotFoundException('Слот не найден');
    if (slot.bookedCount >= slot.capacity) {
      throw new BadRequestException('Слот заполнен. Выберите другое время.');
    }

    let totalRub = 0;
    const items: OrderItem[] = [];
    const cartItems: CartItem[] = cart.items ?? [];

    for (const cartItem of cartItems) {
      const product = cartItem.product;
      if (!product.isActive || !product.isAvailable) {
        throw new BadRequestException(`Позиция "${product.name}" недоступна`);
      }

      const price = await this.prices.findOne({
        where: {
          product: { id: product.id },
          sizeCode: cartItem.sizeCode ?? undefined,
          isActive: true,
        },
      });
      if (!price) {
        throw new BadRequestException(
          `Цена для позиции "${product.name}" не найдена`,
        );
      }

      const unitPrice = price.priceRub ?? 0;
      const lineTotal = unitPrice * cartItem.quantity;

      const orderItem = this.orderItems.create({
        productName: product.name,
        quantity: cartItem.quantity,
        sizeCode: cartItem.sizeCode ?? undefined,
        unitPriceRub: unitPrice,
        lineTotalRub: lineTotal,
      });

      totalRub += lineTotal;

      const cartAddons: CartItemAddon[] = cartItem.addons ?? [];
      if (cartAddons.length) {
        const addons: OrderItemAddon[] = [];
        for (const cartAddon of cartAddons) {
          const addon = cartAddon.addon;
          if (!addon.isActive) {
            throw new BadRequestException(`Доп "${addon.name}" недоступен`);
          }

          const addonUnit = addon.priceRub ?? 0;
          const addonLine = addonUnit * cartAddon.quantity;
          totalRub += addonLine;

          addons.push(
            this.orderItemAddons.create({
              addonName: addon.name,
              quantity: cartAddon.quantity,
              unitPriceRub: addonUnit,
              lineTotalRub: addonLine,
            }),
          );
        }
        orderItem.addons = addons;
      }

      items.push(orderItem);
    }

    const order = this.orders.create({
      user: cart.user,
      timeSlot: slot,
      status: OrderStatus.Created,
      slotTimeFrom: slot.timeFrom,
      slotTimeTo: slot.timeTo,
      totalRub,
      items,
    });

    const saved = await this.orders.save(order);

    // инкремент счётчика занятых мест в слоте
    await this.timeSlots.increment({ id: slot.id }, 'bookedCount', 1);

    // очистка корзины
    await this.carts.remove(cart);

    return saved;
  }

  async getHistoryByUserId(userId: number): Promise<Order[]> {
    return this.orders.find({
      where: { user: { id: userId } },
      relations: {
        user: true,
        timeSlot: true,
        items: { addons: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    orderId: number,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orders.findOne({
      where: { id: orderId },
      relations: { timeSlot: true },
    });
    if (!order) throw new NotFoundException('Заказ не найден');

    const expected = STATUS_TRANSITIONS[order.status];
    if (expected !== dto.status) {
      throw new BadRequestException(
        `Нельзя перевести заказ из ${order.status} в ${dto.status}`,
      );
    }

    order.status = dto.status;
    const now = new Date();
    if (dto.status === OrderStatus.Confirmed) order.confirmedAt = now;
    else if (dto.status === OrderStatus.Ready) {
      order.readyAt = now;
    } else if (dto.status === OrderStatus.Closed) {
      order.closedAt = now;
      // освобождаем место в слоте
      if (order.timeSlot) {
        await this.timeSlots.decrement(
          { id: order.timeSlot.id },
          'bookedCount',
          1,
        );
      }
    }

    const saved = await this.orders.save(order);

    // уведомляем клиента когда заказ готов
    if (dto.status === OrderStatus.Ready) {
      const withUser = await this.orders.findOne({
        where: { id: orderId },
        relations: { user: true },
      });
      if (withUser) void this.notifications.notifyCustomerReady(withUser);
    }

    return saved;
  }

  async rejectOrder(orderId: number, dto: RejectOrderDto): Promise<Order> {
    const order = await this.orders.findOne({
      where: { id: orderId },
      relations: { timeSlot: true },
    });
    if (!order) throw new NotFoundException('Заказ не найден');

    if (
      order.status !== OrderStatus.Created &&
      order.status !== OrderStatus.Confirmed
    ) {
      throw new BadRequestException(
        `Нельзя отклонить заказ в статусе ${order.status}`,
      );
    }

    order.status = OrderStatus.Rejected;
    order.rejectReason = dto.reason;

    // освобождаем место в слоте
    if (order.timeSlot) {
      await this.timeSlots.decrement(
        { id: order.timeSlot.id },
        'bookedCount',
        1,
      );
    }

    return this.orders.save(order);
  }

  async getOrdersForBarista(filters: OrdersFilterDto): Promise<Order[]> {
    const qb = this.orders
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.timeSlot', 'timeSlot')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.addons', 'addons')
      .orderBy('order.createdAt', 'DESC');

    const statuses = Array.isArray(filters.status)
      ? filters.status
      : filters.status
        ? [filters.status]
        : [];

    if (statuses.length) {
      qb.andWhere('order.status IN (:...statuses)', { statuses });
    }

    if (filters.dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }
    if (filters.dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    return qb.getMany();
  }
}

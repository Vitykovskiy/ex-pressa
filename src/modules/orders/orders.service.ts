import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Customer } from '../customers/customers.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { OrderStatus } from './constants';
import { OrderItem } from './entities/order-item.entity';
import { TimeSlot } from '../shedule/time-slot.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem) private readonly items: Repository<OrderItem>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(MenuItem)
    private readonly menuItems: Repository<MenuItem>,
    @InjectRepository(TimeSlot)
    private readonly timeSlots: Repository<TimeSlot>,
  ) {}

  async create(
    customerId: number,
    timeSlotId?: number,
    note?: string,
  ): Promise<Order> {
    const customer = await this.customers.findOne({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    let timeSlot: TimeSlot | undefined;
    if (timeSlotId) {
      const found = await this.timeSlots.findOne({ where: { id: timeSlotId } });
      if (!found) throw new NotFoundException('TimeSlot not found');
      timeSlot = found;
    }

    const order = this.orders.create({
      customer,
      timeSlot,
      status: OrderStatus.CREATED,
      note,
      items: [],
    });
    return this.orders.save(order);
  }

  async get(id: number): Promise<Order> {
    const o = await this.orders.findOne({ where: { id } });
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

  async getOpenByCustomer(customerId: number): Promise<Order | null> {
    return this.orders.findOne({
      where: {
        customer: { id: customerId },
        status: In([OrderStatus.CREATED, OrderStatus.CONFIRMED]),
      },
    });
  }

  async addItem(
    orderId: number,
    menuItemId: number,
    qty: number,
  ): Promise<Order> {
    if (qty < 1) throw new BadRequestException('qty must be >= 1');

    const [order, menuItem] = await Promise.all([
      this.get(orderId),
      this.menuItems.findOne({ where: { id: menuItemId } }),
    ]);
    if (!menuItem) throw new NotFoundException('MenuItem not found');
    if (order.status !== OrderStatus.CREATED)
      throw new BadRequestException('Order is not editable');

    // ищем существующую позицию с тем же menuItem
    const existing = order.items.find((i) => i.menuItem.id === menuItemId);
    if (existing) {
      existing.qty += qty;
      await this.items.save(existing);
    } else {
      const item = this.items.create({
        order,
        menuItem,
        qty,
        price: menuItem.price,
      });
      await this.items.save(item);
      order.items.push(item);
    }
    return this.get(orderId);
  }

  async setQty(orderId: number, itemId: number, qty: number): Promise<Order> {
    const order = await this.get(orderId);
    if (order.status !== OrderStatus.CREATED)
      throw new BadRequestException('Order is not editable');

    const item = order.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('OrderItem not found');

    if (qty < 1) {
      await this.items.remove(item);
    } else {
      item.qty = qty;
      await this.items.save(item);
    }
    return this.get(orderId);
  }

  async cancel(orderId: number): Promise<Order> {
    const order = await this.get(orderId);
    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.status))
      return order;
    order.status = OrderStatus.CANCELLED;
    return this.orders.save(order);
  }

  async confirm(orderId: number): Promise<Order> {
    const order = await this.get(orderId);
    if (order.status !== OrderStatus.CREATED)
      throw new BadRequestException('Invalid status');
    if (!order.items?.length) throw new BadRequestException('Order is empty');
    order.status = OrderStatus.CONFIRMED;
    return this.orders.save(order);
  }

  async total(orderId: number): Promise<number> {
    const order = await this.get(orderId);
    return (order.items ?? []).reduce((s, i) => s + i.price * i.qty, 0);
  }
}

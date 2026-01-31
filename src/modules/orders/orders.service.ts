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
import { Cart } from '../cart/cart.entity';
import { CartItem } from '../cart/cart-item.entity';
import { CartItemAddon } from '../cart/cart-item-addon.entity';
import { ProductPrice } from '../catalog/entities/product-price.entity';
import { OrderStatus } from './order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';

const SLOT_MINUTES = 10;

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hh, mm, ss] = time.split(':').map((v) => Number(v));
  const totalMinutes = hh * 60 + mm + Math.floor(minutesToAdd);
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const outH = String(Math.floor(normalized / 60)).padStart(2, '0');
  const outM = String(normalized % 60).padStart(2, '0');
  return `${outH}:${outM}`;
}

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
    if (!cart.items?.length) throw new BadRequestException('Корзина пуста');

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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      status: OrderStatus.Created,
      slotTimeFrom: dto.slotTimeFrom,
      slotTimeTo: addMinutesToTime(dto.slotTimeFrom, SLOT_MINUTES),
      totalRub,
      items,
    });

    const saved = await this.orders.save(order);

    // очистка корзины
    await this.carts.remove(cart);

    return saved;
  }
}

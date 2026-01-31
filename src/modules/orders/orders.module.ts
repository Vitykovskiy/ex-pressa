import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderItemAddon } from './order-item-addon.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Cart } from '../cart/cart.entity';
import { ProductPrice } from '../catalog/entities/product-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderItemAddon,
      Cart,
      ProductPrice,
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}

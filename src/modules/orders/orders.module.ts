import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderItemAddon } from './order-item-addon.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Cart } from '@modules/cart';
import { ProductPrice } from '@modules/catalog';
import { TimeSlot } from './time-slot.entity';
import { TimeSlotService } from './time-slot.service';
import { TimeSlotController } from './time-slot.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderItemAddon,
      Cart,
      ProductPrice,
      TimeSlot,
    ]),
  ],
  providers: [OrdersService, TimeSlotService],
  controllers: [OrdersController, TimeSlotController],
  exports: [OrdersService],
})
export class OrdersModule {}

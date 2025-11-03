import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersBotController } from './controllers/orders.bot.controller';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { Customer } from '../customers/customers.entity';
import { OrdersService } from './orders.service';
import { TimeSlot } from '../shedule/time-slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Customer, MenuItem, TimeSlot]),
  ],
  providers: [OrdersService, OrdersBotController],
  exports: [OrdersService],
})
export class OrdersModule {}

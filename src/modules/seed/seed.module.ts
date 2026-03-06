import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, Role } from '@modules/users';
import {
  ProductGroup,
  Product,
  ProductPrice,
  AddonGroup,
  Addon,
  ProductGroupAddonGroup,
} from '@modules/catalog';
import { TimeSlot, Order, OrderItem } from '@modules/orders';

import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      User,
      ProductGroup,
      Product,
      ProductPrice,
      AddonGroup,
      Addon,
      ProductGroupAddonGroup,
      TimeSlot,
      Order,
      OrderItem,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}

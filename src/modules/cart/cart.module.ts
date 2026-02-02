import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { CartItemAddon } from './cart-item-addon.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Product, Addon } from '@modules/catalog';
import { User } from '@modules/users';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      CartItemAddon,
      User,
      Product,
      Addon,
    ]),
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}

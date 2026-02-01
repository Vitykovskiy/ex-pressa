import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { Product } from '../catalog/entities/product.entity';
import { DrinkSizeCode } from '../catalog/enums/drink-size-code.enum';
import { CartItemAddon } from './cart-item-addon.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 10 })
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  @ApiProperty({ type: () => Cart, example: { id: 2 } })
  cart: Cart;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  @ApiProperty({ type: () => Product, example: { id: 5, name: 'Латте' } })
  product: Product;

  @Column({
    name: 'size_code',
    type: 'enum',
    enum: DrinkSizeCode,
    nullable: true,
  })
  @ApiPropertyOptional({ enum: DrinkSizeCode, example: 'M' })
  sizeCode?: DrinkSizeCode | null;

  @Column({ name: 'product_name', type: 'text' })
  @ApiProperty({ example: 'Латте' })
  productName: string;

  @Column({ name: 'quantity', type: 'integer' })
  @ApiProperty({ example: 2 })
  quantity: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => CartItemAddon, 'cartItem', {
    cascade: true,
  })
  @ApiProperty({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    type: () => [CartItemAddon],
    example: [{ id: 1, addonName: 'Ванильный сироп', quantity: 1 }],
  })
  addons: CartItemAddon[];
}

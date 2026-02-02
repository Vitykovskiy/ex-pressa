import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from './cart-item.entity';
import { Addon } from '@modules/catalog';

@Entity('cart_item_addons')
export class CartItemAddon {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ManyToOne(() => CartItem, 'addons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_item_id' })
  @ApiProperty({ type: () => CartItem, example: { id: 10 } })
  cartItem: CartItem;

  @ManyToOne(() => Addon, { nullable: false })
  @JoinColumn({ name: 'addon_id' })
  @ApiProperty({
    type: () => Addon,
    example: { id: 3, name: 'Ванильный сироп' },
  })
  addon: Addon;

  @Column({ name: 'addon_name', type: 'text' })
  @ApiProperty({ example: 'Ванильный сироп' })
  addonName: string;

  @Column({ name: 'quantity', type: 'integer' })
  @ApiProperty({ example: 2 })
  quantity: number;
}

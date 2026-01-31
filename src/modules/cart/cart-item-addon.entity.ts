import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Addon } from '../catalog/entities/addon.entity';

@Entity('cart_item_addons')
export class CartItemAddon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartItem, 'addons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_item_id' })
  cartItem: CartItem;

  @ManyToOne(() => Addon, { nullable: false })
  @JoinColumn({ name: 'addon_id' })
  addon: Addon;

  @Column({ name: 'addon_name', type: 'text' })
  addonName: string;

  @Column({ name: 'quantity', type: 'integer' })
  quantity: number;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../catalog/entities/product.entity';
import { DrinkSize } from '../catalog/entities/drink-size.entity';
import { CartItemAddon } from './cart-item-addon.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => DrinkSize, { nullable: true })
  @JoinColumn({ name: 'size_id' })
  size?: DrinkSize | null;

  @Column({ name: 'product_name', type: 'text' })
  productName: string;

  @Column({ name: 'quantity', type: 'integer' })
  quantity: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => CartItemAddon, 'cartItem', {
    cascade: true,
  })
  addons: CartItemAddon[];
}

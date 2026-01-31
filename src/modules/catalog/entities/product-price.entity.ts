import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { DrinkSize } from './drink-size.entity';

@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.prices, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => DrinkSize, (size) => size.prices, { nullable: true })
  @JoinColumn({ name: 'size_id' })
  size?: DrinkSize | null;

  @Column({ name: 'price_rub', type: 'integer', nullable: true })
  priceRub?: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

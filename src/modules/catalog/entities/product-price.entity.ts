import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { DrinkSizeCode } from '../enums/drink-size-code.enum';

@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.prices, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({
    name: 'size_code',
    type: 'enum',
    enum: DrinkSizeCode,
    nullable: true,
  })
  sizeCode?: DrinkSizeCode | null;

  @Column({ name: 'price_rub', type: 'integer', nullable: true })
  priceRub?: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

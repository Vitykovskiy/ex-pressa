import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from './product.entity';
import { DrinkSizeCode } from '../enums/drink-size-code.enum';

@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 12 })
  id: number;

  @ManyToOne(() => Product, (product) => product.prices, { nullable: false })
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

  @Column({ name: 'price_rub', type: 'integer', nullable: true })
  @ApiPropertyOptional({ example: 250 })
  priceRub?: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isActive: boolean;
}

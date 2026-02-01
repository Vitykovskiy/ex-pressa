import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProductGroup } from './product-group.entity';

import { ProductType } from '../enums/product-type.enum';

import { ProductPrice } from './product-price.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 5 })
  id: number;

  @ManyToOne(() => ProductGroup, (group) => group.products, {
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  @ApiProperty({ type: () => ProductGroup, example: { id: 1, name: 'Кофе' } })
  group: ProductGroup;

  @Column({ length: 200 })
  @ApiProperty({ example: 'Латте' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ example: 'Классический латте с молоком' })
  description?: string;

  @Column({ type: 'enum', enum: ProductType })
  @ApiProperty({ enum: ProductType, example: 'DRINK' })
  type: ProductType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isActive: boolean;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isAvailable: boolean;

  @Column({ name: 'sort_order', type: 'integer', nullable: true })
  @ApiPropertyOptional({ example: 1 })
  sortOrder?: number;

  @OneToMany(() => ProductPrice, (price) => price.product)
  @ApiProperty({
    type: () => [ProductPrice],

    example: [{ id: 12, sizeCode: 'M', priceRub: 250 }],
  })
  prices: ProductPrice[];
}

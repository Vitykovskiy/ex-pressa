import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductGroup } from './product-group.entity';
import { ProductType } from '../enums/product-type.enum';
import { ProductPrice } from './product-price.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductGroup, (group) => group.products, {
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: ProductGroup;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'sort_order', type: 'integer', nullable: true })
  sortOrder?: number;

  @OneToMany(() => ProductPrice, (price) => price.product)
  prices: ProductPrice[];
}

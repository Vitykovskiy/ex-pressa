import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DrinkSizeCode } from '../enums/drink-size-code.enum';
import { ProductPrice } from './product-price.entity';

@Entity('drink_sizes')
export class DrinkSize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DrinkSizeCode, unique: true })
  code: DrinkSizeCode;

  @Column({ length: 80 })
  name: string;

  @Column({ name: 'sort_order', type: 'integer', nullable: true })
  sortOrder?: number;

  @OneToMany(() => ProductPrice, (price) => price.size)
  prices: ProductPrice[];
}

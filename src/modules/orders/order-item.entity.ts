import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from './order.entity';
import { OrderItemAddon } from './order-item-addon.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 20 })
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  @ApiProperty({ type: () => Order, example: { id: 15, status: 'CREATED' } })
  order: Order;

  @Column({ name: 'product_name', type: 'text' })
  @ApiProperty({ example: 'Латте' })
  productName: string;

  @Column({ name: 'quantity', type: 'integer' })
  @ApiProperty({ example: 2 })
  quantity: number;

  @Column({ name: 'size_code', type: 'varchar', length: 8, nullable: true })
  @ApiPropertyOptional({ example: 'M' })
  sizeCode?: string;

  @Column({ name: 'unit_price_rub', type: 'integer' })
  @ApiProperty({ example: 250 })
  unitPriceRub: number;

  @Column({ name: 'line_total_rub', type: 'integer' })
  @ApiProperty({ example: 500 })
  lineTotalRub: number;

  @OneToMany(() => OrderItemAddon, (addon) => addon.orderItem, {
    cascade: true,
  })
  @ApiProperty({
    type: () => [OrderItemAddon],
    example: [{ id: 1, addonName: 'Ванильный сироп', quantity: 1 }],
  })
  addons: OrderItemAddon[];
}

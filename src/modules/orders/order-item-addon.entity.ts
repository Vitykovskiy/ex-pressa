import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';

@Entity('order_item_addons')
export class OrderItemAddon {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @ManyToOne(() => OrderItem, (item) => item.addons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  @ApiProperty({
    type: () => OrderItem,
    example: { id: 20, productName: 'Латте' },
  })
  orderItem: OrderItem;

  @Column({ name: 'addon_name', type: 'text' })
  @ApiProperty({ example: 'Ванильный сироп' })
  addonName: string;

  @Column({ name: 'quantity', type: 'integer' })
  @ApiProperty({ example: 1 })
  quantity: number;

  @Column({ name: 'unit_price_rub', type: 'integer' })
  @ApiProperty({ example: 30 })
  unitPriceRub: number;

  @Column({ name: 'line_total_rub', type: 'integer' })
  @ApiProperty({ example: 30 })
  lineTotalRub: number;
}

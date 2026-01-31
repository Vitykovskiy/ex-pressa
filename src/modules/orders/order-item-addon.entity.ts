import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('order_item_addons')
export class OrderItemAddon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderItem, (item) => item.addons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'addon_name', type: 'text' })
  addonName: string;

  @Column({ name: 'quantity', type: 'integer' })
  quantity: number;

  @Column({ name: 'unit_price_rub', type: 'integer' })
  unitPriceRub: number;

  @Column({ name: 'line_total_rub', type: 'integer' })
  lineTotalRub: number;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderItemAddon } from './order-item-addon.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_name', type: 'text' })
  productName: string;

  @Column({ name: 'quantity', type: 'integer' })
  quantity: number;

  @Column({ name: 'size_code', type: 'varchar', length: 8, nullable: true })
  sizeCode?: string;

  @Column({ name: 'unit_price_rub', type: 'integer' })
  unitPriceRub: number;

  @Column({ name: 'line_total_rub', type: 'integer' })
  lineTotalRub: number;

  @OneToMany(() => OrderItemAddon, (addon) => addon.orderItem, {
    cascade: true,
  })
  addons: OrderItemAddon[];
}

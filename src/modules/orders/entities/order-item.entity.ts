import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => MenuItem, { nullable: false })
  menuItem: MenuItem;

  @Column({ type: 'int' })
  qty: number;

  // снимок цены на момент заказа
  @Column({ type: 'real' })
  price: number;
}

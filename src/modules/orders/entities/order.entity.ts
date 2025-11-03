import { Customer } from 'src/modules/customers/customers.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../constants';
import { OrderItem } from './order-item.entity';
import { TimeSlot } from 'src/modules/shedule/time-slot.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, { nullable: false })
  customer: Customer;

  @ManyToOne(() => TimeSlot, { nullable: true })
  timeSlot?: TimeSlot;

  @Column({ type: 'text', default: OrderStatus.CREATED })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

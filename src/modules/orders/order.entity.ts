import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { OrderStatus } from './order-status.enum';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Created })
  status: OrderStatus;

  @Column({ name: 'slot_time_from', type: 'time' })
  slotTimeFrom: string;

  @Column({ name: 'slot_time_to', type: 'time' })
  slotTimeTo: string;

  @Column({ name: 'total_rub', type: 'integer' })
  totalRub: number;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'ready_at', type: 'timestamp', nullable: true })
  readyAt?: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}

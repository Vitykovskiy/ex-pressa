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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@modules/users';
import { OrderStatus } from './order-status.enum';
import { OrderItem } from './order-item.entity';
import { TimeSlot } from './time-slot.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 15 })
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({
    type: () => User,
    example: { id: 7, name: 'Алексей Иванов' },
  })
  user: User;

  @ManyToOne(() => TimeSlot, { nullable: false })
  @JoinColumn({ name: 'time_slot_id' })
  @ApiProperty({
    type: () => TimeSlot,
    example: { id: 3, date: '2026-02-01', timeFrom: '09:00:00' },
  })
  timeSlot: TimeSlot;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Created })
  @ApiProperty({ enum: OrderStatus, example: 'CREATED' })
  status: OrderStatus;

  @Column({ name: 'slot_time_from', type: 'time' })
  @ApiProperty({ example: '09:00:00' })
  slotTimeFrom: string;

  @Column({ name: 'slot_time_to', type: 'time' })
  @ApiProperty({ example: '09:30:00' })
  slotTimeTo: string;

  @Column({ name: 'total_rub', type: 'integer' })
  @ApiProperty({ example: 530 })
  totalRub: number;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  @ApiPropertyOptional({ example: 'Товара нет в наличии' })
  rejectReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ example: '2026-02-01T08:30:00.000Z' })
  createdAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ example: '2026-02-01T08:32:00.000Z' })
  confirmedAt?: Date;

  @Column({ name: 'ready_at', type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ example: '2026-02-01T08:45:00.000Z' })
  readyAt?: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ example: '2026-02-01T08:50:00.000Z' })
  closedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ example: '2026-02-01T08:35:00.000Z' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  @ApiProperty({
    type: () => [OrderItem],
    example: [{ id: 20, productName: 'Латте', quantity: 2, lineTotalRub: 500 }],
  })
  items: OrderItem[];
}

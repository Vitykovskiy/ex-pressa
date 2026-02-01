import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 3 })
  id: number;

  @Column({ name: 'date', type: 'date' })
  @ApiProperty({ example: '2026-02-01' })
  date: string;

  @Column({ name: 'time_from', type: 'time' })
  @ApiProperty({ example: '09:00:00' })
  timeFrom: string;

  @Column({ name: 'time_to', type: 'time' })
  @ApiProperty({ example: '09:30:00' })
  timeTo: string;

  @Column({ name: 'capacity', type: 'integer', default: 0 })
  @ApiProperty({ example: 12 })
  capacity: number;

  @Column({ name: 'booked_count', type: 'integer', default: 0 })
  @ApiProperty({ example: 4 })
  bookedCount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true })
  isActive: boolean;
}

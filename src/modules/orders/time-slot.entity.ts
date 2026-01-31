import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'date', type: 'date' })
  date: string;

  @Column({ name: 'time_from', type: 'time' })
  timeFrom: string;

  @Column({ name: 'time_to', type: 'time' })
  timeTo: string;

  @Column({ name: 'capacity', type: 'integer', default: 0 })
  capacity: number;

  @Column({ name: 'booked_count', type: 'integer', default: 0 })
  bookedCount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

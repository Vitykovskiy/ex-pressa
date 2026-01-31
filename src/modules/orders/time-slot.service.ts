import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlot } from './time-slot.entity';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly slots: Repository<TimeSlot>,
  ) {}

  async getActiveSlots(): Promise<TimeSlot[]> {
    return this.slots.find({
      where: { isActive: true },
      order: { date: 'ASC', timeFrom: 'ASC' },
    });
  }
}

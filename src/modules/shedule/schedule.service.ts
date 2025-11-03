import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TimeSlot } from './time-slot.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(TimeSlot) private readonly slots: Repository<TimeSlot>,
  ) {}

  async create(
    startTime: Date,
    endTime: Date,
    capacityMinutes = 60,
  ): Promise<TimeSlot> {
    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
    const slot = this.slots.create({ startTime, endTime, capacityMinutes });
    return this.slots.save(slot);
  }

  async findActive(): Promise<TimeSlot[]> {
    const now = new Date();
    return this.slots.find({
      where: {
        startTime: Between(
          new Date(now.getTime() - 3600000),
          new Date(now.getTime() + 24 * 3600000),
        ),
        isActive: true,
      },
      order: { startTime: 'ASC' },
    });
  }

  async findById(id: number): Promise<TimeSlot> {
    const slot = await this.slots.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('TimeSlot not found');
    return slot;
  }

  async deactivate(id: number): Promise<void> {
    const slot = await this.findById(id);
    slot.isActive = false;
    await this.slots.save(slot);
  }
}

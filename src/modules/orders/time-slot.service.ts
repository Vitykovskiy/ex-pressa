import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TimeSlot } from './time-slot.entity';

const DEFAULT_START_HOUR = 9; // 09:00
const DEFAULT_END_HOUR = 20; // 20:00
const INTERVAL_MINUTES = 10;
const SLOT_CAPACITY = 5;

@Injectable()
export class TimeSlotService implements OnModuleInit {
  constructor(
    @InjectRepository(TimeSlot)
    private readonly slots: Repository<TimeSlot>,
  ) {}

  onModuleInit() {
    void this.generateSlotsForToday();
  }

  /** Запуск в полночь — генерировать слоты на новый день */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    await this.generateSlotsForToday();
  }

  async generateSlotsForToday(): Promise<void> {
    const today = this.todayDateString();
    const existing = await this.slots.count({ where: { date: today } });
    if (existing > 0) return; // слоты уже созданы

    const newSlots: Partial<TimeSlot>[] = [];
    const totalMinutes = (DEFAULT_END_HOUR - DEFAULT_START_HOUR) * 60;
    const count = totalMinutes / INTERVAL_MINUTES;

    for (let i = 0; i < count; i++) {
      const fromMinutes = DEFAULT_START_HOUR * 60 + i * INTERVAL_MINUTES;
      const toMinutes = fromMinutes + INTERVAL_MINUTES;
      newSlots.push({
        date: today,
        timeFrom: this.minutesToTime(fromMinutes),
        timeTo: this.minutesToTime(toMinutes),
        capacity: SLOT_CAPACITY,
        bookedCount: 0,
        isActive: true,
      });
    }

    await this.slots.save(newSlots);
  }

  async getActiveSlots(): Promise<TimeSlot[]> {
    const today = this.todayDateString();
    const nowTime = this.currentTimeString();
    return this.slots.find({
      where: { isActive: true, date: today },
      order: { timeFrom: 'ASC' },
    }).then((slots) => slots.filter((slot) => slot.timeTo > nowTime));
  }

  isSlotExpired(slot: Pick<TimeSlot, 'date' | 'timeTo'>): boolean {
    const today = this.todayDateString();
    if (slot.date < today) {
      return true;
    }

    if (slot.date > today) {
      return false;
    }

    return slot.timeTo <= this.currentTimeString();
  }

  private todayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private currentTimeString(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  private minutesToTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
  }
}

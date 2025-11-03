import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleBotController } from './controllers/schedule.bot.controller';
import { ScheduleService } from './schedule.service';
import { TimeSlot } from './time-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlot])],
  providers: [ScheduleService, ScheduleBotController],
  exports: [ScheduleService],
})
export class ScheduleModule {}

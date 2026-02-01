import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeSlotService } from './time-slot.service';
import { TimeSlot } from './time-slot.entity';

@ApiTags('Слоты')
@Controller('time-slots')
export class TimeSlotController {
  constructor(private readonly slots: TimeSlotService) {}

  @Get('active')
  @ApiOperation({ summary: 'Получить активные слоты' })
  @ApiOkResponse({ type: TimeSlot, isArray: true })
  getActive(): Promise<TimeSlot[]> {
    return this.slots.getActiveSlots();
  }
}

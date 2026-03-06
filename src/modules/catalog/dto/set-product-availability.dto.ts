import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetProductAvailabilityDto {
  @ApiProperty()
  @IsBoolean()
  isAvailable: boolean;
}

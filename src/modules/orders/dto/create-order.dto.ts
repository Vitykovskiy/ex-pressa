import { IsString, Matches } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'slotTimeFrom должен быть в формате HH:MM',
  })
  slotTimeFrom: string;
}

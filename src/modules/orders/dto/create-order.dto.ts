import { IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  timeSlotId: string;
}

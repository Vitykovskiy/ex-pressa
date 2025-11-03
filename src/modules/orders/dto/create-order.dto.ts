import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  customerId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeSlotId?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

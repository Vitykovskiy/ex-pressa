import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../order-status.enum';

const ALLOWED = [
  OrderStatus.Confirmed,
  OrderStatus.Ready,
  OrderStatus.Closed,
] as const;

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ALLOWED, example: OrderStatus.Confirmed })
  @IsEnum(ALLOWED, {
    message: 'Статус должен быть CONFIRMED, READY или CLOSED',
  })
  status: (typeof ALLOWED)[number];
}

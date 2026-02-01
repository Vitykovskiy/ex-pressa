import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../order-status.enum';

export class OrdersFilterDto {
  @ApiPropertyOptional({
    isArray: true,
    enum: OrderStatus,
    example: ['CREATED', 'READY'],
  })
  @IsOptional()
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus[] | OrderStatus;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-02-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

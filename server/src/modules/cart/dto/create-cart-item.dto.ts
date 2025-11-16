import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import type { CartItemSize } from '../entities/cart-item.entity';

export class CreateCartItemDto {
  @ApiProperty({ description: 'Идентификатор позиции меню' })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Количество добавляемых единиц', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ enum: ['s', 'm', 'l'], nullable: true })
  @IsOptional()
  @IsIn(['s', 'm', 'l'])
  size?: CartItemSize;

  @ApiPropertyOptional({
    description: 'Идентификаторы выбранных опций',
    type: [Number],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  selectedOptions?: number[];
}

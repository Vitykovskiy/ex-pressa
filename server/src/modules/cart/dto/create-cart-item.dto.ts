import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import type { CartItemSize } from '../entities/cart-item.entity';

export class CreateCartItemDto {
  @ApiProperty({ description: 'Menu item identifier' })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Number of units to add', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ enum: ['s', 'm', 'l'], nullable: true })
  @IsOptional()
  @IsIn(['s', 'm', 'l'])
  size?: CartItemSize;

  @ApiPropertyOptional({
    description: 'Identifiers of selected option items',
    type: [Number],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  selectedOptions?: number[];
}

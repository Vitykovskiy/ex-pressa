import { IsArray, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import type { CartItemSize } from '../entities/cart-item.entity';

export interface CartItemRequestDto {
  id: number;
  quantity: number;
  size?: CartItemSize;
  selectedOptions?: number[];
}

export class CreateCartItemDto implements CartItemRequestDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsIn(['s', 'm', 'l'])
  size?: CartItemSize;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  selectedOptions?: number[];
}

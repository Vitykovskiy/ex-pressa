import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CartItemSize } from '../entities/cart-item.entity';

export class CartItemResponseDto {
  @ApiProperty({ description: 'Идентификатор записи в корзине' })
  id: number;

  @ApiProperty({
    description: 'Идентификатор позиции меню, связанной с корзиной',
  })
  menuItemId: number;

  @ApiProperty({ description: 'Количество единиц в корзине' })
  quantity: number;

  @ApiProperty({ enum: ['s', 'm', 'l'], nullable: true })
  size: CartItemSize | null;

  @ApiPropertyOptional({
    nullable: true,
    type: [Number],
    description: 'Идентификаторы выбранных опций меню',
  })
  selectedOptions: number[] | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CartItemSize } from '../entities/cart-item.entity';

export class CartItemResponseDto {
  @ApiProperty({ description: 'Cart item identifier' })
  id: number;

  @ApiProperty({
    description: 'Menu item identifier associated with the cart item',
  })
  menuItemId: number;

  @ApiProperty({ description: 'Number of units in the cart' })
  quantity: number;

  @ApiProperty({ enum: ['s', 'm', 'l'], nullable: true })
  size: CartItemSize | null;

  @ApiPropertyOptional({
    nullable: true,
    type: [Number],
    description: 'Identifiers of selected option menu items',
  })
  selectedOptions: number[] | null;
}

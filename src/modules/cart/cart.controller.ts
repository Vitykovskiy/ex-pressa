import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  @ApiOperation({ summary: 'Add a menu item to the cart' })
  @ApiCreatedResponse({ type: CartItemResponseDto })
  createCartItem(@Body() dto: CreateCartItemDto) {
    return this.cartService.createItem(dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'List all items currently in the cart' })
  @ApiOkResponse({ type: [CartItemResponseDto] })
  getCartItems() {
    return this.cartService.listItems();
  }

  @Delete('items')
  @ApiOperation({ summary: 'Remove every item from the cart' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async clearCart() {
    await this.cartService.clear();
    return { success: true } as const;
  }
}

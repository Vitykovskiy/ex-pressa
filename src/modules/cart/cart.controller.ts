import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  createCartItem(@Body() dto: CreateCartItemDto) {
    return this.cartService.createItem(dto);
  }

  @Get('items')
  getCartItems() {
    return this.cartService.listItems();
  }

  @Delete('items')
  async clearCart() {
    await this.cartService.clear();
    return { success: true };
  }
}

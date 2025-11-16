import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
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

  @Put('items/:id')
  @ApiOperation({ summary: 'Update a cart item by id' })
  @ApiOkResponse({ type: CartItemResponseDto })
  updateCartItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCartItemDto,
  ) {
    return this.cartService.updateItem(id, dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'List all items currently in the cart' })
  @ApiOkResponse({ type: [CartItemResponseDto] })
  getCartItems() {
    return this.cartService.listItems();
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove a cart item by id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async removeCartItem(@Param('id', ParseIntPipe) id: number) {
    await this.cartService.removeItem(id);
    return { success: true } as const;
  }

  @Delete('items')
  @ApiOperation({ summary: 'Remove every item from the cart' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  async clearCart() {
    await this.cartService.clear();
    return { success: true } as const;
  }
}

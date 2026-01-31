import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Корзина')
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Получить корзину пользователя' })
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cart.getCartByUserId(userId);
  }

  @Post(':userId/items')
  @ApiOperation({ summary: 'Добавить позицию в корзину' })
  addItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cart.addItem(userId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Изменить количество позиции в корзине' })
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItemQuantity(itemId, dto.quantity);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Удалить позицию из корзины' })
  removeItem(@Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.cart.removeItem(itemId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Очистить корзину пользователя' })
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cart.clearCart(userId);
  }
}

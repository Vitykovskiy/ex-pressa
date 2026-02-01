import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Cart } from './cart.entity';

@ApiTags('Корзина')
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Получить корзину пользователя' })
  @ApiOkResponse({ type: Cart })
  getCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cart.getCartByUserId(userId);
  }

  @Post(':userId/items')
  @ApiOperation({ summary: 'Добавить позицию в корзину' })
  @ApiOkResponse({ type: Cart })
  addItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cart.addItem(userId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Изменить количество позиции в корзине' })
  @ApiOkResponse({ type: Cart })
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItemQuantity(itemId, dto.quantity);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Удалить позицию из корзины' })
  @ApiOkResponse({ type: Cart })
  removeItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.cart.removeItem(itemId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Очистить корзину пользователя' })
  @ApiOkResponse({ type: Cart })
  clearCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cart.clearCart(userId);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
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

  @Get()
  @ApiOperation({ summary: 'Получить корзину текущего пользователя' })
  @ApiOkResponse({ type: Cart })
  getCart(@Req() req: Request & { user: { id: number } }) {
    return this.cart.getCartByUserId(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Добавить позицию в корзину текущего пользователя' })
  @ApiOkResponse({ type: Cart })
  addItem(
    @Req() req: Request & { user: { id: number } },
    @Body() dto: AddCartItemDto,
  ) {
    return this.cart.addItem(req.user.id, dto);
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

  @Delete()
  @ApiOperation({ summary: 'Очистить корзину текущего пользователя' })
  @ApiOkResponse({ type: Cart })
  clearCart(@Req() req: Request & { user: { id: number } }) {
    return this.cart.clearCart(req.user.id);
  }
}

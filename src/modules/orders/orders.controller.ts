import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Заказы')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('from-cart/:userId')
  @ApiOperation({ summary: 'Создать заказ из корзины пользователя' })
  createFromCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orders.createFromCart(userId, dto);
  }
}

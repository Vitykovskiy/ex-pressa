import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';

@ApiTags('Заказы')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('from-cart/:userId')
  @ApiOperation({ summary: 'Создать заказ из корзины пользователя' })
  @ApiOkResponse({ type: Order })
  createFromCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateOrderDto,
  ): Promise<Order> {
    return this.orders.createFromCart(userId, dto);
  }
}

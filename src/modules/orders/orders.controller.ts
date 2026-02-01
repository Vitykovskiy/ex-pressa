import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
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

  @Get('history')
  @ApiOperation({ summary: 'Получить историю заказов пользователя' })
  @ApiHeader({
    name: 'x-user-id',
    required: true,
    description: 'Идентификатор текущего пользователя',
  })
  @ApiOkResponse({ type: Order, isArray: true })
  getHistory(@Headers('x-user-id') userIdRaw: string): Promise<Order[]> {
    const userId = Number(userIdRaw);
    if (!Number.isInteger(userId)) {
      throw new BadRequestException('Некорректный x-user-id');
    }
    return this.orders.getHistoryByUserId(userId);
  }

  @Post('search')
  @ApiOperation({
    summary: 'Получить все заказы с фильтрами по статусу и дате',
  })
  @ApiOkResponse({ type: Order, isArray: true })
  @ApiBody({ type: OrdersFilterDto })
  getAll(@Body() filters: OrdersFilterDto): Promise<Order[]> {
    return this.orders.getOrdersForBarista(filters);
  }
}

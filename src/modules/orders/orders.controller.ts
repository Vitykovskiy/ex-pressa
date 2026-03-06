import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersFilterDto } from './dto/orders-filter.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { Order } from './order.entity';
import { Roles } from '@modules/auth/roles.decorator';

@ApiTags('Заказы')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('from-cart')
  @ApiOperation({ summary: 'Создать заказ из корзины текущего пользователя' })
  @ApiOkResponse({ type: Order })
  createFromCart(
    @Req() req: Request & { user: { id: number } },
    @Body() dto: CreateOrderDto,
  ): Promise<Order> {
    return this.orders.createFromCart(req.user.id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Получить историю заказов текущего пользователя' })
  @ApiOkResponse({ type: Order, isArray: true })
  getHistory(@Req() req: Request & { user: { id: number } }): Promise<Order[]> {
    return this.orders.getHistoryByUserId(req.user.id);
  }

  @Post('search')
  @Roles('BARISTA', 'ADMIN')
  @ApiOperation({
    summary:
      'Получить все заказы с фильтрами по статусу и дате (бариста/админ)',
  })
  @ApiOkResponse({ type: Order, isArray: true })
  @ApiBody({ type: OrdersFilterDto })
  getAll(@Body() filters: OrdersFilterDto): Promise<Order[]> {
    return this.orders.getOrdersForBarista(filters);
  }

  @Patch(':id/status')
  @Roles('BARISTA', 'ADMIN')
  @ApiOperation({ summary: 'Изменить статус заказа (бариста)' })
  @ApiOkResponse({ type: Order })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orders.updateStatus(id, dto);
  }

  @Post(':id/reject')
  @Roles('BARISTA', 'ADMIN')
  @ApiOperation({ summary: 'Отклонить заказ с причиной (бариста)' })
  @ApiOkResponse({ type: Order })
  rejectOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectOrderDto,
  ): Promise<Order> {
    return this.orders.rejectOrder(id, dto);
  }
}

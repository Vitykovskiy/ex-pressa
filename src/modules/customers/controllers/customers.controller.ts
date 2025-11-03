import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomersService } from '../customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  // Создать клиента
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.service.create(dto);
  }

  // Список клиентов
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Клиент по id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  // Поиск по Telegram ID (удобно для админки/диагностики)
  @Get('by-tg/:tgId')
  findByTg(@Param('tgId') tgId: string) {
    return this.service.findByTgId(tgId);
  }

  // Обновить клиента
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.service.update(id, dto);
  }

  // Деактивировать клиента
  @Patch(':id/deactivate')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.service.deactivate(id);
  }

  // Создать или найти по Telegram ID (может пригодиться вебу, бот будет вызывать свой контроллер)
  @Post('by-tg')
  createOrFindByTg(@Body() dto: CreateCustomerDto) {
    return this.service.createOrFindByTgId(dto);
  }
}

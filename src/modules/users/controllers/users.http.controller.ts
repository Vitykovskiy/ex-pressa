import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { Roles } from '@modules/auth/roles.decorator';

@ApiTags('Пользователи')
@Controller('users')
export class UsersHttpController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles('ADMIN', 'BARISTA')
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiOkResponse({ type: User, isArray: true })
  findAll(): Promise<User[]> {
    return this.users.findAll();
  }

  @Post('me/confirm-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подать заявку на подтверждение аккаунта' })
  @ApiOkResponse({ type: User })
  requestConfirmation(@Req() req: Request): Promise<User> {
    const user = (req as Request & { user: User }).user;
    return this.users.requestConfirmation(user.id);
  }

  @Get('pending-confirmation')
  @Roles('BARISTA', 'ADMIN')
  @ApiOperation({
    summary: 'Список пользователей, ожидающих подтверждения (бариста)',
  })
  @ApiOkResponse({ type: User, isArray: true })
  getPendingConfirmation(): Promise<User[]> {
    return this.users.getPendingConfirmation();
  }

  @Patch(':id/confirm')
  @Roles('BARISTA', 'ADMIN')
  @ApiOperation({ summary: 'Подтвердить аккаунт пользователя (бариста)' })
  @ApiOkResponse({ type: User })
  confirmUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.users.confirmUser(id);
  }
}

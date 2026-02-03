import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { User } from '@modules/users';
import { Public } from './public.decorator';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Текущий пользователь' })
  me(@Req() req: Request): User {
    return (req as Request & { user: User }).user;
  }

  @Post('telegram')
  @ApiOperation({ summary: 'Авторизация через Telegram' })
  @Public()
  async telegram(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.handleTelegramAuth(req, res);
  }

  private async handleTelegramAuth(req: Request, res: Response) {
    const authHeader = req.headers['authorization'];

    const initData = this.getInitDataFromAuthHeader(authHeader);

    if (!initData) {
      throw new UnauthorizedException('Отсутствует заголовок Authorization');
    }

    const user = await this.auth.authTelegram(initData);
    const token = this.auth.issueToken(user);

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { ok: true, user };
  }

  private getInitDataFromAuthHeader(headerValue?: string): string {
    if (!headerValue) {
      return '';
    }

    const [authType, authData] = headerValue.split(' ');

    if (authType !== 'tma' || !authData) {
      return '';
    }

    return authData;
  }
}

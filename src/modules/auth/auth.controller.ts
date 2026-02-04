import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '@modules/users';
import { Public } from './public.decorator';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiCookieAuth('session')
  @ApiOkResponse({ type: User })
  me(@Req() req: Request): User {
    return (req as Request & { user: User }).user;
  }

  @Post('telegram')
  @ApiOperation({ summary: 'Авторизация через Telegram' })
  @ApiOkResponse({
    schema: {
      example: {
        ok: true,
        user: {
          id: 7,
          name: 'Alex Ivanov',
          tgId: '123456789',
          tgUsername: 'alex',
          isActive: true,
          createdAt: '2026-02-01T08:00:00.000Z',
          updatedAt: '2026-02-01T08:10:00.000Z',
          roles: [{ id: 1, code: 'USER', name: 'User' }],
        },
      },
    },
  })
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

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { User, UsersService } from '@modules/users';
import { verifyTelegramInitData } from './helpers';
import { SessionPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  private get telegramBotTokens(): string[] {
    const primary = this.config.get<string>('TELEGRAM_BOT_TOKEN', '');
    const extra = this.config.get<string>('TELEGRAM_BOT_TOKENS', '');

    return [primary, ...extra.split(',')]
      .map((token) => token.trim())
      .filter(
        (token, index, items) =>
          Boolean(token) && items.indexOf(token) === index,
      );
  }

  private get jwtSecret(): string {
    const secret = this.config.get<string>('AUTH_JWT_SECRET', '');
    if (!secret) {
      throw new Error('AUTH_JWT_SECRET отсутствует в .env');
    }
    return secret;
  }

  async authTelegram(initData: string): Promise<User> {
    const tokens = this.telegramBotTokens;
    let result = { ok: false, error: 'botToken пустой' } as ReturnType<
      typeof verifyTelegramInitData
    >;

    for (const token of tokens) {
      result = verifyTelegramInitData(initData, token);
      if (result.ok) {
        break;
      }
    }

    if (!result.ok) {
      throw new UnauthorizedException(result.error);
    }

    const tgUser = result.data.user;

    if (!tgUser?.id) {
      throw new BadRequestException('Telegram user отсутствует');
    }

    const name =
      [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ') ||
      tgUser.username ||
      'Пользователь';

    return this.users.createOrFindByTgId({
      tgId: String(tgUser.id),
      tgUsername: tgUser.username,
      name,
    });
  }

  issueToken(user: User): string {
    const payload: SessionPayload = { sub: user.id, tgId: user.tgId };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '30d' });
  }

  verifyToken(token: string): unknown {
    return jwt.verify(token, this.jwtSecret);
  }
}
